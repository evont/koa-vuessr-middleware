const fs = require('fs');
const path = require('path');
const { createBundleRenderer } = require('vue-server-renderer');
const LRU = require('lru-cache');

/**
 * deep extend object
 * @param {object} obj original object
 * @param {object} obj2 extend object
 * @returns {object} combine object
 */
function extend(obj, obj2) {
  const newObj = Object.assign({}, obj);
  for (const key in obj2) {
    if ('object' != typeof obj[key] || null === obj[key] || Array.isArray(obj[key])) {
      if (void 0 !== obj2[key]) {
        newObj[key] = obj2[key];
      }
    } else {
      newObj[key] = extend(obj[key], obj2[key]);
    }
  }
  return newObj;
}

function createRenderer(bundle, distPath, options) {
  return createBundleRenderer(
      bundle,
      Object.assign(options, {
          basedir: distPath,
          cache: LRU({
            max: 1000,
            maxAge: 1000 * 60 * 15
          }),
          runInNewContext: false
      })
  )
}

function render(renderer, title, ctx) {
  ctx.set('Content-Type', 'text/html')
  return new Promise((resolve, reject) => {
    const handleError = err => {
      if (err.url) {
        ctx.redirect(err.url)
      } else if(err.code === 404) {
        ctx.throw(404, '404 | Page Not Found')
        reject();
      } else {
        // Render Error Page or Redirect
        ctx.throw(500, '500 | Internal Server Error')
        console.error(err);
        reject();
      }
      resolve();
    }
    const context = {
      title,
      url: ctx.url
    }
    renderer.renderToString(context, (err, html) => {
      if (err) {
        return handleError(err)
      }
      ctx.body = html;
      resolve();
    })
  })
}

exports = module.exports = function(app, options = {}) {

  let ssrconfig;
  try {
    ssrconfig = fs.readFileSync(path.resolve(process.cwd(), '.ssrconfig'), 'utf-8');
  } catch(e) {
    console.error('You need to have a .ssrconfig file in your root directory');
    throw new Error('no ssrconfig file')
  }
  
  ssrconfig = JSON.parse(ssrconfig);


  const defaultSetting = {
    title: '', // default title for html
    isProd: false, // is Production Mode
    templatePath: '', // html template path, if is not provided, use the default template fil
  };

  const settings = extend(defaultSetting, options);
  
  const templatePath = settings.templatePath || path.resolve(__dirname, 'index.template.html');

  const distPath = path.resolve(process.cwd(), ssrconfig.output.path);

  let renderer;
  let readyPromise;
  if (!settings.isProd) {
    readyPromise = require('./config/setup-dev-server')(
      app,
      templatePath,
      (bundle, options) => {
        renderer = createRenderer(bundle, distPath, options)
      }
    )
  }
  
  return async function ssr (ctx) {
    if (settings.isProd) {
      const template = fs.readFileSync(templatePath, 'utf-8');
      const bundle = require(`${distPath}/vue-ssr-server-bundle.json`);
      const clientManifest = require(`${distPath}/vue-ssr-client-manifest.json`);
      renderer = createRenderer(bundle, distPath, {
        template,
        clientManifest
      });
      await render(renderer, settings.title, ctx);
    } else {
      await readyPromise.then(() => render(renderer, settings.title, ctx));
    }
  }
}

