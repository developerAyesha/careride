/**
 * Vue Router
 *
 * @library
 *
 * https://router.vuejs.org/en/
 */

// Lib imports
import Vue from "vue";
import Router from "vue-router";
import store from "@/store";
import Meta from "vue-meta";

// Routes
import paths from "./paths";

Vue.use(Router);
Vue.use(Meta);

let nextUrl = null;

// Create a new router
const router = new Router({
  // base: '/control',
  mode: "history",
  routes: paths,

  scrollBehavior(to, from, savedPosition) {
    if (savedPosition) {
      return savedPosition;
    }
    if (to.hash) {
      return { selector: to.hash };
    }
    return { x: 0, y: 0 };
  },
});
// Route guard checks to see if you are logged in
// insure your are routed back to requested url after login
router.beforeEach((to, from, next) => {
  store
    .dispatch("reload")
    .then((response) => {
      if (to.matched.some((record) => record.meta.requiresAuth)) {
        checkAuthAndRoles(to, from, next);
      } else {
        next();
      }
    })
    .catch((error) => { next(); });
});

function checkAuthAndRoles(to, from, next) {
  // Check Auth and Roles
  if (store.getters.authorized) {
    // check requiresRoles and user.roles in requiresRoles
    if (to.meta.requiresRoles?.length) {
      // console.log("Page require requiresRoles: ", to.meta.requiresRoles);
      let matchRoles = false;

      if (store.getters.userRoles?.length) {
        matchRoles = store.getters.userRoles.some((r) =>
          to.meta.requiresRoles.includes(r)
        );
      }

      // console.log("store.getters.userRoles: ", store.getters.userRoles);
      // console.log("to.meta.requiresRoles: ", to.meta.requiresRoles);

      if (!matchRoles) {
        console.log("Routing: User NOT has needed premission");
        const prevpage = from.path ? from.path : "/";
        next(prevpage);
        return;
      } else {
        // console.log("Routing: User has needed premission");
      }
    }
    // else {
    //   console.log("Routing: No req roles needed - common page");
    // }

    if (nextUrl) {
      // case I have next url, I have been redirected
      const url = nextUrl;
      nextUrl = null;
      next(url);
      return;
    }

    // case no next : most situation
    next();
    return;
  } else {
    next("/");
  }
}

export default router;
