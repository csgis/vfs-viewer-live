module.exports = {
  content: [
    "./index.html", 
    "./src/**/*.{vue,js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      backgroundColor: {
        'contrast-primary': 'black',
        'contrast-secondary': '#333',
        'contrast-accent': 'white',
        'contrast-hover': '#000',
      },
      textColor: {
        'contrast-primary': 'white',
        'contrast-secondary': '#eee',
        'contrast-black': '#000',
      },
      borderColor: {
        'contrast-border': 'black',
      }
    }
  },
  plugins: [
    function({ addVariant }) {
      addVariant('contrast', '[data-contrast="true"] &')
      addVariant('contrast-hover', '[data-contrast="true"] &:hover')
    }
  ]
}