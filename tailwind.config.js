/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{vue,ts}"],
  theme: {
    extend: {
      boxShadow: {
        colorPick: "0px 0px 0px 4px #F5F5F5",
      },
      colors: {
        black: "#0F0F0F",
        "gray-500": "#FAFAFA",
        "gray-450": "#EBEBEB",
        "gray-425": "#E7E7E7",
        "gray-400": "#F5F5F5",
        "gray-350": "#C2C2C2",
        "gray-300": "#CCCCCC",
        "gray-250": "#CFCFCF",
        "gray-200": "#808080",
        "gray-150": "#ededed",
        white: "#FFFFFF",
      },
    },
  },

  safelist: [
    { pattern: /^!?bg-.*-(100|400)$/ },
    { pattern: /^!?text-.*-(100|400)$/ },
    { pattern: /^max-w-.*$/ },
    "border-black",
  ],
  plugins: [],
};
