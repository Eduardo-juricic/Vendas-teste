// functions/index.js

// --- IMPORTAÇÕES DOS SERVIÇOS ---
const admin = require("firebase-admin");
const nodemailer = require("nodemailer");
const { MercadoPagoConfig, Preference, Payment } = require("mercadopago");

// --- IMPORTAÇÕES DA BIBLIOTECA FIREBASE FUNCTIONS V2 ---
// Importamos tudo da versão mais nova e consistente
const { onCall, onRequest } = require("firebase-functions/v2/https");
const { onDocumentCreated } = require("firebase-functions/v2/firestore");
const { logger } = require("firebase-functions");
// ✅ IMPORTAÇÃO CORRETA PARA PARÂMETROS
const { defineString } = require("firebase-functions/params");

// --- INICIALIZAÇÃO DO FIREBASE ADMIN ---
if (admin.apps.length === 0) {
  admin.initializeApp();
}

// ====================================================================================
// SEÇÃO 1: CONFIGURAÇÃO E FUNÇÃO DE E-MAIL COM NODEMAILER (V2 E PARÂMETROS)
// ====================================================================================

// ✅ DEFINIÇÃO DOS PARÂMETROS DE AMBIENTE
// A função vai ler as credenciais destes parâmetros, que serão fornecidos no deploy.
const GMAIL_EMAIL = defineString("GMAIL_EMAIL");
const GMAIL_PASSWORD = defineString("GMAIL_PASSWORD");

// ✅ FUNÇÃO DE E-MAIL REESCRITA COM SINTAXE V2
// Esta função é acionada quando um novo documento é criado na coleção "mensagens".
exports.enviarEmailDeContato = onDocumentCreated(
  {
    document: "mensagens/{mensagemId}",
    region: "southamerica-east1",
    memory: "256MiB",
    // ✅ Informa à função que ela precisa dos parâmetros definidos acima
    params: [GMAIL_EMAIL, GMAIL_PASSWORD],
  },
  async (event) => {
    const snap = event.data;
    if (!snap) {
      logger.error("Nenhum dado recebido no evento de criação de mensagem.");
      return;
    }

    // ✅ Cria o transportador de e-mail DENTRO da função, usando os parâmetros
    const mailTransport = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: GMAIL_EMAIL.value(), // Lê o valor do parâmetro
        pass: GMAIL_PASSWORD.value(), // Lê o valor do parâmetro
      },
    });

    const dadosDaMensagem = snap.data();
    const { nome, email, mensagem } = dadosDaMensagem;
    logger.log(`Nova mensagem de ${nome} (${email}). Enviando notificação.`);

    const mailOptions = {
      from: `"Formulário do Site" <${GMAIL_EMAIL.value()}>`,
      to: "pri.ajuricic@gmail.com",
      subject: `Nova mensagem de contato de: ${nome}`,
      html: `
            <div style="font-family: Arial, sans-serif; line-height: 1.6;">
                <h2>Nova Mensagem do Site</h2>
                <p>Você recebeu uma nova mensagem através do formulário de contato.</p>
                <hr>
                <p><strong>Nome:</strong> ${nome}</p>
                <p><strong>E-mail do remetente:</strong> ${email}</p>
                <p><strong>Mensagem:</strong></p>
                <blockquote style="border-left: 4px solid #ccc; padding-left: 16px; margin: 0;">
                  <p>${mensagem}</p>
                </blockquote>
            </div>
        `,
    };

    try {
      await mailTransport.sendMail(mailOptions);
      logger.log("E-mail de notificação enviado com sucesso.");
      return snap.ref.update({ statusEmail: "Enviado com sucesso" });
    } catch (error) {
      logger.error("Erro CRÍTICO ao enviar e-mail com Nodemailer:", error);
      return snap.ref.update({
        statusEmail: "Falha no envio",
        erro: error.message,
      });
    }
  }
);

// ====================================================================================
// SEÇÃO 2: FUNÇÕES DO MERCADO PAGO (V2 - SEM ALTERAÇÃO)
// ====================================================================================
const PROD_SECRET_NAME = "MERCADOPAGO_ACCESS_TOKEN_PROD";
const TEST_SECRET_NAME = "MERCADOPAGO_ACCESS_TOKEN_TEST";

const getMercadoPagoClient = () => {
  const isProductionEnvironment = !!process.env.K_SERVICE;
  let accessToken;

  if (isProductionEnvironment) {
    accessToken = process.env[PROD_SECRET_NAME];
    if (!accessToken) {
      logger.error(
        `ERRO CRÍTICO: Rodando em PRODUÇÃO mas o secret '${PROD_SECRET_NAME}' não foi encontrado.`
      );
      throw new onCall.HttpsError(
        "internal",
        `Configuração de pagamento de produção ausente.`
      );
    }
  } else {
    accessToken =
      process.env[TEST_SECRET_NAME] ||
      "TEST-2041651583950402-051909-c6b895278dbff8c34731dd86d4c95c67-98506488";
  }
  return new MercadoPagoConfig({ accessToken });
};

// Opções comuns para as funções do Mercado Pago
const mercadopagoHttpOptions = {
  region: "southamerica-east1",
  memory: "256MiB",
  timeoutSeconds: 60,
  secrets: [PROD_SECRET_NAME, TEST_SECRET_NAME],
  cors: [/localhost:\d+/, "https://vendas-teste-alpha.vercel.app"],
};

exports.createPaymentPreference = onCall(
  mercadopagoHttpOptions,
  async (request) => {
    const client = getMercadoPagoClient();
    const { items, payerInfo, externalReference, backUrls, notificationUrl } =
      request.data;

    if (!items || !Array.isArray(items) || items.length === 0) {
      throw new onCall.HttpsError(
        "invalid-argument",
        "A lista de 'items' é obrigatória."
      );
    }
    if (!payerInfo || !payerInfo.email) {
      throw new onCall.HttpsError(
        "invalid-argument",
        "As 'payerInfo' com 'email' são obrigatórias."
      );
    }
    if (!backUrls || !backUrls.success || !backUrls.failure) {
      throw new onCall.HttpsError(
        "invalid-argument",
        "As 'backUrls' são obrigatórias."
      );
    }

    const preferenceRequest = {
      items: items.map((item) => ({
        id: String(item.id || "item-default-id"),
        title: String(item.title || "Produto"),
        description: String(item.description || item.title),
        quantity: Number(item.quantity),
        unit_price: Number(item.unit_price),
        currency_id: "BRL",
      })),
      payer: {
        name: String(payerInfo.name || ""),
        surname: String(payerInfo.surname || ""),
        email: String(payerInfo.email),
      },
      back_urls: {
        success: String(backUrls.success),
        failure: String(backUrls.failure),
        pending: String(backUrls.pending || backUrls.success),
      },
      auto_return: "approved",
      external_reference: String(externalReference),
      notification_url: String(notificationUrl),
    };

    try {
      const preference = new Preference(client);
      const response = await preference.create({ body: preferenceRequest });
      return { id: response.id, init_point: response.init_point };
    } catch (error) {
      logger.error(
        "Erro ao criar preferência MP:",
        error.cause || error.message
      );
      throw new onCall.HttpsError(
        "internal",
        "Falha ao criar preferência de pagamento."
      );
    }
  }
);

exports.processPaymentNotification = onRequest(
  {
    region: "southamerica-east1",
    memory: "256MiB",
    timeoutSeconds: 60,
    secrets: [PROD_SECRET_NAME, TEST_SECRET_NAME],
  },
  async (req, res) => {
    if (req.method !== "POST") {
      return res.status(405).send("Method Not Allowed.");
    }

    logger.info("Webhook do Mercado Pago recebido:", req.body);
    const client = getMercadoPagoClient();
    const type = req.body.type;
    const paymentIdFromBody = req.body.data?.id;

    if (type === "payment" && paymentIdFromBody) {
      try {
        const payment = new Payment(client);
        const paymentDetails = await payment.get({
          id: String(paymentIdFromBody),
        });

        if (paymentDetails && paymentDetails.external_reference) {
          const pedidoRef = admin
            .firestore()
            .collection("pedidos")
            .doc(paymentDetails.external_reference);
          await pedidoRef.update({
            statusPagamentoMP: paymentDetails.status,
            paymentIdMP: String(paymentIdFromBody),
            dadosCompletosPagamentoMP: paymentDetails,
            ultimaAtualizacaoWebhook:
              admin.firestore.FieldValue.serverTimestamp(),
          });
          logger.info(
            `Pedido ${paymentDetails.external_reference} atualizado para status: ${paymentDetails.status}.`
          );
        }
        return res.status(200).send("OK.");
      } catch (error) {
        logger.error(
          `Erro ao processar notificação para ${paymentIdFromBody}:`,
          error.cause || error.message
        );
        return res.status(500).send("Erro interno ao processar pagamento.");
      }
    }
    return res.status(200).send("Notificação recebida, mas não requer ação.");
  }
);

// Adicione este código ao final do seu arquivo functions/index.js

/**
 * Helper para escapar campos para o formato CSV.
 * Garante que vírgulas e aspas dentro dos campos não quebrem o arquivo.
 * @param {any} field O dado a ser escapado.
 * @returns {string} O dado formatado para CSV.
 */
const escapeCsvField = (field) => {
  let fieldStr = String(field || "").trim();
  // Se o campo contém vírgula, aspas ou quebra de linha, envolve com aspas duplas.
  if (
    fieldStr.includes(",") ||
    fieldStr.includes('"') ||
    fieldStr.includes("\n")
  ) {
    // Escapa as aspas duplas existentes dentro do campo duplicando-as.
    fieldStr = fieldStr.replace(/"/g, '""');
    return `"${fieldStr}"`;
  }
  return fieldStr;
};

/**
 * Função HTTP que gera um feed de produtos em formato CSV para o Meta Commerce.
 * Este endpoint será acessado pela Meta para sincronizar seu catálogo.
 */
exports.gerarCatalogoMeta = onRequest(
  // Opções da função
  {
    region: "southamerica-east1", // Mesma região das suas outras funções
    memory: "256MiB",
  },
  async (req, res) => {
    try {
      // 1. Define o cabeçalho do CSV com os campos exigidos pela Meta.
      const headers = [
        "id",
        "title",
        "description",
        "availability",
        "condition",
        "price",
        "link",
        "image_link",
        "brand",
      ];

      const siteUrl = "https://vendas-teste-alpha.vercel.app"; // IMPORTANTE: Substitua pelo seu domínio quando tiver um!

      // 2. Busca todos os documentos da coleção 'produtos' no Firestore.
      const produtosSnapshot = await admin
        .firestore()
        .collection("produtos")
        .get();

      const rows = produtosSnapshot.docs.map((doc) => {
        const produto = doc.data();

        // 3. Define o preço final, dando prioridade ao preço promocional se for válido.
        const precoFinal =
          produto.preco_promocional &&
          Number(produto.preco_promocional) < Number(produto.preco)
            ? Number(produto.preco_promocional)
            : Number(produto.preco);

        // 4. Mapeia os dados do seu produto para o formato da Meta.
        const productData = {
          id: doc.id,
          title: produto.nome || "",
          description:
            produto.descricao || "Confira este incrível produto da Nude.",
          availability: "in stock",
          condition: "new",
          price: `${precoFinal.toFixed(2)} BRL`,
          link: `${siteUrl}/produto/${doc.id}`, // Cria o link direto para a página do produto
          image_link: produto.imagem || "",
          brand: "Nude",
        };

        // 5. Cria uma linha do CSV, escapando cada campo corretamente.
        return headers
          .map((header) => escapeCsvField(productData[header]))
          .join(",");
      });

      // 6. Combina cabeçalho e linhas para formar o conteúdo CSV completo.
      const csvContent = [headers.join(","), ...rows].join("\n");

      // 7. Define os cabeçalhos da resposta HTTP para que a Meta entenda que é um arquivo CSV.
      res.setHeader("Content-Type", "text/csv");
      res.setHeader(
        "Content-Disposition",
        'attachment; filename="meta_catalog.csv"'
      );

      // 8. Envia o conteúdo CSV como resposta.
      res.status(200).send(csvContent);
    } catch (error) {
      logger.error("Erro ao gerar catálogo para Meta:", error);
      res.status(500).send("Erro interno ao gerar o catálogo de produtos.");
    }
  }
);
