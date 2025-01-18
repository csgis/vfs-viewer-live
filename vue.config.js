// vue.config.js
module.exports = {
  devServer: {
    proxy: {
      '/geoserver': {
        target: process.env.VUE_APP_GEOSERVER_URL,
        changeOrigin: true,
        secure: true,
        rewrite: (path) => path.replace(/^\/geoserver/, '')
      }
    }
  }
}