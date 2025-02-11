import { createWebHistory, createRouter } from "vue-router";

import Home from "./pages/Home.vue";
import About from "./pages/About.vue";
import Gallery from "./pages/Gallery.vue";

const routes = [
  { path: "/home", name: "Home", component: Home },
  { path: "/about", name: "About", component: About },
  { path: "/", name: "Gallery", component: Gallery },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

export default router;
