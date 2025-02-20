import { createWebHistory, createRouter } from "vue-router";

import Home from "./pages/Home.vue";
import About from "./pages/About.vue";
import Gallery from "./pages/Gallery.vue";
import Model from "./pages/Model.vue";

const routes = [
  {
    path: "/home",
    name: "Home",
    component: Home,
  },
  {
    path: "/about",
    name: "About",
    component: About,
  },
  { path: "/", name: "Gallery", component: Gallery },
  {
    path: "/model/:id",
    name: "Model",
    component: Model,
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
  //@ts-ignore
  scrollBehavior(to, from, savedPosition) {
    return savedPosition || { top: 0, left: 0 };
  },
});

export default router;
