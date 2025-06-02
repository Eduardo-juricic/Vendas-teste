import { motion } from "framer-motion";
import { ChevronDown, Sparkles } from "lucide-react";
import { useMemo } from "react";
import { useNavigate } from "react-router-dom"; // Importar useNavigate

// Componente para uma faísca dourada individual
const GoldenSparkle = ({ initialX, initialY, delay, size }) => {
  return (
    <motion.div
      className="absolute"
      style={{
        left: `${initialX}%`,
        top: `${initialY}%`,
        width: `${size}px`,
        height: `${size}px`,
        color: "#FFD700", // Cor DOURADA (Gold) para as faíscas
      }}
      initial={{ opacity: 0, scale: 0.5 }}
      animate={{ opacity: [0, 1, 0.8, 1, 0], scale: [0.5, 1.2, 0.7, 1.1, 0.5] }}
      transition={{
        duration: Math.random() * 1.5 + 1,
        repeat: Infinity,
        repeatDelay: Math.random() * 3 + 2,
        delay: delay,
        ease: "easeInOut",
      }}
    >
      <Sparkles className="w-full h-full" fill="currentColor" />
    </motion.div>
  );
};

const Hero = () => {
  const navigate = useNavigate(); // Inicializar useNavigate

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.3, delayChildren: 0.2 },
    },
  };

  const itemVariants = (delay = 0) => ({
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.8, ease: [0.6, -0.05, 0.01, 0.99], delay },
    },
  });

  const titleWordVariants = {
    hidden: { opacity: 0, y: "100%" },
    visible: (i) => ({
      opacity: 1,
      y: "0%",
      transition: { delay: i * 0.08, duration: 0.7, ease: [0.42, 0, 0.58, 1] },
    }),
  };

  const titleText = "Arte em Perfumes";
  const subtitleText =
    "Explore coleções exclusivas de perfumes e maquiagens que realçam o seu brilho natural e singular.";

  const numSparkles = 30;

  const sparklesData = useMemo(() => {
    return Array.from({ length: numSparkles }).map(() => ({
      id: Math.random().toString(36).substring(7),
      initialX: Math.random() * 100,
      initialY: Math.random() * 100,
      delay: Math.random() * 4,
      size: Math.random() * 10 + 6,
    }));
  }, [numSparkles]);

  return (
    <section
      id="hero"
      className="relative h-[calc(100vh-80px)] min-h-[700px] md:h-[calc(100vh-96px)]
                 flex flex-col items-center justify-center text-center overflow-hidden"
      style={{
        background:
          "linear-gradient(to bottom right, #F0E68C, #B8860B, #DAA520)",
      }}
    >
      <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
        {sparklesData.map(({ id, initialX, initialY, delay, size }) => (
          <GoldenSparkle
            key={id}
            initialX={initialX}
            initialY={initialY}
            delay={delay}
            size={size}
          />
        ))}
      </div>

      <motion.div
        className="relative z-10 p-6 max-w-3xl"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <h1
          className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-serif font-extrabold mb-6 leading-tight"
          style={{
            color: "#FFF8E7",
            textShadow: "0px 2px 8px rgba(100, 70, 0, 0.7)",
          }}
        >
          {titleText.split(" ").map((word, index) => (
            <span
              key={index}
              className="inline-block overflow-hidden pb-2 mr-2 sm:mr-3"
            >
              <motion.span
                custom={index}
                variants={titleWordVariants}
                className="inline-block"
              >
                {word}
              </motion.span>
            </span>
          ))}
        </h1>

        <motion.p
          className="text-base sm:text-lg md:text-xl max-w-xl mx-auto mb-10 font-sans leading-relaxed"
          style={{
            color: "#FAFAD2",
            textShadow: "0px 1px 5px rgba(100, 70, 0, 0.5)",
          }}
          variants={itemVariants(0.6)}
        >
          {subtitleText}
        </motion.p>

        <motion.button
          onClick={() => navigate("/products")} // Navega para /products
          className="font-sans font-semibold py-3.5 px-10 sm:py-4 sm:px-12 rounded-lg text-lg
                    shadow-lg hover:shadow-xl
                    transition-all duration-300 ease-in-out transform hover:scale-105
                    focus:outline-none"
          style={{
            backgroundColor: "#A07000",
            color: "#FFF8E7",
            border: "2px solid #EEE8AA",
          }}
          variants={itemVariants(1)}
          whileHover={{
            scale: 1.08,
            boxShadow: "0px 10px 30px rgba(100, 70, 0, 0.6)",
            backgroundColor: "#DAA520",
            borderColor: "#FFD700",
          }}
          whileTap={{ scale: 0.98 }}
        >
          Descobrir Produtos
        </motion.button>
      </motion.div>

      <motion.div
        className="absolute bottom-8 sm:bottom-10 left-1/2 -translate-x-1/2 z-10"
        onClick={() => navigate("/products")} // Navega para /products
        style={{ cursor: "pointer" }}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{
          delay: 2,
          duration: 0.8,
          repeat: Infinity,
          repeatType: "reverse",
          ease: "easeInOut",
        }}
      >
        <ChevronDown
          size={38}
          style={{ color: "#FAFAD2" }}
          className="drop-shadow-lg transition-colors hover:opacity-80"
        />
      </motion.div>
    </section>
  );
};

export default Hero;
