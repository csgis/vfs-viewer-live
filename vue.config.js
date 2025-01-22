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
  },
  chainWebpack: config => {
    config.plugin('define').tap(args => {
      const env = args[0]['process.env']
      if (env && env.NODE_ENV) {
        delete env.NODE_ENV
      }
      return args
    })
  }
}