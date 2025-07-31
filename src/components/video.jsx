import React from "react";
import { motion } from "framer-motion";
import { Sparkles, Palette, Gem } from "lucide-react"; // Ícones para as features

// Features para Perfumaria e Maquiagem "Nude"
const features = [
  {
    icon: <Sparkles className="w-full h-full" strokeWidth={1.5} />,
    title: "Fragrâncias Irresistíveis",
    description:
      "Descubra composições olfativas únicas, criadas com ingredientes nobres para despertar emoções e deixar uma marca inesquecível.",
  },
  {
    icon: <Palette className="w-full h-full" strokeWidth={1.5} />,
    title: "Cores que Celebram Você",
    description:
      "Explore uma paleta de maquiagens com texturas incríveis e pigmentação intensa, perfeitas para realçar sua beleza em cada detalhe.",
  },
  {
    icon: <Gem className="w-full h-full" strokeWidth={1.5} />,
    title: "Qualidade e Sofisticação",
    description:
      "Compromisso com a excelência em cada produto. Da embalagem ao último toque, uma experiência de luxo para você.",
  },
];

function Video() {
  const youtubeVideoId = "dQw4w9WgXcQ"; // ID do vídeo placeholder
  // CORREÇÃO APLICADA ABAIXO:
  const videoSrc = `https://www.youtube.com/embed/${youtubeVideoId}?autoplay=0&controls=1&modestbranding=1&rel=0&showinfo=0&iv_load_policy=3`;

  const sectionVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { duration: 0.5, ease: "easeOut" },
    },
  };

  const itemVariants = (delay = 0) => ({
    hidden: { opacity: 0, x: -30 },
    visible: {
      opacity: 1,
      x: 0,
      transition: { duration: 0.6, ease: "easeOut", delay },
    },
  });

  const videoItemVariants = {
    hidden: { opacity: 0, scale: 0.85 },
    visible: {
      opacity: 1,
      scale: 1,
      transition: { duration: 0.7, ease: [0.6, -0.05, 0.01, 0.99] },
    },
  };

  return (
    <motion.section
      id="nossa-essencia"
      className="py-20 md:py-28 bg-nude-beige-light overflow-hidden"
      variants={sectionVariants}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.1 }}
    >
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16 md:mb-20">
          <motion.h2
            className="text-4xl md:text-5xl font-serif font-bold text-nude-gold-dark"
            variants={videoItemVariants}
          >
            Revelando a Magia
          </motion.h2>
        </div>

        <div className="flex flex-col lg:flex-row items-center lg:items-start lg:gap-x-12 xl:gap-x-16">
          {/* Coluna do Vídeo */}
          <motion.div
            className="w-full lg:w-1/2 mb-12 lg:mb-0"
            variants={videoItemVariants}
          >
            <div
              className="relative aspect-video rounded-xl overflow-hidden
                         shadow-2xl border-2 border-nude-gold/40"
            >
              <iframe
                src={videoSrc} // A variável videoSrc corrigida é usada aqui
                title="Revelando a Magia Nude"
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                allowFullScreen
                className="absolute top-0 left-0 w-full h-full"
              ></iframe>
            </div>
            <motion.p
              className="mt-6 text-center lg:text-left text-nude-text font-sans text-lg"
              variants={itemVariants(0.2)}
            >
              Assista e sinta a dedicação e a arte que infundimos em cada
              perfume e maquiagem Nude.
            </motion.p>
          </motion.div>

          {/* Coluna das Features */}
          <div className="w-full lg:w-1/2 space-y-10">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                className="flex items-start gap-x-5"
                variants={itemVariants(index * 0.2 + 0.4)}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, amount: 0.3 }}
              >
                <div
                  className="mt-1 flex-shrink-0 w-12 h-12 p-2.5 flex items-center justify-center
                            bg-nude-gold/10 text-nude-gold rounded-full"
                >
                  {feature.icon}
                </div>
                <div>
                  <h3 className="text-2xl font-serif font-semibold text-nude-gold-dark mb-2">
                    {feature.title}
                  </h3>
                  <p className="text-base text-nude-text-light font-sans leading-relaxed">
                    {feature.description}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </motion.section>
  );
}

export default Video;
