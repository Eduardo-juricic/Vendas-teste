// functions/index.js

// --- IMPORTAÇÕES GERAIS (SINTAXE CORRIGIDA PARA V2) ---
const { onCall, onRequest } = require("firebase-functions/v2/https");
const { setGlobalOptions } = require("firebase-functions/v2");
const admin = require("firebase-admin");
const { logger } = require("firebase-functions");

// --- IMPORTAÇÕES DOS SERVIÇOS ---
const { MercadoPagoConfig, Preference, Payment } = require("mercadopago");

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

// ====================================================================================
// --- FUNÇÃO DE ENVIO DE E-MAIL (COM CORS E SINTAXE CORRIGIDOS) ---
// ====================================================================================

exports.sendMail = onCall(
  {
    secrets: [SENDGRID_SECRET_NAME],
    region: "southamerica-east1",
    // CORREÇÃO FINAL DE CORS: Usando a URL base do seu site na Vercel.
    cors: [/localhost:\d+/, "https://vendas-teste-alpha.vercel.app"],
  },
  async (request) => {
    const sgMail = require("@sendgrid/mail");
    const apiKey = process.env[SENDGRID_SECRET_NAME];

    if (!apiKey || !apiKey.startsWith("SG.")) {
      logger.error(
        "ERRO CRÍTICO EM SENDMAIL: SENDGRID_API_KEY não foi encontrada ou é inválida."
      );
      throw new onCall.HttpsError(
        "internal",
        "Erro de configuração do serviço de e-mail."
      );
    }
    sgMail.setApiKey(apiKey);

    const { nome, email, mensagem } = request.data;
    if (!nome || !email || !mensagem) {
      logger.error("Erro em sendMail: Dados do formulário ausentes.");
      throw new onCall.HttpsError(
        "invalid-argument",
        "Os campos 'nome', 'email' e 'mensagem' são obrigatórios."
      );
    }

    const msg = {
      to: "pri.ajuricic@gmail.com",
      from: {
        name: "Contato Site Juridic",
        email: "pri.ajuricic@gmail.com",
      },
      subject: `Nova mensagem do formulário de: ${nome}`,
      html: `<p><strong>Nome:</strong> ${nome}</p><p><strong>E-mail:</strong> ${email}</p><p><strong>Mensagem:</strong> ${mensagem}</p>`,
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
      throw new onCall.HttpsError(
        "internal",
        "Ocorreu um erro ao enviar o e-mail."
      );
    }
  }
);

// ====================================================================================
// --- FUNÇÕES DO MERCADO PAGO (COM CORS E ESTRUTURA CORRIGIDOS) ---
// ====================================================================================

const commonMercadoPagoOptions = {
  secrets: [PROD_SECRET_NAME, TEST_SECRET_NAME],
  // CORREÇÃO FINAL DE CORS: Usando a URL base do seu site na Vercel.
  cors: [/localhost:\d+/, "https://vendas-teste-alpha.vercel.app"],
};

exports.createPaymentPreference = onCall(
  commonMercadoPagoOptions,
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

// Webhook não precisa de CORS, pois é chamado pelo servidor do Mercado Pago.
exports.processPaymentNotification = onRequest(
  { secrets: [PROD_SECRET_NAME, TEST_SECRET_NAME] },
  async (req, res) => {
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
