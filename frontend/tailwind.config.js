/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    darkMode: 'class', // Enable manual dark mode toggle
    theme: {
        extend: {
            colors: {
                // Mapping HSL variables
                primary: 'hsl(var(--p) / <alpha-value>)',
                'primary-container': 'hsl(var(--pc) / <alpha-value>)',
                'on-primary': 'hsl(var(--op) / <alpha-value>)',
                'on-primary-container': 'hsl(var(--opc) / <alpha-value>)',

                background: 'hsl(var(--bg) / <alpha-value>)',
                'on-background': 'hsl(var(--obg) / <alpha-value>)',

                surface: 'hsl(var(--s) / <alpha-value>)',
                'on-surface': 'hsl(var(--os) / <alpha-value>)',
                'surface-variant': 'hsl(var(--sv) / <alpha-value>)',
                'on-surface-variant': 'hsl(var(--osv) / <alpha-value>)',

                secondary: 'hsl(var(--sec) / <alpha-value>)',
                'on-secondary': 'hsl(var(--on-sec) / <alpha-value>)',
                'secondary-container': 'hsl(var(--sec-c) / <alpha-value>)',
                'on-secondary-container': 'hsl(var(--on-sec-c) / <alpha-value>)',

                outline: '#79747E',
                error: '#B3261E',
                'on-error': '#FFFFFF',
            },
            fontFamily: {
                sans: ['Roboto', 'sans-serif'],
            },
            boxShadow: {
                'md3-1': '0px 1px 3px 1px rgba(0, 0, 0, 0.15), 0px 1px 2px 0px rgba(0, 0, 0, 0.30)',
                'md3-2': '0px 2px 6px 2px rgba(0, 0, 0, 0.15), 0px 1px 2px 0px rgba(0, 0, 0, 0.30)',
            },
            borderRadius: {
                'xl': '28px',
            }
        },
    },
    plugins: [],
}
