/** @type {import('tailwindcss').Config} */
module.exports = {
    content: [
        "./views/*.ejs",
        "./public/**/*.html",
        "./views/**/*.ejs"
    ],
    theme: {
        extend: {},
    },
    plugins: [
        require('daisyui'),
        require('@tailwindcss/typography')
    ],
    daisyui: {
        themes: ["dim"]
    }
};
