const fs = require('fs');
const path = require('path');
const webpack = require('webpack');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const FriendlyErrorsPlugin = require('friendly-errors-webpack-plugin');
const { VueLoaderPlugin } = require('vue-loader');

const ssrconfig = JSON.parse(fs.readFileSync(path.resolve(process.cwd(), '.ssrconfig'), 'utf-8'));

module.exports = (isProd = true) => {
  return {
    mode: isProd ? 'production' : 'development',
    devtool: isProd
      ? false
      : '#cheap-module-source-map',
    output: {
      path: path.resolve(process.cwd(), ssrconfig.output.path),
      publicPath: ssrconfig.output.publicPath,
      filename: '[name].[chunkhash].js'
    },
    resolve: {
      alias: {
        'public': path.resolve(process.cwd(), './public'),
        '@': path.resolve('src'),
      } 
    },
    optimization: isProd ? {
      concatenateModules: true,
      minimize: true,
    } : {},
    module: {
      noParse: /es6-promise\.js$/, // avoid webpack shimming process
      rules: [
        {
          test: /\.vue$/,
          loader: 'vue-loader',
          options: {
            compilerOptions: {
              preserveWhitespace: false
            }
          }
        },
        {
          test: /\.js$/,
          exclude: /node_modules/,
          use: {
            loader: 'babel-loader',
            options: {
              "presets": [
                ["env", { "modules": false }]
              ],
              "plugins": [
                "syntax-dynamic-import"
              ]
            }
          }
        },
        {
          test: /\.(png|jpg|gif|svg)$/,
          loader: 'url-loader',
          options: {
            limit: 10000,
            name: '[name].[ext]?[hash]'
          }
        },
        {
          test: /\.css$/,
          use: [
            MiniCssExtractPlugin.loader,
            {
              loader: 'css-loader',
              options: {
                minimize: isProd,
              },
            }
          ],
        },
      ]
    },
    performance: {
      maxEntrypointSize: 300000,
      hints: isProd ? 'warning' : false
    },
    plugins: isProd
      ? [
          new webpack.DefinePlugin({
            'process.env.NODE_ENV': JSON.stringify('production'),
          }),
          new VueLoaderPlugin(),
          new MiniCssExtractPlugin({
            filename: 'common.[chunkhash].css'
          })
        ]
      : [
          new webpack.DefinePlugin({
            'process.env.NODE_ENV': JSON.stringify('development'),
          }),
          new VueLoaderPlugin(),
          new FriendlyErrorsPlugin()
        ]
  }
}