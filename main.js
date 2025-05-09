import { createApp } from 'vue'
import { createRouter, createWebHistory } from 'vue-router'
import App from './App.vue'
import Auth from './Auth.vue'
import Callback from './Callback.vue'
import Dashboard from './Dashboard.vue'
import './main.css'

// Define routes
const routes = [
  {
    path: '/',
    name: 'Auth',
    component: Auth
  },
  {
    path: '/callback',
    name: 'Callback',
    component: Callback
  },
  {
    path: '/dashboard',
    name: 'Dashboard',
    component: Dashboard
  }
]

// Create router instance
const router = createRouter({
  history: createWebHistory(),
  routes
})

// Create and mount Vue app
const app = createApp(App)
app.use(router)
app.mount('#app') 