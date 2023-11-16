import { createRouter, createWebHistory } from 'vue-router'
import Conv from '../views/Conv.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: Conv
    },
    {
      path: '/test-jb-short',
      name: 'test-jb-short',
      component: () => import('../tests/ConvTest-jb-short.vue')
    },
    {
      path: '/test-jb-long',
      name: 'test-jb-long',
      component: () => import('../tests/ConvTest-jb-long.vue')
    },
    {
      path: '/test-dic-short',
      name: 'test-dic-short',
      component: () => import('../tests/ConvTest-dic-short.vue')
    }
  ]
})

export default router
