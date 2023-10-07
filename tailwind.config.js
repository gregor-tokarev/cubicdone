/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{vue,ts}"
    ],
    theme: {
        extend: {
            colors: {
                'black': '#0F0F0F',
                'gray-500': '#FAFAFA',
                'gray-450': '#EBEBEB',
                'gray-400': '#F5F5F5',
                'gray-350': '#C2C2C2',
                'gray-300': '#CCCCCC',
                'gray-200': '#808080',
                'white': '#FFFFFF',
            }
        }
    },

    safelist: [
        {pattern: /^!?bg-.*-(100|400)$/},
        {pattern: /^!?text-.*-(100|400)$/}
    ],
    plugins: []
}
