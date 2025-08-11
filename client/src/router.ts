import { createWebHistory, createRouter } from "vue-router";

import Home from "./pages/Home.vue";
import About from "./pages/About.vue";
import Gallery from "./pages/Gallery.vue";
import Model from "./pages/Model.vue";
import Search from "./pages/Search.vue";
import Upload from "./pages/Upload.vue";
import Edit from "./pages/Edit.vue";
import { nextTick } from "vue";

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
  {
    path: "/upload",
    name: "Upload",
    component: Upload,
  },
  {
    path: "/edit/:id",
    name: "Edit",
    component: Edit,
  },
  { path: "/search", name: "Search", component: Search },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
  async scrollBehavior(_to, _from, savedPosition) {
    await nextTick();
    if (savedPosition) {
      setTimeout(() => {
        window.scrollTo({
          top: savedPosition.top,
          behavior: "smooth",
        });
      }, 100);
    } else {
      return { top: 0, left: 0 };
    }
  },
});

export default router;
