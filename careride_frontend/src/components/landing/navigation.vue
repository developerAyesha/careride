<template>
  <nav
    class="navbar"
    :class="inFooter ? 'navbar-expand footer-flex-wrap' : 'navbar-expand-lg'"
  >
    <router-link
      v-if="inFooter"
      to="/"
      class="header-logo col-12 p-0 col-lg-auto text-center text-lg-left"
    >
      <img
        src="@/assets/images/logo-landing.svg"
        :alt="$appConfig.title"
        width="118"
        height="26"
      />
    </router-link>
    <router-link v-else to="/" class="header-logo">
      <!-- <img
        src="@/assets/images/logo-sm.svg"
        :alt="$appConfig.title"
        class="d-block d-lg-none"
        width="36"
        height="26"
      /> -->
      <!-- class="d-none d-lg-block" -->
      <img
        src="@/assets/images/logo-landing.svg"
        :alt="$appConfig.title"
        width="118"
        height="26"
      />
    </router-link>

    <button
      v-if="!inFooter"
      class="navbar-toggler button-menu-mobile ml-auto"
      @click="toggleMenu"
    >
      <span class="material-symbols-rounded">menu</span>
    </button>

    <div
      class="navbar-collapse navbar-menu-wrapper"
      :class="[inFooter ? 'footer-flex-wrap' : 'in-header']"
    >
      <ul
        class="navbar-nav navbar-menu"
        :class="[inFooter ? 'footer-menu footer-flex-wrap col-12 col-lg-auto text-center text-lg-left mt-3 mt-lg-0' : 'header-menu mx-auto']"
      >
        <li
          class="nav-item"
          v-for="item in menuItemsPublic"
          :key="item.id"
          :class="{ 'col-12 col-lg-auto p-0 my-2 my-lg-0': inFooter }"
        >
          <router-link
            @click.native="closeMenuOnMobile"
            :to="item.link"
            v-if="!hasItems(item)"
            class="nav-link"
          >
            <i class="material-symbols-rounded" :title="item.label">{{
              item.icon
            }}</i>
            <span class="nav-item-text">{{ item.label }}</span>
          </router-link>
        </li>
      </ul>

      <div v-if="Boolean(notifyCount)" class="col-auto notify-box-col mr-3">
        <router-link to="/client/orders" class="notify-box">
          <span class="material-symbols-rounded animate__swing">
            notification_important
          </span>
          <span class="badge badge-danger rounded-circle noti-icon-badge">{{
            notifyCount
          }}</span>
        </router-link>
      </div>

      <div
        class="col-auto navbar-menu-btns"
        :class="{ 'col-12 col-lg-auto mt-3 mt-lg-0 ': inFooter }"
      >
        <template v-if="!authorized">
          <router-link
            @click.native="closeMenuOnMobile"
            class="btn btn-outline-secondary"
            to="/signup"
            >Sign up</router-link
          >
          <router-link
            @click.native="closeMenuOnMobile"
            class="btn btn-outline-secondary ml-2"
            to="/login"
            >Log in</router-link
          >
        </template>

        <!-- <a
          v-else
          class="btn btn-outline-secondary"
          href="/logout"
          @click.prevent="
            handleLogout();
            closeMenuOnMobile();
          "
        >
          <i class="fe-log-out mr-1"></i>
          <span>Log out</span>
        </a> -->
      </div>
    </div>

    <!-- <pre>ordersWait: {{ ordersWait.length }}</pre> -->
    <!-- <pre>ordersAccepted: {{ ordersAccepted.length }}</pre> -->
    <!-- <pre>ordersInWork: {{ ordersInWork.length }}</pre> -->
  </nav>
</template>

<script>
import store from "@/store";
import { mapState, mapGetters, mapActions } from "vuex";
import { menuItems } from "@/components/menu";

export default {
  props: {
    inFooter: {
      type: Boolean,
      default: false,
    },
  },
  data() {
    return {
      menuItems: menuItems,
    };
  },
  computed: {
    ...mapGetters(["authorized", "menuState", "client"]),
    menuItemsPublic() {
      // filter menu items if client and if public
      if (this.authorized) {
        const profile = {
          label: "Profile",
          icon: "account_circle",
          link: "/client/orders",
        };
        return [...this.menuItems.filter((m) => !m.requiresAuth), profile];
      } else {
        return this.menuItems.filter((m) => !m.requiresAuth);
      }
    },

    // logic from Topbar...
    // ordersWait() {
    //   const filtered = this.client?.currentorders?.items.filter(
    //     (order) => Number(order.status) === 0
    //   );

    //   return filtered;
    // },
    // ordersAccepted() {
    //   const filtered = this.client?.currentorders?.items.filter(
    //     (order) => Number(order.status) === 1
    //   );

    //   return filtered;
    // },
    // // pick up or work
    // ordersInWork() {
    //   const filtered = this.client?.currentorders?.items.filter(
    //     (order) => Number(order.status) === 3 || Number(order.status) === 4
    //   );

    //   return filtered;
    // },
    notifyCount() {
      // let count = 0;

      // if (this.authorized && !this.inFooter) {
      //   if (this.ordersWait && this.ordersWait.length) {
      //     count += this.ordersWait.length;
      //   }

      //   if (this.ordersAccepted && this.ordersAccepted.length) {
      //     count += this.ordersAccepted.length;
      //   }

      //   if (this.ordersInWork && this.ordersInWork.length) {
      //     count += this.ordersInWork.length;
      //   }
      // }

      // return count;

      // return (this.authorized && !this.inFooter && this.client?.orderstatuses?.length) ? this.client.orderstatuses.length : ""
      return (!this.inFooter && this.client?.orderstatuses?.length) ? this.client.orderstatuses.length : ""
    },
  },
  methods: {
    ...mapActions({
      logout: "logout",
    }),
    // async handleLogout() {
    //   await this.$store.dispatch("logout");
    //   await this.$router.push("/main").catch(() => {}); // main or login...
    // },
    toggleMenu() {
      store.commit("toggleMenu");
    },
    hasItems(item) {
      return item.subItems !== undefined ? item.subItems.length > 0 : false;
    },
    closeMenuOnMobile() {
      if (window.innerWidth && window.innerWidth < 991.8) {
        this.$store.commit("closeMenu");
      }
    },
  },
};
</script>

<style lang="scss" scoped>
.navbar {
  padding: 0;
  min-height: 70px;
}

.navbar-toggler {
  color: #fff;
}

.btn.btn-outline-secondary {
  border-color: #fff;
  color: #fff;

  &:hover {
    border-color: #199f97;
    color: #199f97;
    background: none transparent;
  }
}

.navbar-menu {
  justify-content: space-between;
  margin: 0 30px 0 auto;
  width: 65%;
  max-width: 840px;

  &.header-menu {
    padding: 0 30px;
  }

  // @media (max-width: 992px) {
  //   width: 100%;
  // }
}

.nav-link {
  font-family: "Montserrat", sans-serif;
  font-weight: 500;
  font-size: 15px;
  color: #fff;
  padding: 0;
  transition: color 0.15s ease-in-out, background-color 0.15s ease-in-out,
    border-color 0.15s ease-in-out, box-shadow 0.15s ease-in-out;

  &:hover,
  &.router-link-exact-active {
    color: #199f97;
  }
}

.nav-link .material-symbols-rounded {
  vertical-align: middle;
  position: relative;
  top: -2px;
  font-size: 20px;
  font-weight: 400;
  margin-right: 6px;
}

// notify bell
@keyframes swing {
  0%,
  20% {
    transform: rotate3d(0, 0, 1, 0);
  }

  30% {
    transform: rotate3d(0, 0, 1, 20deg);
  }

  40% {
    transform: rotate3d(0, 0, 1, -10deg);
  }

  50% {
    transform: rotate3d(0, 0, 1, 10deg);
  }

  60%,
  100% {
    transform: rotate3d(0, 0, 1, 0);
  }
}

.animate__swing {
  transform-origin: top center;
  animation: swing 2s linear infinite;
}

.notify-box .material-symbols-rounded {
  color: #fff;
}

.notify-box:hover .material-symbols-rounded {
  color: #199f97;
  transition: color 0.15s ease-in-out;
}

@media (min-width: 992px) and (max-width: 1240px) {
  .footer-menu {
    justify-content: space-around;
  }

  .navbar-menu {
    margin: 0 20px;
    flex-grow: 1;
  }

  .nav-item {
    text-align: center;
    position: relative;
    top: 3px;
  }

  .nav-item-text {
    display: block;
  }
}

@media (max-width: 992px) {
  .footer-flex-wrap {
    flex-wrap: wrap;
  }

  // header menu
  .navbar-menu-wrapper.in-header {
    position: absolute;
    background: #1f2726b2;
    top: 70px;
    left: 0;
    right: 0;
    max-height: 0;
    overflow: hidden;
    border-top: 1px solid transparent;
    transition: max-height 0.3s linear, border-top-color 0.3s linear;

    .navbar-menu {
      width: 100%;
      margin: 0;
      text-align: center;
      margin: 16px 0 0 0;
    }

    .nav-item {
      margin: 12px 0;
    }

    .navbar-menu-btns {
      text-align: center;
      margin: 24px 0 40px 0;
    }

    .notify-box-col {
      text-align: center;
      margin: 12px 0;
    }
  }

  .sidebar-enable .navbar-menu-wrapper.in-header {
    border-top: 1px solid #000;
    max-height: 60vh;
  }
}

@media (max-width: 992px) and (orientation: landscape) {
  .sidebar-enable .navbar-menu-wrapper.in-header {
    max-height: 100vh;
  }
}
</style>
