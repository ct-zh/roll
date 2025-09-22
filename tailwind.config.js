/** @type {import('tailwindcss').Config} */

export default {
  darkMode: "class",
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    container: {
      center: true,
    },
    screens: {
      'sm': '640px',   // 移动端
      'md': '768px',   // 平板端  
      'lg': '1024px',  // 桌面端
      'xl': '1280px'   // 大屏桌面端
    },
    extend: {},
  },
  plugins: [],
};
