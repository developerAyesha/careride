export default [
  {
    path: "*",
    meta: {
      requiresAuth: false,
      // requiresRoles: ["a", "v", "d", "c"],
    },
    redirect: {
      path: "/",
    },
  },
  {
    path: "/",
    name: "main",
    meta: {
      requiresAuth: false,
    },
    component: () => import("../views/pages/landing/"),
  },
  {
    path: "/login",
    name: "login",
    meta: {
      requiresAuth: false,
    },
    component: () => import("../views/pages/login"),
  },
  {
    path: "/signup",
    name: "signup",
    meta: {
      requiresAuth: false,
    },
    component: () => import("../views/pages/signup"),
  },
  {
    path: "/forgot-password",
    name: "forgot-password",
    meta: {
      requiresAuth: false,
    },
    component: () => import("../views/pages/forgot-password"),
  },
  {
    path: "/ride",
    meta: {
      requiresAuth: false,
    },
    redirect: {
      path: "/ride/step-1",
      query: { fresh: "1" },
    },
  },
  {
    path: "/ride/step-1",
    name: "ride-step-1",
    meta: {
      requiresAuth: false,
    },
    component: () => import("../views/pages/ride/step-1"),
  },
  {
    path: "/ride/step-2",
    name: "ride-step-2",
    meta: {
      requiresAuth: false,
    },
    component: () => import("../views/pages/ride/step-2"),
  },
  {
    path: "/ride/step-3",
    name: "ride-step-3",
    meta: {
      requiresAuth: false,
    },
    component: () => import("../views/pages/ride/step-3"),
  },
  {
    path: "/ride/step-4",
    name: "ride-step-4",
    meta: {
      requiresAuth: false,
    },
    component: () => import("../views/pages/ride/step-4"),
  },
  {
    path: "/ride/step-5",
    name: "ride-step-5",
    meta: {
      requiresAuth: false,
    },
    component: () => import("../views/pages/ride/step-5"),
  },
  {
    path: "/ride/step-6",
    name: "ride-step-6",
    meta: {
      requiresAuth: false,
    },
    component: () => import("../views/pages/ride/step-6"),
  },
  {
    path: "/about",
    name: "about",
    meta: {
      requiresAuth: false,
    },
    component: () => import("../views/pages/about"),
  },
  {
    path: "/faq",
    name: "faq",
    meta: {
      requiresAuth: false,
    },
    component: () => import("../views/pages/faq"),
  },
  {
    path: "/partner",
    name: "partner",
    meta: {
      requiresAuth: false,
    },
    component: () => import("../views/pages/partner"),
  },
  {
    path: "/terms",
    name: "terms",
    meta: {
      requiresAuth: false,
    },
    component: () => import("../views/pages/terms"),
  },
  {
    path: "/policy",
    name: "policy",
    meta: {
      requiresAuth: false,
    },
    component: () => import("../views/pages/policy"),
  },

  // Admin pages
  {
    path: "/admin/login",
    name: "admin-login",
    meta: {
      requiresAuth: false,
    },
    component: () => import("../views/pages/admin/login"),
  },
  {
    path: "/admin/clients",
    name: "admin-clients",
    meta: {
      requiresAuth: true,
      requiresRoles: ["a"],
    },
    component: () => import("../views/pages/admin/clients"),
  },
  {
    path: "/admin/clients/:id",
    name: "admin-client",
    meta: {
      requiresAuth: true,
      requiresRoles: ["a"],
    },
    component: () => import("../views/pages/admin/client"),
  },
  {
    path: "/admin/vendors",
    name: "admin-vendors",
    meta: {
      requiresAuth: true,
      requiresRoles: ["a"],
    },
    component: () => import("../views/pages/admin/vendors"),
  },
  {
    path: "/admin/vendors/:id",
    name: "admin-vendor",
    meta: {
      requiresAuth: true,
      requiresRoles: ["a"],
    },
    component: () => import("../views/pages/admin/vendor"),
  },
  {
    path: "/admin/orders/available",
    name: "admin-orders-available",
    meta: {
      requiresAuth: true,
      requiresRoles: ["a"],
    },
    component: () => import("../views/pages/admin/orders/available"),
  },
  {
    path: "/admin/orders/history",
    name: "admin-orders-history",
    meta: {
      requiresAuth: true,
      requiresRoles: ["a"],
    },
    component: () => import("../views/pages/admin/orders/history"),
  },

  // Vendor pages
  {
    path: "/vendor/orders/available",
    name: "vendor-orders-available",
    meta: {
      requiresAuth: true,
      requiresRoles: ["v"],
    },
    component: () => import("../views/pages/vendor/orders/available"),
  },
  {
    path: "/vendor/orders/available/:id",
    name: "vendor-orders-available-detail",
    meta: {
      requiresAuth: true,
      requiresRoles: ["v"],
    },
    component: () => import("../views/pages/vendor/orders/available-detail"),
  },
  {
    path: "/vendor/orders/history",
    name: "vendor-orders-history",
    meta: {
      requiresAuth: true,
      requiresRoles: ["v"],
    },
    component: () => import("../views/pages/vendor/orders/history"),
  },
  {
    path: "/vendor/profile/info",
    name: "vendor-profile-info",
    meta: {
      requiresAuth: true,
      requiresRoles: ["v"],
    },
    component: () => import("../views/pages/vendor/profile/info"),
  },
  {
    path: "/vendor/profile/vehicles",
    name: "vendor-profile-vehicles",
    meta: {
      requiresAuth: true,
      requiresRoles: ["v"],
    },
    component: () => import("../views/pages/vendor/profile/vehicles"),
  },
  {
    path: "/vendor/profile/drivers",
    name: "vendor-profile-drivers",
    meta: {
      requiresAuth: true,
      requiresRoles: ["v"],
    },
    component: () => import("../views/pages/vendor/profile/drivers"),
  },

  // Client (user) pages
  {
    path: "/client/orders",
    name: "client-orders",
    meta: {
      requiresAuth: true,
      requiresRoles: ["c"],
    },
    component: () => import("../views/pages/client/orders"),
  },
  {
    path: "/client/info",
    name: "client-info",
    meta: {
      requiresAuth: true,
      requiresRoles: ["c"],
    },
    component: () => import("../views/pages/client/info"),
  },
  {
    path: "/client/history",
    name: "client-history",
    meta: {
      requiresAuth: true,
      requiresRoles: ["c"],
    },
    component: () => import("../views/pages/client/history"),
  },
  {
    path: "/client/profiles",
    name: "client-profiles",
    meta: {
      requiresAuth: true,
      requiresRoles: ["c"],
    },
    component: () => import("../views/pages/client/profiles"),
  },
  {
    path: "/payment-result",
    name: "payment-result",
    meta: {
      requiresAuth: true,
      requiresRoles: ["c"],
    },
    component: () => import("../views/pages/client/payment-result"),
  },

  // Driver pages
  {
    path: "/driver/order",
    name: "driver-order",
    meta: {
      requiresAuth: true,
      requiresRoles: ["d"],
    },
    component: () => import("../views/pages/driver/order"),
  },
  {
    path: "/driver/history",
    name: "driver-history",
    meta: {
      requiresAuth: true,
      requiresRoles: ["d"],
    },
    component: () => import("../views/pages/driver/history"),
  },

  // {
  //   path: "/page-2",
  //   meta: {
  //     requiresAuth: true,
  //     requiresRoles: ["a", "v", "d", "c"],
  //   },
  //   component: () => import("../views/pages/page-2"),
  // },
];
