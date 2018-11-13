#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const webpack = require('webpack');
const rimraf = require('rimraf');
const resolve = filepath => path.resolve(process.cwd(), filepath)
const log = require('./colorLog');
function webpackBuild(config) {
  const compiler = webpack(config);
  compiler.run((err, stats) => {
    /* istanbul ignore next */
    if (err) {
      console.log(err);
      return;
    }
    console.log(stats.toString({
      chunks: false,  // Makes the build much quieter
      colors: true    // Shows colors in the console
    }));
  })
}
let ssrconfig;
try {
  ssrconfig = fs.readFileSync(resolve('.ssrconfig'), 'utf-8');
  ssrconfig = JSON.parse(ssrconfig);
  const { webpackConfig = {}, output } = ssrconfig;
  const { client, server } = webpackConfig;

  rimraf(resolve(output.path), (err) => {
    if (err) {
      console.error(err);
      return;
    }
    let clientConfig = require(client ? resolve(client) : './config/webpack.client.conf');
    let serverConfig = require(server ? resolve(server) : './config/webpack.server.conf'); 

    // 设置环境变量为开发模式
    if (!client || typeof clientConfig === 'function') {
      clientConfig = clientConfig();
    }
    if (!server || typeof serverConfig === 'function') {
      serverConfig = serverConfig();
    }

    webpackBuild(clientConfig);
    webpackBuild(serverConfig);
  });

} catch(e) {
  log.error('You need to have a .ssrconfig file in your root directory')
  throw new Error(e)
}
