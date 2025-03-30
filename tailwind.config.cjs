/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      screens: {
        sm: "320px", // Thiết lập kích thước tối đa cho sm là 640px
      },
    },
  },
  plugins: [],
};
