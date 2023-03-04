/** @type {import('tailwindcss').Config} */
module.exports = {
    darkMode: ["class", '[data-theme="dark"]'],
    content: [
        "./pages/**/*.{js,ts,jsx,tsx}",
        "./components/**/*.{js,ts,jsx,tsx}"
    ],
    theme: {
        extend: {
            gridTemplateColumns: {
                20: "repeat(20, minmax(0, 1fr))",
                24: "repeat(24, minmax(0, 1fr))"
            },
            gridColumn: {
                "span-20": "span 20 / span 20"
            },
            keyframes: {
                "accordion-down": {
                    from: { height: 0 },
                    to: { height: "var(--radix-accordion-content-height)" }
                },
                "accordion-up": {
                    from: { height: "var(--radix-accordion-content-height)" },
                    to: { height: 0 }
                }
            },
            animation: {
                "accordion-down": "accordion-down 0.2s ease-out",
                "accordion-up": "accordion-up 0.2s ease-out"
            }
        }
    },
    plugins: [
        require("@tailwindcss/forms"),
        require("@tailwindcss/typography"),
        require("tailwindcss-animate")
    ]
};
