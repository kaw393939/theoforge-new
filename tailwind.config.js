const { fontFamily } = require('tailwindcss/defaultTheme');
const defaultTheme = require('tailwindcss/defaultTheme');

/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ["class"], 
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
    './src/**/*.{ts,tsx}', 
  ],
  prefix: "",
  theme: {
    container: {
      center: true,
      padding: "1.5rem",
      screens: {
        "2xl": "1440px",
      },
    },
    extend: {
      fontSize: { 
        xs: ['0.75rem', '1.5'],    // 12px / 18px
        sm: ['0.875rem', '1.7'],   // 14px / 24px
        base: ['1rem', '1.7'],       // 16px / 27px - Crucial: 1.7 line-height
        lg: ['1.125rem', '1.7'],   // 18px / 30px
        xl: ['1.25rem', '1.6'],    // 20px / 32px
        '2xl': ['1.5rem', '1.6'],    // 24px / 38px
        '3xl': ['1.875rem', '1.5'],  // 30px / 45px
        '4xl': ['2.25rem', '1.4'],   // 36px / 50px
        '5xl': ['3rem', '1.3'],      // 48px / 62px
        '6xl': ['3.75rem', '1.2'],   // 60px / 72px
      },
      spacing: {
        // Keep default spacing scale, rely on consistent application
      },
      colors: {
        // Use CSS variables defined in globals.css for theme colors
        border: 'hsl(var(--border))',
        input: 'hsl(var(--input))',
        ring: 'hsl(var(--ring))',
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        primary: {
          DEFAULT: 'hsl(var(--primary))',
          foreground: 'hsl(var(--primary-foreground))',
          dark: 'hsl(var(--primary-dark))', // Added for hover/focus
        },
        secondary: {
          DEFAULT: 'hsl(var(--secondary))',
          foreground: 'hsl(var(--secondary-foreground))',
          dark: 'hsl(var(--secondary-dark))', // Added for hover/focus
        },
        destructive: {
          DEFAULT: 'hsl(var(--destructive))',
          foreground: 'hsl(var(--destructive-foreground))',
        },
        info: {
          DEFAULT: 'hsl(var(--info))', // Added Feedback Color
        },
        success: {
          DEFAULT: 'hsl(var(--success))', // Added Feedback Color
        },
        warning: {
          DEFAULT: 'hsl(var(--warning))', // Added Feedback Color
        },
        muted: {
          DEFAULT: 'hsl(var(--muted))',
          foreground: 'hsl(var(--muted-foreground))',
        },
        accent: {
          DEFAULT: 'hsl(var(--accent))',
          foreground: 'hsl(var(--accent-foreground))',
          dark: 'hsl(var(--accent-dark))', // Added for hover/focus
        },
        popover: {
          DEFAULT: 'hsl(var(--popover))',
          foreground: 'hsl(var(--popover-foreground))',
        },
        card: {
          DEFAULT: 'hsl(var(--card))',
          foreground: 'hsl(var(--card-foreground))',
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      fontFamily: {
        // Use CSS variable names defined in app/layout.tsx (or similar)
        heading: ['var(--font-inter)', 'sans-serif'],
        sans: ['var(--font-public-sans)', 'sans-serif'],
      },
      keyframes: { 
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
        "fade-in": {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" }
        },
        "typing": {
          "0%": { transform: "translateY(0px)", opacity: "0.4" },
          "50%": { transform: "translateY(-5px)", opacity: "1" },
          "100%": { transform: "translateY(0px)", opacity: "0.4" }
        }
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        "fade-in": "fade-in 0.3s ease-in-out forwards",
        "typing": "typing 1.2s infinite ease-in-out"
      },
    },
  },
  plugins: [require("tailwindcss-animate")], 
}

// Removed the corePlugins section to re-enable Tailwind's Preflight base styles.