'use strict'
const utils = require('./utils')
module.exports = (isProd, isServer) => {
  return {
    loaders: utils.cssLoaders({
      sourceMap: true,
      extract: isProd,
      isServer,
    }),
    cssSourceMap: true,
    cacheBusting: true,
    transformToRequire: {
      video: ['src', 'poster'],
      source: 'src',
      img: 'src',
      image: 'xlink:href'
    }
  }
}
