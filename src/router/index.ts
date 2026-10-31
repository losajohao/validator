import { createRouter, createWebHistory } from 'vue-router'
import AnalyzedValidatorView from '../views/AnalyzedValidatorView.vue'
import HomeView from '../views/HomeView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: HomeView,
    },
    {
      path: '/validador-analizada',
      name: 'validador-analizada',
      component: AnalyzedValidatorView,
    },
  ],
})

export default router
