import { createMemoryHistory, createRouter } from 'vue-router'
import Main from "@/components/Main.vue";


const routes = [
    {
        path: '/',
        component: Main,
    },
    {
        /* Wildcard path to catch other paths */
        path: '/:pathMatch(.*)*',
        component: Main,
    }
]

export const router = createRouter({
    history: createMemoryHistory(),
    routes,
})