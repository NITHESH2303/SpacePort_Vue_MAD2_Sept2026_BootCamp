import { createWebHistory, createRouter } from 'vue-router'

import Register from '../pages/Register.vue'
import Login from '../pages/Login.vue'
import Home from '../pages/Home.vue'


const routes = [
    { path: '/', redirect: '/login' },
    { path: '/register', name: 'Register', component: Register},
    { path: '/login', name: 'Login', component: Login },
    { path: '/home', name: 'Home', component: Home, meta: {requiesAuth: true} }
]


const router = createRouter({
    history: createWebHistory(),
    routes
})

router.beforeEach((to, from, next) => {
    const token = localStorage.getItem('access_token');
    console.log
    const isAunthenticated = !!token

    const rawRoles = localStorage.getItem('roles');
    const roles = rawRoles? JSON.parse(rawRoles) : []

    if (to.meta.requiesAuth && !isAunthenticated) 
    {
        next({name: 'Login'})
    }
    else if(to.meta.role && !roles.includes(to.meta.role))
    {
        alert("Access Denied: Insufficent Permission")
        next({name: 'Home'})
    }
    else
    {
        next()
    }
})

export default router