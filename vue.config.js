const path = require("path");

module.exports = {
  devServer: {
    proxy: {
      "^/api": {
        target: "http://localhost:3000/",
        ws: true,
        changeOrigin: true,
        pathRewrite: {
          "^/api/": "/" // remove base path
        }
      }
    }
  },
  pluginOptions: {
    "style-resources-loader": {
      preProcessor: "stylus",
      patterns: [path.resolve(__dirname, "./src/assets/styles/*.styl")]
    }
  }
};
