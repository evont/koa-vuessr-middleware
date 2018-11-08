# Koa-VueSSR

## intro
这是一个基于vue ssr 的koa 中间件

## usage
```javascript
npm install koa-vuessr
```

```javascript
const koa = require('koa');
const app = new koa();
const koaRouter = require('koa-router');
const ssr = require('koa-vuessr');

router.get('*', ssr);
app.use(router.routes());
app.listen(8080);
```
