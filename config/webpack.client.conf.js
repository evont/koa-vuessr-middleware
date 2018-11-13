const fs = require('fs');
const path = require('path');
const webpack = require('webpack')
const merge = require('webpack-merge')
const base = require('./webpack.base.conf')
const VueSSRClientPlugin = require('vue-server-renderer/client-plugin')

const ssrconfig = JSON.parse(fs.readFileSync(path.resolve(process.cwd(), '.ssrconfig'), 'utf-8'));

module.exports = ((isProd = true) => {
  return merge(base(isProd), {
    entry: {
      app: ssrconfig.entry.client,
    },
    optimization: {
      runtimeChunk: {
        name: 'manifest'
      },
      minimize: true,
      noEmitOnErrors: true,
      splitChunks: {
        cacheGroups: {
          vendor: { // key 为entry中定义的 入口名称
            name: 'vendor', // 要缓存的 分隔出来的 chunk 名称
            chunks: 'all', //all-异步加载快，但初始下载量较大，文件共用性好； initial-初始下载量较小，但异步加载量较大，文件间有重复内容
            test: /node_modules[\\/]/
          },
        }
      }
    },
    plugins: [
      // strip dev-only code in Vue source
      new webpack.DefinePlugin({
        'process.env.VUE_ENV': '"client"'
      }),
      new VueSSRClientPlugin()
    ]
  })
})