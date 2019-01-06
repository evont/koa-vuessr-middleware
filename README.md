# Koa-VueSSR
基于Koa 2.x 的Vue SSR 中间件（Vue SSR middleware for `koa 2.x`）

## **installation**

```javascript
npm install koa-vuessr-middleware
```
---
## **用法**
如果你需要运行在生产环境中，你需要先执行 `vuessr` 命令生成生产代码

```javascript
const koa = require('koa');
const app = new koa();
const koaRouter = require('koa-router');
const ssr = require('koa-vuessrr-middleware');

router.get('/otherroute', othermiddleware);
router.get('*', ssr(app, opts));

app.use(router.routes());
app.listen(8080);
```

- `app` koa 的app 实例
- `opts` 配置选项

    **Options**
    - `title` 页面默认标题，默认为空；
    - `isProd` 是否为生产模式，默认为 `false`，如果设置为 `true`，你需要先执行`vuessr` 命令以生成生产代码，为`false` 时，该中间件会使用 `webpack-hot-middleware`& `webpack-dev-middleware` 以实现热更新功能；
    - ~~`templatePath` 默认网页模板，默认为空，即使用内置的网页模板~~
---

你需要在项目根目录下有一个 `.ssrconfig` 作为配置文件，以下是配置例子

.ssrconfig
```json
{
  "template": "./src/index.template.html",
  "ouput": {
    "path": "./dist", 
    "publicPath": "/dist/"
  },
  "entry": {
    "client": "./src/entry-client.js",
    "server": "./src/entry-server.js"
  },
  "webpackConfig": {
    "client": "./build/webpack.client.conf.js",
    "server": "./build/webpack.server.conf.js"
  }
}
```
- `template` 默认网页模板，默认为空，即使用内置的网页模板
- `entry` 当你想要使用内置webpack 配置文件的时候为**必要**选项。 webpack的入口js， `client` 是客户端入口文件, `server` 为服务端入口文件;
- `output` 如果你想使用内置webpack 配置文件的时候，你需要声明输出目录选项， `path` 为输出的文件夹目录，`publicPath` 是生成到模板中时的资源路径, 具体可以参考 [webpack output 配置](https://webpack.js.org/configuration/output/)
- `webpackConfig` 如果你倾向于使用你自己的webpack 配置文件，你需要配置下列选项: 
    - `client` 客户端配置webpack 配置
    - `server` 服务端配置webpack 配置

---

实际使用可以参考 [Demo](https://github.com/evont/koa-vuessr-middleware/tree/master/demo) 

目录结构示例

```
├── src                      app directory
│   ├── router/              route directory
│   ├── views/               views directory
│   ├── components/          compoennts directory
│   ├── app.js               js file to export a createApp function
│   ├── App.vue              root Vue
│   ├── entry-server.js      server side entry point
│   └── entry-client.js      client side entry point
├── index.js                 server entry point
├── .ssrconfig               SSR configuration file
├── ...	
```

app.js 例子 

```javascript
import Vue from 'vue'
import App from './App.vue'
import { createRouter } from './router'
import titleMixin from './util/title'

Vue.mixin(titleMixin)
export function createApp () {
  const router = createRouter()
  const app = new Vue({
    router,
    render: h => h(App)
  })
  return { app, router, }
}
```

entry-client.js 例子

```javascript
import Vue from 'vue'
import 'es6-promise/auto'
import { createApp } from './app'

const { app, router } = createApp()

router.onReady(() => {
  app.$mount('#app')
})
```

entry-server.js 例子

```javascript
import { createApp } from './app';
export default context => {
  return new Promise((resolve, reject) => {
    const { app, router } = createApp()
    const { url } = context
    const { fullPath } = router.resolve(url).route
    if (fullPath !== url) {
      return reject({ url: fullPath })
    }
    router.push(url)
    router.onReady(() => {
      const matchedComponents = router.getMatchedComponents()
      if (!matchedComponents.length) {
        return reject({ code: 404 })
      }
      Promise.all(matchedComponents.map(({ asyncData }) => asyncData)).then(() => {
        resolve(app)
      }).catch(reject)
    }, reject)
  })
}
```

##  **注意**

如果你想要使用自己的webpack 配置文件，你需要使用`Code-Splitting` 功能，你需要在你的`.babelrc` or `babel-loader`中配置 `syntax-dynamic-import`，否则会报错

```json
"plugins": [
    "syntax-dynamic-import"
]
```

---

## **usage**

if you want to run in production mode, you should run `vuessr` command first

```javascript
const koa = require('koa');
const app = new koa();
const koaRouter = require('koa-router');
const ssr = require('koa-vuessrr-middleware');

router.get('/otherroute', othermiddleware);
router.get('*', ssr(app, opts));

app.use(router.routes());
app.listen(8080);
```

- `app` koa app
- `opts` options object

    **Options**
    - `title` default title for html, default to empty string
    - `isProd` is Production Mode, default to false, if true, you need to run `vuessr` command to build distrubution file first. if false, the middleware will use `webpack-hot-middleware`& `webpack-dev-middleware` to setup a hot reload server;
    - ~~`templatePath` html template path, default to empty string, then it will use the built in template file~~
---

You also need to have a `.ssrconfig` file in your root directory, here is an example for `.ssrconfig` file;

.ssrconfig
```json
{
  "template": "./src/index.template.html",
  "ouput": {
    "path": "./dist", 
    "publicPath": "/dist/"
  },
  "entry": {
    "client": "./src/entry-client.js",
    "server": "./src/entry-server.js"
  },
  "webpackConfig": {
    "client": "./build/webpack.client.conf.js",
    "server": "./build/webpack.server.conf.js"
  }
}
```
- `template` html template path, default to empty string, then it will use the built in template file
- `entry` **required** if you want to use the built in webpack config file. This is the entrypoint js for webpack, `client` is the client side entrypoint, `server` is the server side entrypoint;
- `output` if you want to use the built in webpack config file, you need to specify output option with `path` for distribution file path & `publicPath` for every URL created by the runtime or loaders, check [webpack output configuration](https://webpack.js.org/configuration/output/)
- `webpackConfig` if you prefer to use your own webpack config, you need to specify this option, you need two configuration file: 
    - `client` for client side configuration file path 
    - `server` for server side configuration file path;

---

See [Demo](https://github.com/evont/koa-vuessr-middleware/tree/master/demo) for more pratical usage

Directory structure example:

```
├── src                      app directory
│   ├── router/              route directory
│   ├── views/               views directory
│   ├── components/          compoennts directory
│   ├── app.js               js file to export a createApp function
│   ├── App.vue              root Vue
│   ├── entry-server.js      server side entry point
│   └── entry-client.js      client side entry point
├── index.js                 server entry point
├── .ssrconfig               SSR configuration file
├── ...	
```

app.js example 

```javascript
import Vue from 'vue'
import App from './App.vue'
import { createRouter } from './router'
import titleMixin from './util/title'

Vue.mixin(titleMixin)
export function createApp () {
  const router = createRouter()
  const app = new Vue({
    router,
    render: h => h(App)
  })
  return { app, router, }
}
```

entry-client.js example

```javascript
import Vue from 'vue'
import 'es6-promise/auto'
import { createApp } from './app'

const { app, router } = createApp()

router.onReady(() => {
  app.$mount('#app')
})
```

entry-server.js example

```javascript
import { createApp } from './app';
export default context => {
  return new Promise((resolve, reject) => {
    const { app, router } = createApp()
    const { url } = context
    const { fullPath } = router.resolve(url).route
    if (fullPath !== url) {
      return reject({ url: fullPath })
    }
    router.push(url)
    router.onReady(() => {
      const matchedComponents = router.getMatchedComponents()
      if (!matchedComponents.length) {
        return reject({ code: 404 })
      }
      Promise.all(matchedComponents.map(({ asyncData }) => asyncData)).then(() => {
        resolve(app)
      }).catch(reject)
    }, reject)
  })
}
```

##  **Notice**

if you want to use your own webpack configuration & you want to use `Code-Splitting`, you need to use `syntax-dynamic-import` plugin in your `.babelrc` or `babel-loader` options;

```json
"plugins": [
    "syntax-dynamic-import"
]
```