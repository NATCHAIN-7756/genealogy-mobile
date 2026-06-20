import { createRouter, createWebHistory } from 'vue-router'

const routes = [
  { path: '/', component: () => import('./views/Home.vue') },
  { path: '/family/:id', component: () => import('./views/Family.vue') },
  { path: '/tree/:id', component: () => import('./views/Tree.vue') },
  { path: '/books', component: () => import('./views/Books.vue') },
  { path: '/books/:id', component: () => import('./views/BookReader.vue') },
  { path: '/profile', component: () => import('./views/Profile.vue') }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router
