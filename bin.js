#!/usr/bin/env node

const fs = require('fs');
const exec = require('child_process').exec;
const path = require('path');
const webpack = require('webpack');
const rimraf = require('rimraf');
const resolve = filepath => path.resolve(process.cwd(), filepath)
const crossEnv = require('cross-env');

crossEnv(['NODE_ENV=production'])

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
    const clientConfig = require(client ? resolve(client) : './config/webpack.client.conf');
    const serverConfig = require(server ? resolve(server) : './config/webpack.server.conf'); 

    webpackBuild(clientConfig);
    webpackBuild(serverConfig);
  });

  
} catch(e) {
  console.error('You need to have a .ssrconfig file in your root directory');
  throw new Error(e)
}
