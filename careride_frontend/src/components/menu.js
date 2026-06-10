export const menuItems = [
  {
    id: 0,
    label: "Main",
    icon: "home",
    link: "/",
    // requiresRoles: ["a", "v", "d", "c"],
  },
  {
    id: 1,
    label: "Book a ride",
    icon: "directions_bus",
    link: "/ride",
  },
  {
    id: 2,
    label: "About us",
    icon: "info",
    link: "/about",
  },
  {
    id: 3,
    label: "FAQ",
    icon: "quiz",
    link: "/faq",
  },
  {
    id: 4,
    label: "Become a partner",
    icon: "handshake",
    link: "/partner",
  },

  // Admin pages
  {
    id: 11,
    label: "Clients",
    icon: "account_circle",
    link: "/admin/clients",
    requiresAuth: true,
    requiresRoles: ["a"],
  },
  {
    id: 12,
    label: "Vendors",
    icon: "supervisor_account",
    link: "/admin/vendors",
    requiresAuth: true,
    requiresRoles: ["a"],
  },
  {
    id: 13,
    label: "Orders",
    icon: "list_alt",
    requiresAuth: true,
    requiresRoles: ["a"],
    isMenuCollapsed: false,
    subItems: [
      {
        id: 131,
        label: "Available orders",
        link: "/admin/orders/available",
      },
      {
        id: 132,
        label: "Orders history",
        link: "/admin/orders/history",
      },
    ],
  },

  // Vendor pages
  {
    id: 20,
    label: "Orders",
    icon: "list_alt",
    requiresAuth: true,
    requiresRoles: ["v"],
    isMenuCollapsed: false,
    subItems: [
      {
        id: 201,
        label: "Available orders",
        link: "/vendor/orders/available",
      },
      {
        id: 202,
        label: "Orders history",
        link: "/vendor/orders/history",
      },
    ],
  },
  {
    id: 21,
    label: "Profile",
    icon: "account_circle",
    requiresAuth: true,
    requiresRoles: ["v"],
    isMenuCollapsed: false,
    subItems: [
      {
        id: 211,
        label: "Personal info",
        link: "/vendor/profile/info",
      },
      {
        id: 212,
        label: "Vehicles",
        link: "/vendor/profile/vehicles",
      },
      {
        id: 213,
        label: "Drivers",
        link: "/vendor/profile/drivers",
      },
    ],
  },

  // Client (User)
  {
    id: 30,
    label: "Main",
    icon: "home",
    link: "/",
    requiresAuth: true,
    requiresRoles: ["c"],
  },
  {
    id: 31,
    label: "Book a ride",
    icon: "directions_bus",
    link: "/ride",
    requiresAuth: true,
    requiresRoles: ["c"],
  },
  {
    id: 32,
    label: "About us",
    icon: "info",
    link: "/about",
    requiresAuth: true,
    requiresRoles: ["c"],
  },
  {
    id: 33,
    label: "FAQ",
    icon: "quiz",
    link: "/faq",
    requiresAuth: true,
    requiresRoles: ["c"],
  },
  {
    id: 34,
    label: "Become a partner",
    icon: "handshake",
    link: "/partner",
    requiresAuth: true,
    requiresRoles: ["c"],
  },
  {
    id: 35,
    label: "Profile",
    icon: "account_circle",
    requiresAuth: true,
    requiresRoles: ["c"],
    isMenuCollapsed: false,
    subItems: [
      {
        id: 350,
        label: "Current orders",
        link: "/client/orders",
      },
      {
        id: 351,
        label: "Personal info",
        link: "/client/info",
      },
      {
        id: 353,
        label: "Ride profiles",
        link: "/client/profiles",
      },
      {
        id: 353,
        label: "Ride history",
        link: "/client/history",
      },
    ],
  },

  // Driver
  {
    id: 40,
    label: "Orders",
    icon: "list_alt",
    requiresAuth: true,
    requiresRoles: ["d"],
    isMenuCollapsed: false,
    subItems: [
      {
        id: 401,
        label: "Available order",
        link: "/driver/order",
      },
      {
        id: 402,
        label: "Orders history",
        link: "/driver/history",
      },
    ],
  },






  // {
  //   id: 12345,
  //   label: "Test auth page",
  //   icon: "handshake",
  //   link: "/page-2",
  //   requiresAuth: true,
  //   requiresRoles: ["a", "v", "d", "c"],
  // },
];
