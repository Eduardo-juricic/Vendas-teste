import React, { useState, useEffect } from "react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../FirebaseConfig";
import { useCart } from "../context/CartContext";
import Notification from "./Notification";
import { motion } from "framer-motion";
import { Element } from "react-scroll";
import { ShoppingCart } from "lucide-react"; // Ícone para o botão

function Products() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { addToCart } = useCart();
  const [notificationMessage, setNotificationMessage] = useState(null);

  const handleAddToCart = (product) => {
    addToCart(product);
    setNotificationMessage(
      `${product.nome || "Produto"} adicionado ao carrinho!`
    );
    setTimeout(() => {
      setNotificationMessage(null);
    }, 3000);
  };

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      try {
        const productsRef = collection(db, "produtos");
        const snapshot = await getDocs(productsRef);
        const productsList = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        const produtosNormais = productsList.filter(
          (product) => !product.destaque // Filtra produtos que não são destaque
        );
        setProducts(produtosNormais);
      } catch (err) {
        console.error("Erro ao buscar produtos:", err);
        setError(err);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  // Card Placeholder para o estado de Loading
  const ProductCardPlaceholder = () => (
    <div className="group bg-nude-white rounded-xl shadow-lg overflow-hidden flex flex-col animate-pulse">
      <div className="aspect-[4/5] w-full bg-nude-beige rounded-t-xl"></div>{" "}
      {/* Ajustado aspect-ratio e borda */}
      <div className="p-5 flex flex-col flex-grow items-center text-center">
        <div className="h-6 bg-nude-beige rounded w-3/4 mb-3"></div>{" "}
        {/* Nome do produto */}
        <div className="h-4 bg-nude-beige rounded w-full mb-2"></div>{" "}
        {/* Descrição linha 1 */}
        <div className="h-4 bg-nude-beige rounded w-5/6 mb-4"></div>{" "}
        {/* Descrição linha 2 */}
        <div className="h-8 bg-nude-beige-dark rounded w-1/3 mb-6"></div>{" "}
        {/* Preço */}
        <div className="h-12 bg-nude-gold/50 rounded-lg w-full"></div>{" "}
        {/* Botão */}
      </div>
    </div>
  );

  if (loading) {
    return (
      <section className="bg-nude-off-white py-16 md:py-24">
        <div className="container mx-auto px-4">
          <h2 className="text-4xl md:text-5xl font-serif font-bold mb-12 md:mb-16 text-nude-gold-dark text-center">
            Nossas Coleções
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-x-6 gap-y-10">
            {[...Array(4)].map((_, i) => (
              <ProductCardPlaceholder key={i} />
            ))}{" "}
            {/* Exibe 4 placeholders */}
          </div>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="bg-nude-off-white py-20 text-center">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-serif font-semibold text-red-600 mb-4">
            Oops! Algo deu errado.
          </h2>
          <p className="text-nude-text font-sans">
            Não foi possível carregar os produtos no momento. Tente novamente
            mais tarde.
          </p>
          {error.message && (
            <p className="text-sm text-nude-text-light mt-2 font-sans">
              Detalhe: {error.message}
            </p>
          )}
        </div>
      </section>
    );
  }

  if (products.length === 0) {
    return (
      <section className="bg-nude-off-white py-20 text-center">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-serif font-semibold text-nude-gold-dark mb-4">
            Em Breve Novidades
          </h2>
          <p className="text-nude-text font-sans">
            Nenhuma fragrância ou maquiagem encontrada no momento. Estamos
            preparando coleções incríveis para você!
          </p>
        </div>
      </section>
    );
  }

  const cardVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: (i) => ({
      opacity: 1,
      y: 0,
      transition: { duration: 0.5, delay: i * 0.07, ease: "easeOut" }, // Delay sutil para cada card
    }),
  };

  return (
    <Element name="produtos-section">
      <section className="bg-nude-beige-light py-16 md:py-24">
        {" "}
        {/* Fundo bege claro para a seção */}
        <div className="container mx-auto px-4">
          <motion.h2
            className="text-4xl md:text-5xl font-serif font-bold mb-12 md:mb-16 text-nude-gold-dark text-center"
            initial={{ opacity: 0, y: -20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.6 }}
          >
            Nossas Coleções {/* Título alterado para maior sofisticação */}
          </motion.h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-x-6 gap-y-10">
            {products.map((product, index) => (
              <motion.div
                key={product.id}
                className="group bg-nude-white rounded-xl shadow-lg
                           hover:shadow-nude-gold/10 hover:shadow-2xl
                           transition-all duration-300 ease-out overflow-hidden flex flex-col
                           border border-transparent hover:border-nude-gold/30"
                variants={cardVariants}
                custom={index}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, amount: 0.2 }}
              >
                <div className="relative aspect-[4/5] w-full overflow-hidden">
                  {" "}
                  {/* Ratio para perfumes/maquiagens */}
                  <img
                    src={
                      product.imagem ||
                      `https://via.placeholder.com/400x500/${"FFF8E7".substring(
                        1
                      )}/${"A07000".substring(1)}?text=${encodeURIComponent(
                        product.nome || "Nude"
                      )}`
                    } // Placeholder com cores Nude
                    alt={product.nome || "Perfume ou Maquiagem Nude"}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-400 ease-in-out"
                  />
                  {product.tag && ( // Se houver uma tag para o produto
                    <span className="absolute top-3 right-3 bg-nude-gold text-nude-white text-xs font-semibold px-3 py-1 rounded-full shadow-md">
                      {product.tag}
                    </span>
                  )}
                </div>
                <div className="p-5 flex flex-col flex-grow items-center text-center">
                  <h3 className="text-xl font-serif font-semibold text-nude-gold-dark mb-2 group-hover:text-nude-gold transition-colors">
                    {product.nome || "Produto Nude"}
                  </h3>
                  <p className="text-sm text-nude-text-light mb-3 flex-grow min-h-[40px] line-clamp-2 font-sans">
                    {product.descricaoCurta ||
                      (product.descricao &&
                        product.descricao.substring(0, 70) +
                          (product.descricao.length > 70 ? "..." : "")) ||
                      "Uma essência ou cor para realçar sua beleza."}
                  </p>
                  <p className="text-2xl font-semibold text-nude-gold mb-5 font-sans">
                    R${" "}
                    {product.preco
                      ? parseFloat(product.preco).toFixed(2).replace(".", ",")
                      : "0,00"}
                  </p>
                  <button
                    onClick={() => handleAddToCart(product)}
                    className="mt-auto bg-nude-gold text-nude-white hover:bg-nude-gold-dark
                               font-sans font-semibold py-3 px-6 rounded-lg transition-colors duration-300
                               focus:outline-none focus:ring-2 focus:ring-nude-gold-light focus:ring-opacity-70
                               w-full flex items-center justify-center gap-2 group-hover:scale-105 transform"
                  >
                    <ShoppingCart size={18} />
                    Comprar
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
        {notificationMessage && (
          <Notification
            message={notificationMessage}
            onClose={() => setNotificationMessage(null)}
            // Considere estilizar o Notification com a paleta Nude também
          />
        )}
      </section>
    </Element>
  );
}

export default Products;
