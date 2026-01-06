const { fontFamily } = require("tailwindcss/defaultTheme");

module.exports = {
  mode: "jit",
  purge: ["./index.html", "./src/**/*.{vue,js,ts,jsx,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ["Inter var", ...fontFamily.sans],
        mono: ["Geist Mono", ...fontFamily.mono], // Suggesting a tech/premium mono font if available, or fallback
      },
      borderRadius: {
        DEFAULT: "8px",
        secondary: "4px",
        container: "16px",
      },
      boxShadow: {
        DEFAULT: "0 1px 4px rgba(0, 0, 0, 0.1)",
        hover: "0 8px 30px rgba(0, 0, 0, 0.5)",
        glow: "0 0 20px rgba(255, 255, 255, 0.1)",
        glass: "0 8px 32px rgba(0, 0, 0, 0.5)",
        premium: "0 0 20px rgba(255, 255, 255, 0.15)",
        'premium-hover': "0 0 30px rgba(255, 255, 255, 0.25)",
      },
      colors: {
        obsidian: {
          DEFAULT: "#0B0C10",
          light: "#1F2833",
          card: "#12141C",
        },
        charcoal: {
          DEFAULT: "#1F2833",
          light: "#2a3645",
        },
        silver: {
          DEFAULT: "#C5C6C7",
          dark: "#9CA3AF",
        },
        cyan: {
          DEFAULT: "#66FCF1", // Keeping one sharp accent
          dim: "#45A29E",
        }
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'metallic-gradient': 'linear-gradient(135deg, #374151 0%, #111827 50%, #000000 100%)',
        'subtle-gradient': 'linear-gradient(to bottom right, #1f2937, #111827)',
        'premium-gradient': 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 50%, #a855f7 100%)', // Adding premium gradient
      },
      animation: {
        'fade-in': 'fadeIn 0.7s cubic-bezier(0.16, 1, 0.3, 1)',
        'slide-up': 'slideUp 0.8s cubic-bezier(0.16, 1, 0.3, 1)',
        'float': 'float 6s ease-in-out infinite',
        'slow-pan': 'pan 20s linear infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0', transform: 'translateY(10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        slideUp: {
          '0%': { transform: 'translateY(40px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-15px)' },
        },
        pan: {
          '0%': { backgroundPosition: '0% 50%' },
          '100%': { backgroundPosition: '100% 50%' },
        }
      },
      spacing: {
        "form-field": "16px",
        section: "40px",
      },
    },
  },
  variants: {
    extend: {
      boxShadow: ["hover", "active"],
    },
  },
};
