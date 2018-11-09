# Koa-VueSSR
Vue SSR middleware for `koa 2.x` 

## **installation**

```javascript
npm install koa-vuessr-middleware
```
---

## **usage**

```javascript
const koa = require('koa');
const app = new koa();
const koaRouter = require('koa-router');
const ssr = require('koa-vuessrr-middleware');

router.get('/otherroute', otherloaders);
router.get('*', ssr(app, opts));

app.use(router.routes());
app.listen(8080);
```

- `app` koa app
- `opts` options object

    **Options**
    - `title` default title for html, default to empty string
    - `isProd` is Production Mode, default to false, if true, you need to run `buildssr` command to build distrubution file first. if false, the middleware will use `webpack-hot-middleware`& `webpack-dev-middleware` to setup a hot reload server;
    - `templatePath` html template path, default to empty string, then it will use the built in template file
---

You also need to have a `.ssrconfig` file in your root directory, here is an example for `.ssrconfig` file;

.ssrconfig
```json
{
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
- `entry` **required** if you want to use the built in webpack config file. This is the entrypoint js for webpack, `client` is the client side entrypoint, `server` is the server side entrypoint;
- `output` if you want to use the built in webpack config file, you need to specify output option with `path` for distribution file path & `publicPath` for every URL created by the runtime or loaders, check [webpack output configuration](https://webpack.js.org/configuration/output/)
- `webpackConfig` if you prefer to use your own webpack config, you need to specify this option, you need two configuration file: 
    - `client` for client side configuration file path 
    - `server` for server side configuration file path;

---

See `[Demo](https://github.com/evont/koa-vuessr-middleware/tree/master/demo)` for more pratical usage

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