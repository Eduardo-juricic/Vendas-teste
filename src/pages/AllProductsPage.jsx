// src/pages/AllProductsPage.jsx
import React, { useState, useEffect } from "react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../FirebaseConfig"; // Ajuste o caminho se necessário
import { useCart } from "../context/CartContext"; // Ajuste o caminho se necessário
import Notification from "../components/Notification"; // Ajuste o caminho se necessário
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import {
  ShoppingCart,
  Search as SearchIcon,
  ListFilter,
  X as XIcon,
} from "lucide-react";

// Categorias baseadas no seu Admin.jsx
const categoriasDisponiveis = [
  "Todos", // Opção para ver todas as categorias
  "Perfumes",
  "Maquiagens",
  "Hidratantes",
  "Infantil",
  "Outros",
];

// Card Placeholder para o estado de Loading
const ProductCardPlaceholder = () => (
  <div className="group bg-nude-white rounded-xl shadow-lg overflow-hidden flex flex-col animate-pulse">
    <div className="aspect-[4/5] w-full bg-nude-beige rounded-t-xl"></div>
    <div className="p-5 flex flex-col flex-grow items-center text-center">
      <div className="h-6 bg-nude-beige rounded w-3/4 mb-3"></div>
      <div className="h-4 bg-nude-beige rounded w-full mb-2"></div>
      <div className="h-4 bg-nude-beige rounded w-5/6 mb-4"></div>
      <div className="h-8 bg-nude-beige-dark rounded w-1/3 mb-6"></div>
      <div className="h-12 bg-nude-gold/50 rounded-lg w-full"></div>
    </div>
  </div>
);

function AllProductsPage() {
  const [allProducts, setAllProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { addToCart } = useCart();
  const [notificationMessage, setNotificationMessage] = useState(null);

  const [selectedCategory, setSelectedCategory] = useState("Todos");
  const [searchTerm, setSearchTerm] = useState("");
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    const fetchAllProducts = async () => {
      setLoading(true);
      setError(null);
      try {
        const productsRef = collection(db, "produtos");
        const snapshot = await getDocs(productsRef);
        const productsList = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setAllProducts(productsList);
        setFilteredProducts(productsList); // Inicialmente, mostra todos
      } catch (err) {
        console.error("Erro ao buscar todos os produtos:", err);
        setError(err);
      } finally {
        setLoading(false);
      }
    };
    fetchAllProducts();
  }, []);

  useEffect(() => {
    let productsToDisplay = [...allProducts];

    if (selectedCategory !== "Todos") {
      productsToDisplay = productsToDisplay.filter(
        (product) => product.categoria === selectedCategory
      );
    }

    if (searchTerm) {
      productsToDisplay = productsToDisplay.filter((product) =>
        product.nome.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    setFilteredProducts(productsToDisplay);
  }, [selectedCategory, searchTerm, allProducts]);

  const handleAddToCart = (product) => {
    addToCart(product);
    setNotificationMessage(
      `${product.nome || "Produto"} adicionado ao carrinho!`
    );
    setTimeout(() => {
      setNotificationMessage(null);
    }, 3000);
  };

  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: (i) => ({
      opacity: 1,
      y: 0,
      transition: { duration: 0.4, delay: i * 0.05, ease: "easeOut" },
    }),
  };

  if (error) {
    return (
      <div className="min-h-screen bg-nude-off-white py-20 px-4 text-center flex flex-col justify-center items-center">
        <h2 className="text-3xl font-serif font-semibold text-red-600 mb-4">
          Oops! Algo deu Errado.
        </h2>
        <p className="text-nude-text font-sans">
          Não foi possível carregar os produtos. Tente novamente mais tarde.
        </p>
        {error.message && (
          <p className="text-sm text-nude-text-light mt-2 font-sans">
            Detalhe: {error.message}
          </p>
        )}
      </div>
    );
  }

  return (
    <div className="bg-nude-off-white min-h-screen">
      <motion.div
        className="container mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <motion.h1
          className="text-4xl md:text-5xl font-serif font-bold text-nude-gold-dark text-center mb-10 md:mb-12"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
        >
          Nossos Produtos
        </motion.h1>

        {/* Controles de Filtro e Busca */}
        <div className="mb-10 md:mb-12 p-6 bg-nude-white rounded-xl shadow-lg">
          <div className="flex flex-col md:flex-row gap-6 items-center">
            {/* Botão para mostrar/esconder filtros em mobile */}
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="md:hidden bg-nude-gold text-nude-white px-4 py-2 rounded-lg font-sans flex items-center justify-center w-full mb-4"
            >
              <ListFilter size={18} className="mr-2" />{" "}
              {showFilters ? "Esconder Filtros" : "Mostrar Filtros"}
            </button>

            {/* Filtro de Categoria */}
            <div
              className={`flex-col md:flex-row md:flex items-center gap-3 ${
                showFilters ? "flex" : "hidden"
              } md:flex w-full md:w-auto`}
            >
              <label
                htmlFor="category-select"
                className="font-sans text-nude-text mr-2 mb-2 md:mb-0 whitespace-nowrap"
              >
                Filtrar por:
              </label>
              <select
                id="category-select"
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="font-sans p-3 border border-nude-gold/30 rounded-lg bg-white text-nude-text focus:ring-2 focus:ring-nude-gold-light focus:border-nude-gold-light w-full md:w-auto appearance-none"
                style={{
                  backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 20 20' fill='currentColor' class='w-5 h-5'%3E%3Cpath fill-rule='evenodd' d='M5.22 8.22a.75.75 0 0 1 1.06 0L10 11.94l3.72-3.72a.75.75 0 1 1 1.06 1.06l-4.25 4.25a.75.75 0 0 1-1.06 0L5.22 9.28a.75.75 0 0 1 0-1.06Z' clip-rule='evenodd' /%3E%3C/svg%3E")`,
                  backgroundRepeat: "no-repeat",
                  backgroundPosition: "right 0.75rem center",
                  paddingRight: "2.5rem",
                }}
              >
                {categoriasDisponiveis.map((cat) => (
                  <option key={cat} value={cat} className="font-sans">
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            {/* Barra de Busca */}
            <div className="relative flex-grow w-full md:w-auto mt-4 md:mt-0 md:ml-auto">
              <input
                type="text"
                placeholder="Buscar por nome..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="font-sans p-3 pl-10 border border-nude-gold/30 rounded-lg bg-white text-nude-text focus:ring-2 focus:ring-nude-gold-light focus:border-nude-gold-light w-full"
              />
              <SearchIcon
                size={20}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-nude-gold/70"
              />
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-nude-text hover:text-nude-gold"
                >
                  <XIcon size={18} />
                </button>
              )}
            </div>
          </div>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-x-6 gap-y-10">
            {[...Array(8)].map((_, i) => (
              <ProductCardPlaceholder key={i} />
            ))}{" "}
            {/* Mais placeholders para a página */}
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="text-center py-10">
            <motion.h3
              className="text-2xl font-serif text-nude-gold-dark mb-3"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              Nenhum Produto Encontrado
            </motion.h3>
            <motion.p
              className="text-nude-text font-sans"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              Tente ajustar seus filtros ou busca, ou explore todas as nossas
              categorias!
            </motion.p>
          </div>
        ) : (
          <motion.div
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-x-6 gap-y-10"
            // variants={containerVariantsAnim} // Opcional: para animar o container como um todo
            // initial="hidden"
            // animate="visible"
          >
            {filteredProducts.map((product, index) => (
              <motion.div
                key={product.id}
                className="group bg-nude-white rounded-xl shadow-lg
                           hover:shadow-nude-gold/10 hover:shadow-2xl
                           transition-all duration-300 ease-out overflow-hidden flex flex-col
                           border border-transparent hover:border-nude-gold/30"
                variants={cardVariants}
                custom={index}
                initial="hidden"
                animate="visible" // Usar animate em vez de whileInView para garantir animação ao filtrar
              >
                <Link to={`/produto/${product.id}`} className="block">
                  {" "}
                  {/* Link para detalhes do produto */}
                  <div className="relative aspect-[4/5] w-full overflow-hidden">
                    <img
                      src={
                        product.imagem ||
                        `https://via.placeholder.com/400x500/${"FFF8E7".substring(
                          1
                        )}/${"A07000".substring(1)}?text=${encodeURIComponent(
                          product.nome || "Nude"
                        )}`
                      }
                      alt={product.nome || "Perfume ou Maquiagem Nude"}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-400 ease-in-out"
                    />
                    {product.tag && (
                      <span className="absolute top-3 right-3 bg-nude-gold text-nude-white text-xs font-semibold px-3 py-1 rounded-full shadow-md">
                        {product.tag}
                      </span>
                    )}
                  </div>
                </Link>
                <div className="p-5 flex flex-col flex-grow items-center text-center">
                  <h3 className="text-xl font-serif font-semibold text-nude-gold-dark mb-2 group-hover:text-nude-gold transition-colors">
                    <Link to={`/produto/${product.id}`}>
                      {product.nome || "Produto Nude"}
                    </Link>
                  </h3>
                  {product.categoria && (
                    <p className="text-xs font-sans text-nude-gold bg-nude-gold/10 px-2 py-0.5 rounded-full inline-block mb-2">
                      {product.categoria}
                    </p>
                  )}
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
                    Adicionar
                  </button>
                </div>
              </motion.div>
            ))}
          </motion.div>
        )}
      </motion.div>
      {notificationMessage && (
        <Notification
          message={notificationMessage}
          onClose={() => setNotificationMessage(null)}
        />
      )}
    </div>
  );
}

export default AllProductsPage;
