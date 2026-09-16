import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // Strict GIGW Design System Palette
        gov: {
          green: '#1B5E20',       // Primary / Success (Dark Forest Green)
          red: '#B3261E',         // Errors / Urgent (Always paired with ⚠️)
          orange: '#E65100',      // Notices / Deadlines / Focus Ring
          bg: '#F8F9FA',          // Neutral Background
          text: '#1C1B1F',        // Neutral Body Text
          card: '#FFFFFF',        // Card Background
          border: '#D0D5DD',      // Subtle accessible border
          muted: '#49454F',       // Accessible secondary text (4.5:1 ratio)
        },
      },
      fontFamily: {
        sans: ['Public Sans', 'system-ui', '-apple-system', 'Segoe UI', 'Roboto', 'sans-serif'],
      },
      minHeight: {
        touch: '44px',
      },
      minWidth: {
        touch: '44px',
      },
    },
  },
  plugins: [],
};

export default config;
