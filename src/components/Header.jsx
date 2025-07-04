import React, { useState, useEffect } from "react";
import { Link as RouterLink, useNavigate, useLocation } from "react-router-dom";
import { Link as ScrollLink, scroller } from "react-scroll";
import { ShoppingCart, Menu, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useCart } from "../context/CartContext";

const Header = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const { cartItems } = useCart();
  const navigate = useNavigate();
  const location = useLocation();

  const itemCount = cartItems
    ? cartItems.reduce((total, item) => total + item.quantity, 0)
    : 0;

  const toggleMenu = () => setIsMobileMenuOpen(!isMobileMenuOpen);

  useEffect(() => {
    const handleScrollEvent = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScrollEvent);
    return () => window.removeEventListener("scroll", handleScrollEvent);
  }, []);

  useEffect(() => {
    if (location.hash) {
      const section = location.hash.substring(1);
      setTimeout(() => {
        scroller.scrollTo(section, {
          duration: 800,
          delay: 0,
          smooth: "easeInOutQuart",
          offset: -90,
        });
      }, 100);
    }
  }, [location]);

  const navLinkClasses = (path) =>
    `font-sans text-nude-text hover:text-nude-gold transition-colors duration-300 py-2 ${
      location.pathname === path && !location.hash
        ? "text-nude-gold font-semibold border-b-2 border-nude-gold"
        : ""
    }`;

  const baseScrollAndRouterLinkClasses = `font-sans text-nude-text hover:text-nude-gold transition-colors duration-300 py-2 cursor-pointer`;
  const scrollLinkActiveClasses =
    "text-nude-gold font-semibold border-b-2 border-nude-gold";
  const iconButtonClasses =
    "text-nude-text hover:text-nude-gold transition-colors duration-300";

  const handleScrollToSectionMobile = (sectionId) => {
    setIsMobileMenuOpen(false);
    if (location.pathname === "/") {
      scroller.scrollTo(sectionId, {
        duration: 800,
        delay: 0,
        smooth: "easeInOutQuart",
        offset: -90,
      });
    } else {
      navigate(`/#${sectionId}`);
    }
  };

  const headerStyle = {
    backgroundColor:
      isScrolled || isMobileMenuOpen
        ? "rgba(245, 245, 220, 0.95)"
        : "transparent",
    transition: "background-color 0.3s ease-in-out",
  };

  const mobileMenuStyle = {
    backgroundColor: "rgba(245, 245, 220, 0.95)",
  };

  return (
    <header
      className={`sticky top-0 z-50 ${
        isScrolled || isMobileMenuOpen ? "shadow-md backdrop-blur-sm" : ""
      } border-b border-nude-gold/10`}
      style={headerStyle}
    >
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20 md:h-24">
          <RouterLink
            to="/"
            onClick={() => {
              if (location.pathname === "/") {
                window.scrollTo({ top: 0, behavior: "smooth" });
              }
            }}
            className="text-3xl md:text-4xl font-serif font-bold hover:opacity-80 transition-opacity"
            style={{ color: "#C6A98E" }}
          >
            Nude
          </RouterLink>

          <nav className="hidden md:flex space-x-8 items-center">
            <ScrollLink
              to="hero"
              spy={true}
              smooth={true}
              offset={-90}
              duration={500}
              className={baseScrollAndRouterLinkClasses}
              activeClass={scrollLinkActiveClasses}
            >
              Início
            </ScrollLink>
            <RouterLink to="/products" className={navLinkClasses("/products")}>
              Produtos
            </RouterLink>
            <ScrollLink
              to="nossa-essencia"
              spy={true}
              smooth={true}
              offset={-90}
              duration={500}
              className={baseScrollAndRouterLinkClasses}
              activeClass={scrollLinkActiveClasses}
            >
              Sobre Nós
            </ScrollLink>

            {/* ALTERADO: ScrollLink trocado por RouterLink */}
            <RouterLink to="/contato" className={navLinkClasses("/contato")}>
              Contato
            </RouterLink>
          </nav>

          <div className="flex items-center space-x-4 md:space-x-5">
            <button
              onClick={() => navigate("/carrinho")}
              className={`${iconButtonClasses} relative p-2`}
            >
              <ShoppingCart size={22} />
              {itemCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-nude-gold text-nude-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center animate-pulse">
                  {itemCount}
                </span>
              )}
            </button>
            <button
              onClick={toggleMenu}
              className="md:hidden text-nude-text hover:text-nude-gold p-2"
            >
              {isMobileMenuOpen ? <X size={26} /> : <Menu size={26} />}
            </button>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="md:hidden absolute top-full left-0 right-0 shadow-xl overflow-hidden"
            style={mobileMenuStyle}
          >
            <nav className="flex flex-col items-center space-y-5 px-4 py-8">
              <button
                onClick={() => handleScrollToSectionMobile("hero")}
                className={`font-sans text-nude-text hover:text-nude-gold transition-colors duration-300 py-2 text-lg`}
              >
                Início
              </button>
              <RouterLink
                to="/products"
                className={`${navLinkClasses("/products")} text-lg`}
                onClick={toggleMenu}
              >
                Produtos
              </RouterLink>
              <button
                onClick={() => handleScrollToSectionMobile("nossa-essencia")}
                className={`font-sans text-nude-text hover:text-nude-gold transition-colors duration-300 py-2 text-lg`}
              >
                Sobre Nós
              </button>

              {/* ALTERADO: 'button' com scroll trocado por RouterLink */}
              <RouterLink
                to="/contato"
                className={`${navLinkClasses("/contato")} text-lg`}
                onClick={toggleMenu}
              >
                Contato
              </RouterLink>

              <RouterLink
                to="/carrinho"
                className={`${navLinkClasses(
                  "/carrinho"
                )} text-lg flex items-center`}
                onClick={toggleMenu}
              >
                <ShoppingCart size={20} className="mr-2" />
                Carrinho
                {itemCount > 0 && (
                  <span className="ml-2 bg-nude-gold text-nude-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
                    {itemCount}
                  </span>
                )}
              </RouterLink>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
};

export default Header;
