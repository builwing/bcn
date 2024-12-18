/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./components/**/*.{vue,js,ts}",
    "./layouts/**/*.vue",
    "./pages/**/*.vue",
    "./composables/**/*.{js,ts}",
    "./plugins/**/*.{js,ts}",
    "./app.vue",
  ],
  theme: {
    extend: {
      colors: {
        primary: '#f472b6', // ピンク系の色 (例)
        secondary: '#f9a8d4', // セカンダリカラー (例)
      },
    },
  },
  plugins: [require("@tailwindcss/line-clamp")],
};
