/** @type {import('tailwindcss').Config} */
export default {
    content: [
        './index.html',
        './src/**/*.{js,ts,jsx,tsx}',
    ],
    theme: {
        extend: {
            colors: {
                primary: {
                    50: '#eef7ff',
                    100: '#d5ecff',
                    200: '#a6d8ff',
                    300: '#70c0ff',
                    400: '#3ba4ff',
                    500: '#0d8bff',
                    600: '#0070db',
                    700: '#0057a8',
                    800: '#00417c',
                    900: '#032f5b',
                },
            },
        },
    },
    plugins: [],
};
