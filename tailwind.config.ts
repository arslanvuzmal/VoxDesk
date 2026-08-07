import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './lib/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        bg: {
          dark: '#0B0D10',
          sidebar: '#0F1216',
          surface: '#13171C',
          raised: '#171C22',
          border: '#272D35',
        },
        accent: {
          teal: '#2DD4BF',
          blue: '#60A5FA',
          green: '#34D399',
          amber: '#FBBF24',
          rose: '#FB7185',
        },
        txt: {
          strong: '#F4F4F5',
          normal: '#D4D4D8',
          muted: '#8B949E',
        },
      },
      borderRadius: {
        lg: '8px',
        xl: '10px',
        '2xl': '12px',
      },
    },
  },
  plugins: [],
};
export default config;
