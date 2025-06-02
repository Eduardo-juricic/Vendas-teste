// tailwind.config.js
/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        "nude-gold": {
          // Paleta Dourada para o Hero "Aura Dourada" e uso geral
          superLight: "#FAFAD2", // LightGoldenrodYellow - para brilhos bem sutis ou highlights no Hero
          lightShine: "#EEE8AA", // PaleGoldenrod - para as partículas ou detalhes luminosos no Hero
          baseShine: "#FFD700", // Gold - um dourado mais puro e vibrante para elementos de brilho no Hero
          DEFAULT: "#B8860B", // Seu Dourado principal (DarkGoldenRod) - Mantido para uso geral
          medium: "#DAA520", // Goldenrod - para textos ou elementos de destaque
          dark: "#A07000", // Seu dourado escuro original - ótimo para texto do título no Hero
          darkerContrast: "#8B4513", // SaddleBrown - para contraste muito forte, se necessário

          // Mantendo suas definições anteriores se ainda precisar delas para outros componentes
          lightest: "#FFF8DC", // Sua antiga 'lightest', pode ser útil
          light: "#F0E68C", // Sua antiga 'light', pode ser útil
          // 'darker' foi renomeado para 'darkerContrast' ou pode ser coberto pelo 'dark' existente.
        },
        "nude-beige": {
          light: "#F5F5DC",
          DEFAULT: "#E1C699",
          dark: "#D2B48C",
        },
        "nude-white": "#FFFFFF",
        "nude-off-white": "#FFF8E7", // Um off-white mais amarelado/creme para combinar com dourado (Hero)
        // Se precisar do seu #FAF0E6 original, pode criar uma variação como 'nude-off-white-linen'
        "nude-text": {
          // Sugestões para textos na paleta dourada
          DEFAULT: "#A07000", // Usar seu nude-gold-dark como texto padrão em fundos claros
          onGold: "#4A3B00", // Texto para ser usado SOBRE fundos dourados (precisa de contraste)
          light: "#D4AF37", // Seu nude-gold-light antigo para texto secundário

          // Mantendo suas definições de texto anteriores se preferir ou usar em outros contextos
          // Se quiser manter seu cinza como DEFAULT para o site todo, exceto o Hero:
          // generalDefault: "#363636",
          // generalLight: "#5A5A5A",
          // E no Hero, usaria classes específicas como text-nude-gold-dark, etc.
          // Por ora, deixei as sugestões para a paleta dourada.
        },
      },
      fontFamily: {
        serif: ['"Playfair Display"', "serif"],
        sans: ['"Montserrat"', "sans-serif"],
      },
      keyframes: {
        // Seu keyframe original de pulse
        pulse: {
          // Este é o seu keyframe 'pulse' original
          "0%, 100%": { opacity: "0.05" }, // Mantido do seu config inicial
          "50%": { opacity: "0.15" }, // Mantido do seu config inicial
        },
        // Keyframes das sugestões anteriores que você incorporou
        "subtle-pulse": {
          "0%, 100%": { opacity: 1, transform: "scale(1)" },
          "50%": { opacity: 0.9, transform: "scale(1.02)" },
        },
        "fade-in-up": {
          "0%": { opacity: "0", transform: "translateY(20px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        "slide-in-left": {
          "0%": { opacity: "0", transform: "translateX(-20px)" },
          "100%": { opacity: "1", transform: "translateX(0)" },
        },
        "reveal-text": {
          "0%": { opacity: "0", clipPath: "inset(0 100% 0 0)" },
          "100%": { opacity: "1", clipPath: "inset(0 0 0 0)" },
        },
        // Keyframe para o shimmer do Hero
        goldenShimmer: {
          "0%": { backgroundPosition: "0% 50%" },
          "50%": { backgroundPosition: "100% 50%" },
          "100%": { backgroundPosition: "0% 50%" },
        },
      },
      animation: {
        // Sua animação original de pulse
        pulse: "pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite", // Mantido do seu config inicial

        // Animações das sugestões anteriores que você incorporou
        "subtle-pulse": "subtle-pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite",
        "fade-in-up": "fade-in-up 0.6s ease-out forwards",
        "slide-in-left": "slide-in-left 0.6s ease-out forwards",
        "reveal-text": "reveal-text 1s ease-out forwards",

        // Animação para o shimmer do Hero
        "golden-shimmer": "goldenShimmer 10s linear infinite alternate", // Tempo ajustado como na última sugestão do Hero
      },
      backgroundImage: {
        // Seu backgroundImage original
        "pattern-light":
          "url(\"data:image/svg+xml,%3Csvg width='6' height='6' viewBox='0 0 6 6' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%23ffffff' fill-opacity='0.1' fill-rule='evenodd'%3E%3Cpath d='M5 0h1v1H0V0h5zM6 5v1H0V5h6z'/%3E%3C/g%3E%3C/svg%3E\")", // Mantido do seu config inicial
      },
    },
  },
  plugins: [
    // require('@tailwindcss/line-clamp'), // Descomente se for usar e instale
  ],
};
