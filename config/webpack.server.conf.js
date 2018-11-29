const fs = require('fs');
const path = require('path');
const webpack = require('webpack')
const merge = require('webpack-merge')
const base = require('./webpack.base.conf')
const nodeExternals = require('webpack-node-externals')
const VueSSRServerPlugin = require('vue-server-renderer/server-plugin')

const ssrconfig = JSON.parse(fs.readFileSync(path.resolve(process.cwd(), '.ssrconfig'), 'utf-8'));

module.exports = (isProd = true) => {
  return merge(base(isProd, true), {
    target: 'node',
    devtool: '#source-map',
    entry: ssrconfig.entry.server,
    output: {
      filename: 'server-bundle.js',
      libraryTarget: 'commonjs2'
    },
    externals: nodeExternals({
      whitelist: /\.css$/
    }),
    plugins: [
      new webpack.DefinePlugin({
        'process.env.VUE_ENV': '"server"'
      }),
      new VueSSRServerPlugin()
    ]
  })
}