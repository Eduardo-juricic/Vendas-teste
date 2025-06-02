// src/components/ContactCallToAction.jsx (Opção 1)
import React from "react";
import { motion } from "framer-motion";

const WhatsAppIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    className="h-6 w-6 inline-block mr-2"
    fill="currentColor"
    viewBox="0 0 24 24"
  >
    <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.626.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.289.173-1.413z" />
  </svg>
);

function ContactCallToAction() {
  const containerVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.7, ease: "easeOut", delay: 0.2 },
    },
  };

  const buttonVariants = {
    hover: {
      scale: 1.05,
      boxShadow: "0px 8px 20px rgba(0, 0, 0, 0.15)", // Sombra mais suave
      transition: { duration: 0.3, type: "spring", stiffness: 300 },
    },
    tap: { scale: 0.95 },
  };

  const whatsappNumber = "SEUNUMERODOTELEFONE";
  const whatsappMessage = encodeURIComponent(
    "Olá! Gostaria de mais informações sobre os perfumes e maquiagens da Nude."
  );
  const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${whatsappMessage}`;

  // Função auxiliar para variantes de item
  const itemVariantsAnim = (delay = 0) => ({
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { delay, duration: 0.6, ease: "easeOut" },
    },
  });

  return (
    <motion.section
      id="contato-section"
      // Fundo Nude Suave diretamente
      style={{ backgroundColor: "#F5F0E6" }} // Bege Suave
      className="py-16 md:py-24 text-center" // Classes Tailwind para padding e alinhamento
      variants={containerVariants}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.2 }}
    >
      <div className="container mx-auto px-4">
        <motion.h2
          // Estilo do Título com cor inline
          style={{ color: "#5D503C" }} // Marrom Acinzentado Escuro
          className="text-4xl md:text-5xl font-serif font-bold mb-6 leading-tight" // Classes Tailwind para tipografia e espaçamento
          variants={itemVariantsAnim(0)}
        >
          Fale Conosco
        </motion.h2>
        <motion.p
          // Estilo do Parágrafo com cor inline
          style={{ color: "#5D503C" }} // Marrom Acinzentado Escuro
          className="text-lg md:text-xl max-w-2xl mx-auto mb-10 font-sans" // Classes Tailwind
          variants={itemVariantsAnim(0.2)}
        >
          Tem alguma dúvida ou deseja uma consultoria personalizada sobre nossos
          perfumes e maquiagens? <br />
          Estamos à disposição no WhatsApp!
        </motion.p>
        <motion.a
          href={whatsappUrl}
          target="_blank"
          rel="noopener noreferrer"
          // Estilo do Botão com cores inline
          style={{
            backgroundColor: "#D4AF37", // Dourado Suave
            color: "#FFFFFF", // Texto Branco
          }}
          className="font-sans font-semibold py-4 px-10 rounded-lg text-xl shadow-lg
                     hover:opacity-90 focus:outline-none
                     inline-flex items-center uppercase tracking-wider" // Classes Tailwind
          variants={buttonVariants}
          whileHover="hover"
          whileTap="tap"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.5, ease: "easeOut" }}
        >
          <WhatsAppIcon />
          Conversar no WhatsApp
        </motion.a>
      </div>
    </motion.section>
  );
}

export default ContactCallToAction;
