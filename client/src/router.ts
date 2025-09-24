import { createWebHistory, createRouter, type RouteLocationNormalizedLoaded } from "vue-router";
import { useUserStore } from "./stores/userStore";
import { useToastStore } from "./stores/toastStore";
import Home from "./pages/Home.vue";
import About from "./pages/About.vue";
import Gallery from "./pages/Gallery.vue";
import Model from "./pages/Model.vue";
import Search from "./pages/Search.vue";
import Upload from "./pages/Upload.vue";
import Edit from "./pages/Edit.vue";
import Users from "./pages/Users.vue";
import Profile from "./pages/Profile.vue";
import AuthCallback from "./components/AuthCallback.vue";
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
  { path: "/",
    name: "Gallery",
    component: Gallery,
    props: (route: RouteLocationNormalizedLoaded) => ({ page: Number(route.query.page) || 1 }),
  },
  {
    path: "/model/:id",
    name: "Model",
    component: Model,
  },
  {
    path: "/upload",
    name: "Upload",
    component: Upload,
    meta: { requiresAuth: true }
  },
  {
    path: "/edit/:id",
    name: "Edit",
    component: Edit,
    meta: { requiresAuth: true }
  },
  {
    path: "/profile",
    name: "Profile",
    component: Profile,
    meta: { requiresAuth: true }
  },
  { path: "/search", name: "Search", component: Search },
  { path: "/users", name: "Users", component: Users, meta: { requiresAdmin: true } },
  { path: "/auth/callback", name: "Auth Callback", component: AuthCallback} // OTC exchange route to open a session
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

router.beforeEach(async (to, from) => {
  const userStore = useUserStore();
  const toastStore = useToastStore();

  if(userStore.user === null) {
    await userStore.fetchUser();
  }

  if(to.meta.requiresAuth && !userStore.canAccess) {
    toastStore.showToast("error", "You don't have access to the requested resource")

    return {
      path: from.path
    }
  }

  if(to.meta.requiresAdmin && !userStore.isAdmin) {
    toastStore.showToast("error", "You don't have access to the requested resource")

    return {
      path: from.path
    }
  }
})

export default router;
