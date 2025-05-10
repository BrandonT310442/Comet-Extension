import { createApp } from 'vue'
import { createRouter, createWebHashHistory } from 'vue-router'
import App from './App.vue'
import Auth from './Auth.vue'
import Callback from './Callback.vue'
import Dashboard from './Dashboard.vue'
import VerifyEmail from './VerifyEmail.vue'
import './main.css'

// Define routes
const routes = [
  {
    path: '/',
    name: 'Dashboard',
    component: Dashboard
  },
  {
    path: '/auth',
    name: 'Auth',
    component: Auth
  },
  {
    path: '/callback',
    name: 'Callback',
    component: Callback
  },
  {
    path: '/verify-email',
    name: 'VerifyEmail',
    component: VerifyEmail
  }
]

// Create router instance with hash history for Chrome extension
const router = createRouter({
  history: createWebHashHistory(),
  routes
})

// Create and mount Vue app
const app = createApp(App)
app.use(router)
app.mount('#app') 