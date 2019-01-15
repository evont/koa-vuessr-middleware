import Vue from 'vue'
import Router from 'vue-router'

Vue.use(Router)

const HomeView = () => import('../views/home.vue');
const NotFoundComponent = () => import('../views/notfound.vue');

export function createRouter () {
  return new Router({
    mode: 'history',
    fallback: false,
    scrollBehavior: () => ({ y: 0 }),
    routes: [ 
      { path: '/', component: HomeView },
      { path: '*', component: NotFoundComponent }
    ]
  })
}