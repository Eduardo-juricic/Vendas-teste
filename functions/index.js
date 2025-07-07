// functions/index.js

// --- IMPORTAÇÕES GERAIS ---
const functions = require("firebase-functions/v2/https");
const { setGlobalOptions } = require("firebase-functions/v2");
const admin = require("firebase-admin");
const { logger } = require("firebase-functions");

// --- IMPORTAÇÕES DOS SERVIÇOS ---
const { MercadoPagoConfig, Preference, Payment } = require("mercadopago");
// A linha 'require("@sendgrid/mail")' foi REMOVIDA daqui e será chamada dentro da função.

// --- INICIALIZAÇÃO DO FIREBASE ADMIN ---
if (admin.apps.length === 0) {
  admin.initializeApp();
}

// --- CONFIGURAÇÕES GLOBAIS DAS FUNÇÕES ---
setGlobalOptions({
  region: "southamerica-east1",
  memory: "256MiB",
  timeoutSeconds: 60,
});

// --- NOMES DOS SECRETS ---
const PROD_SECRET_NAME = "MERCADOPAGO_ACCESS_TOKEN_PROD";
const TEST_SECRET_NAME = "MERCADOPAGO_ACCESS_TOKEN_TEST";
const SENDGRID_SECRET_NAME = "SENDGRID_API_KEY";

// --- FUNÇÃO AUXILIAR PARA OBTER O CLIENTE DO MERCADO PAGO ---
// Esta função agora contém a lógica de verificação, isolando o problema.
const getMercadoPagoClient = () => {
  const isProductionEnvironment = !!process.env.K_SERVICE;
  let accessToken;

  if (isProductionEnvironment) {
    accessToken = process.env[PROD_SECRET_NAME];
    if (!accessToken) {
      logger.error(
        `ERRO CRÍTICO: Rodando em PRODUÇÃO mas o secret '${PROD_SECRET_NAME}' não foi encontrado.`
      );
      throw new functions.HttpsError(
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

// ====================================================================================
// --- FUNÇÃO DE ENVIO DE E-MAIL COM SENDGRID (VERSÃO FINAL) ---
// ====================================================================================

exports.sendMail = functions.onCall(
  {
    secrets: [SENDGRID_SECRET_NAME],
    region: "southamerica-east1",
  },
  async (request) => {
    // CORREÇÃO: O 'require' e a configuração da chave são feitos AQUI DENTRO.
    const sgMail = require("@sendgrid/mail");
    const apiKey = process.env[SENDGRID_SECRET_NAME];

    if (!apiKey || !apiKey.startsWith("SG.")) {
      logger.error(
        "ERRO CRÍTICO EM SENDMAIL: SENDGRID_API_KEY não foi encontrada ou é inválida."
      );
      throw new functions.HttpsError(
        "internal",
        "Erro de configuração do serviço de e-mail."
      );
    }
    sgMail.setApiKey(apiKey);

    const { nome, email, mensagem } = request.data;
    if (!nome || !email || !mensagem) {
      logger.error("Erro em sendMail: Dados do formulário ausentes.");
      throw new functions.HttpsError(
        "invalid-argument",
        "Os campos 'nome', 'email' e 'mensagem' são obrigatórios."
      );
    }

    const msg = {
      to: "pri.ajuricic@gmail.com", // Seu e-mail de destino
      from: {
        name: "Contato Site", // O nome que aparecerá no e-mail
        email: "pri.ajuricic@gmail.com", // IMPORTANTE: Seu e-mail verificado no SendGrid
      },
      subject: `Nova mensagem do formulário de: ${nome}`,
      html: `
          <h1>Nova mensagem de contato recebida</h1>
          <p><strong>Nome:</strong> ${nome}</p>
          <p><strong>E-mail de resposta:</strong> ${email}</p>
          <hr>
          <p><strong>Mensagem:</strong></p>
          <p>${mensagem}</p>
        `,
      replyTo: email,
    };

    try {
      await sgMail.send(msg);
      logger.info(`E-mail enviado com sucesso via SendGrid para ${msg.to}`);
      return { success: true };
    } catch (error) {
      logger.error(
        "Erro CRÍTICO ao enviar e-mail com SendGrid:",
        error.response?.body || error.message
      );
      throw new functions.HttpsError(
        "internal",
        "Ocorreu um erro ao enviar o e-mail."
      );
    }
  }
);

// ====================================================================================
// --- FUNÇÕES DO MERCADO PAGO (COM LÓGICA DE CLIENTE CORRIGIDA) ---
// ====================================================================================

const commonMercadoPagoOptions = {
  secrets: [PROD_SECRET_NAME, TEST_SECRET_NAME],
};

exports.createPaymentPreference = functions.onCall(
  commonMercadoPagoOptions,
  async (request) => {
    // A verificação acontece aqui, de forma segura.
    const client = getMercadoPagoClient();
    const data = request.data;
    const { items, payerInfo, externalReference, backUrls, notificationUrl } =
      data;

    if (!items || !Array.isArray(items) || items.length === 0) {
      throw new functions.HttpsError(
        "invalid-argument",
        "A lista de 'items' é obrigatória."
      );
    }
    if (!payerInfo || !payerInfo.email) {
      throw new functions.HttpsError(
        "invalid-argument",
        "As 'payerInfo' com 'email' são obrigatórias."
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
      throw new functions.HttpsError(
        "internal",
        "Falha ao criar preferência de pagamento."
      );
    }
  }
);

exports.processPaymentNotification = functions.onRequest(
  commonMercadoPagoOptions,
  async (req, res) => {
    // A verificação acontece aqui, de forma segura.
    const client = getMercadoPagoClient();
    if (req.method !== "POST") {
      return res.status(405).send("Method Not Allowed.");
    }

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
    return res.status(200).send("Notificação recebida, mas não processada.");
  }
);
