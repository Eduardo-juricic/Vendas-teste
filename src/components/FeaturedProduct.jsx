import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import featuredProductImagePlaceholder from "/src/assets/imagem-destaque.jpg"; //
import { getProdutoDestaque } from "../utils/firebaseUtils"; //
import { Eye } from "lucide-react"; // Ícone para o botão

function FeaturedProduct() {
  const [produtoDestaque, setProdutoDestaque] = useState(null); // Inicializa como null
  const [loading, setLoading] = useState(true); //
  const [error, setError] = useState(null); //

  useEffect(() => {
    const buscarDestaque = async () => {
      setLoading(true);
      setError(null);
      setProdutoDestaque(null); // Reseta produtoDestaque no início de cada busca
      try {
        const destaque = await getProdutoDestaque(); //
        if (destaque && destaque.id) {
          // Se encontrar um destaque válido
          setProdutoDestaque(destaque);
        }
        // Se não encontrar destaque válido, produtoDestaque permanece null, e o componente não renderizará.
      } catch (err) {
        console.error("Erro ao buscar produto destaque:", err); //
        setError(err); // Mantém o erro para exibir mensagem de erro
        // produtoDestaque permanece null
      } finally {
        setLoading(false); //
      }
    };

    buscarDestaque();
  }, []);

  const sectionVariants = {
    hidden: { opacity: 0, y: 50 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.8, ease: "easeOut", staggerChildren: 0.2 },
    },
  };

  const cardItemVariants = {
    hidden: { opacity: 0, x: -40 },
    visible: {
      opacity: 1,
      x: 0,
      transition: { duration: 0.7, ease: "circOut" },
    },
  };

  const contentItemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6, ease: "circOut", delay: 0.2 },
    },
  };

  // Placeholder para o estado de Loading do card de destaque
  const FeaturedCardPlaceholder = () => (
    <div className="max-w-5xl mx-auto bg-nude-white rounded-xl shadow-2xl md:flex md:items-stretch overflow-hidden animate-pulse">
      <div className="md:w-1/2 bg-nude-beige h-72 md:h-auto min-h-[300px] md:min-h-[450px]"></div>{" "}
      {/* Imagem Placeholder */}
      <div className="md:w-1/2 p-8 md:p-12 lg:p-16 flex flex-col justify-center text-center">
        <div className="h-10 bg-nude-beige-dark rounded w-3/4 mx-auto mb-6"></div>{" "}
        {/* Título Placeholder */}
        <div className="h-4 bg-nude-beige rounded w-full mb-3"></div>{" "}
        {/* Descrição Placeholder */}
        <div className="h-4 bg-nude-beige rounded w-full mb-3"></div>
        <div className="h-4 bg-nude-beige rounded w-5/6 mx-auto mb-8"></div>
        <div className="h-12 bg-nude-gold/50 rounded-lg w-2/3 mx-auto mt-auto"></div>{" "}
        {/* Botão Placeholder */}
      </div>
    </div>
  );

  if (loading) {
    return (
      <section className="bg-nude-off-white py-20 md:py-28 overflow-hidden">
        <div className="container mx-auto px-4">
          <motion.div
            className="text-center mb-12 md:mb-16"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 0.5, y: 0 }} // Animação sutil para o placeholder do título
            transition={{ duration: 0.6 }}
          >
            <div className="h-10 bg-nude-beige-dark/30 rounded w-1/2 mx-auto mb-4"></div>
            <div className="h-5 bg-nude-beige/50 rounded w-3/4 mx-auto"></div>
          </motion.div>
          <FeaturedCardPlaceholder />
        </div>
      </section>
    );
  }

  if (error) {
    // Mantém a exibição de erro, pois isso é diferente de "nenhum produto em destaque"
    return (
      <section className="bg-nude-off-white py-20 md:py-28 text-center flex flex-col items-center justify-center min-h-[50vh]">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-serif font-semibold text-red-600 mb-4">
            Oops! Algo Inesperado Aconteceu.
          </h2>
          <p className="text-xl text-nude-text font-sans mb-2">
            Não foi possível carregar nosso produto destaque no momento.
          </p>
          <p className="text-md text-nude-text-light font-sans">
            {error.message || "Por favor, tente novamente mais tarde."}
          </p>
        </div>
      </section>
    );
  }

  // Se não estiver carregando, não houver erro, E produtoDestaque for null, não renderiza nada.
  if (!produtoDestaque) {
    return null;
  }

  // Se chegou aqui, temos um produtoDestaque válido para exibir.
  const imageUrl =
    produtoDestaque.imageUrl ||
    produtoDestaque.imagem ||
    featuredProductImagePlaceholder; //

  return (
    <motion.section
      className="bg-nude-beige-light py-20 md:py-28 overflow-hidden"
      variants={sectionVariants}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.1 }}
    >
      <div className="container mx-auto px-4">
        <motion.div
          className="text-center mb-12 md:mb-16"
          initial={{ opacity: 0, y: -20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.6 }}
        >
          <h2 className="text-4xl md:text-5xl font-serif font-bold text-nude-gold-dark tracking-tight">
            {/* Ajuste o título da seção conforme necessário */}
            {produtoDestaque.nome
              ? "Nosso Destaque Exclusivo"
              : "Conheça Nossas Coleções"}
          </h2>
          <p className="mt-4 text-lg text-nude-text-light max-w-2xl mx-auto font-sans">
            Uma criação especial que captura a essência da beleza e sofisticação
            Nude.
          </p>
        </motion.div>

        <motion.div
          className="max-w-5xl mx-auto bg-nude-white rounded-2xl shadow-2xl md:flex md:items-stretch overflow-hidden
                     border border-nude-gold/10 hover:border-nude-gold/30 transition-colors duration-300"
          variants={cardItemVariants}
        >
          <div className="md:w-1/2">
            <img
              src={imageUrl}
              alt={produtoDestaque.nome || "Produto em destaque Nude"}
              className="w-full h-72 md:h-full object-cover md:min-h-[450px]" // Min height para desktop
            />
          </div>
          <motion.div
            className="md:w-1/2 p-8 md:p-12 lg:p-16 flex flex-col justify-center text-center md:text-left"
            variants={contentItemVariants}
          >
            <h3 className="text-3xl lg:text-4xl font-serif font-bold text-nude-gold-dark mb-5 leading-tight">
              {produtoDestaque.nome}{" "}
              {/* Já tem fallback no useEffect, não precisa de '|| "Nome Indisponível"' aqui */}
            </h3>
            <p className="text-nude-text text-base md:text-lg mb-8 leading-relaxed font-sans">
              {produtoDestaque.descricao}{" "}
              {/* Similarmente, o fallback já foi tratado */}
            </p>

            {produtoDestaque.id && ( // Não precisa mais checar isFallback aqui, pois só renderiza se produtoDestaque for válido
              <motion.div
                className="mt-auto text-center md:text-left"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4, duration: 0.5, ease: "easeOut" }}
                whileHover={{
                  scale: 1.05,
                  boxShadow: "0px 8px 15px rgba(184, 134, 11, 0.2)",
                }}
                whileTap={{ scale: 0.95 }}
              >
                <Link
                  to={`/produto/${produtoDestaque.id}`}
                  className="inline-flex items-center justify-center bg-nude-gold text-nude-white font-sans font-semibold
                            py-3.5 px-8 rounded-lg text-lg shadow-md hover:bg-nude-gold-dark
                            focus:outline-none focus:ring-2 focus:ring-nude-gold-light focus:ring-opacity-75
                            transition-all duration-300 ease-in-out"
                >
                  Ver Detalhes
                  <Eye size={20} className="ml-2.5" />
                </Link>
              </motion.div>
            )}
          </motion.div>
        </motion.div>
      </div>
    </motion.section>
  );
}

export default FeaturedProduct;
