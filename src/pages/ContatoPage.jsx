import React, { useState, useEffect } from "react";
import { GoogleMap, useJsApiLoader, MarkerF } from "@react-google-maps/api";
import { motion, AnimatePresence } from "framer-motion";

// --- IMPORTAÇÕES DO FIREBASE (SIMPLIFICADAS) ---
// Removemos as importações de 'app', 'getFunctions' e 'httpsCallable' pois não são mais necessárias aqui.
import { db } from "../FirebaseConfig";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";

// --- IMPORTAÇÕES DOS ÍCONES ---
import {
  Mail,
  Phone,
  MapPin,
  Send,
  Loader,
  CheckCircle,
  XCircle,
} from "lucide-react";

const ContatoPage = () => {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const [formData, setFormData] = useState({
    nome: "",
    email: "",
    mensagem: "",
  });
  const [status, setStatus] = useState({
    loading: false,
    success: false,
    error: null,
  });

  const { isLoaded, loadError } = useJsApiLoader({
    id: "google-map-script",
    googleMapsApiKey: import.meta.env.VITE_Maps_API_KEY,
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevState) => ({ ...prevState, [name]: value }));
    if (status.success || status.error) {
      setStatus({ loading: false, success: false, error: null });
    }
  };

  // =======================================================================
  // ✅ NOVA LÓGICA DE SUBMISSÃO (SALVA DIRETO NO FIRESTORE)
  // Esta função agora apenas salva a mensagem no banco de dados.
  // A Cloud Function será acionada AUTOMATICAMENTE a partir desta ação.
  // =======================================================================
  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus({ loading: true, success: false, error: null });

    try {
      // Tenta salvar os dados do formulário na nova coleção "mensagens".
      await addDoc(collection(db, "mensagens"), {
        ...formData,
        dataEnvio: serverTimestamp(),
      });

      // Se o salvamento no banco de dados deu certo, o processo do usuário terminou com sucesso.
      setStatus({ loading: false, success: true, error: null });
      setFormData({ nome: "", email: "", mensagem: "" });

      // Limpa a mensagem de sucesso da tela após 3 segundos.
      setTimeout(() => {
        setStatus({ loading: false, success: false, error: null });
      }, 3000);
    } catch (error) {
      // Se deu erro ao salvar no banco de dados, informa ao usuário.
      console.error("Erro ao salvar mensagem no Firestore: ", error);
      setStatus({
        loading: false,
        success: false,
        error: "Falha ao enviar. Tente novamente mais tarde.",
      });
    }
  };

  const containerStyle = { width: "100%", height: "400px" };
  const center = { lat: -22.875136, lng: -42.340123 };
  const mapOptions = {
    streetViewControl: false,
    mapTypeControl: false,
    fullscreenControl: false,
  };

  const isSubmitting = status.loading;
  const isSuccess = status.success;
  const isError = !!status.error;

  const buttonClass = isSuccess
    ? "bg-green-500"
    : isError
    ? "bg-red-500"
    : "bg-nude-gold hover:bg-nude-gold-dark";
  const buttonText = isSubmitting
    ? "Enviando..."
    : isSuccess
    ? "Enviado!"
    : isError
    ? "Tente Novamente"
    : "Enviar Mensagem";
  const ButtonIcon = isSubmitting
    ? Loader
    : isSuccess
    ? CheckCircle
    : isError
    ? XCircle
    : Send;

  return (
    <div className="bg-nude-off-white">
      <div className="container mx-auto px-4 py-16 md:py-24">
        <motion.div
          className="text-center mb-12"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <h1 className="text-4xl md:text-5xl font-serif font-bold text-nude-gold-dark">
            Entre em Contato
          </h1>
          <p className="mt-4 text-lg text-nude-text-light max-w-2xl mx-auto font-sans">
            Tem alguma dúvida ou sugestão? Adoraríamos ouvir você. Preencha o
            formulário ou utilize um dos canais abaixo.
          </p>
        </motion.div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          <motion.div
            className="lg:col-span-2 bg-white p-8 rounded-xl shadow-lg"
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.7, delay: 0.2 }}
          >
            <h2 className="text-2xl font-serif font-semibold text-nude-text mb-6">
              Envie sua Mensagem
            </h2>
            <form onSubmit={handleSubmit} className="space-y-6">
              <input
                type="text"
                name="nome"
                placeholder="Seu Nome Completo"
                value={formData.nome}
                onChange={handleInputChange}
                required
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-nude-gold-light"
              />
              <input
                type="email"
                name="email"
                placeholder="Seu E-mail"
                value={formData.email}
                onChange={handleInputChange}
                required
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-nude-gold-light"
              />
              <textarea
                name="mensagem"
                placeholder="Sua Mensagem"
                value={formData.mensagem}
                onChange={handleInputChange}
                required
                rows="5"
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-nude-gold-light"
              ></textarea>
              <motion.button
                type="submit"
                disabled={status.loading || status.success}
                className={`w-full text-white font-bold py-3 px-6 rounded-lg text-lg shadow-lg flex items-center justify-center transition-colors duration-300 disabled:opacity-70 ${buttonClass}`}
                whileTap={{ scale: 0.95 }}
                animate={isError ? { x: [-5, 5, -5, 5, 0] } : {}}
                transition={isError ? { duration: 0.3 } : {}}
              >
                <AnimatePresence mode="wait">
                  <motion.div
                    key={buttonText}
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    transition={{ duration: 0.2 }}
                    className="flex items-center justify-center"
                  >
                    <ButtonIcon
                      className={`mr-2 ${isSubmitting && "animate-spin"}`}
                    />
                    {buttonText}
                  </motion.div>
                </AnimatePresence>
              </motion.button>
              <div className="h-6 text-center">
                {isSuccess && (
                  <p className="text-green-600 flex items-center justify-center">
                    {" "}
                    <CheckCircle className="mr-2" /> Mensagem enviada com
                    sucesso!{" "}
                  </p>
                )}
                {isError && <p className="text-red-500">{status.error}</p>}
              </div>
            </form>
          </motion.div>
          <motion.div
            className="space-y-8"
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.7, delay: 0.4 }}
          >
            <div className="bg-white p-6 rounded-xl shadow-lg">
              <h3 className="text-xl font-serif font-semibold text-nude-text mb-4">
                {" "}
                Nossas Informações{" "}
              </h3>
              <div className="space-y-4 font-sans">
                <p className="flex items-center text-nude-text-light">
                  {" "}
                  <MapPin className="w-5 h-5 mr-3 text-nude-gold" /> Araruama,
                  RJ, Brasil{" "}
                </p>
                <p className="flex items-center text-nude-text-light">
                  {" "}
                  <Phone className="w-5 h-5 mr-3 text-nude-gold" /> (22)
                  99999-8888{" "}
                </p>
                <p className="flex items-center text-nude-text-light">
                  {" "}
                  <Mail className="w-5 h-5 mr-3 text-nude-gold" />{" "}
                  contato@artesanatostore.com{" "}
                </p>
              </div>
            </div>
            <div className="bg-white rounded-xl shadow-lg overflow-hidden">
              {loadError && (
                <div>Erro ao carregar o mapa. {loadError.message}</div>
              )}
              {isLoaded ? (
                <GoogleMap
                  mapContainerStyle={containerStyle}
                  center={center}
                  zoom={15}
                  options={mapOptions}
                >
                  {" "}
                  <MarkerF position={center} />{" "}
                </GoogleMap>
              ) : (
                <div className="w-full h-[400px] bg-gray-200 flex items-center justify-center">
                  {" "}
                  <Loader className="animate-spin text-nude-gold" />{" "}
                </div>
              )}
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default ContatoPage;
