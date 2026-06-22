<template>
  <div class="bk-layout">
    <!-- Navbar -->
    <nav class="bk-navbar">
      <div class="bk-navbar-inner">

        <!-- Mobile hamburger (left, visible < 640px) -->
        <button class="bk-ham bk-ham--mobile" @click="drawerOpen = true" aria-label="Open menu">
         <span class="material-symbols-rounded">menu</span>
        </button>

        <!-- Logo -->
        <router-link to="/" class="bk-logo">
          <img src="@/assets/images/logo-landing.svg" :alt="$appConfig.title" height="26" />
        </router-link>

        <!-- Desktop nav links (visible 992px+) -->
        <ul class="bk-nav-links">
          <li v-for="item in navItems" :key="item.id">
            <router-link
              :to="item.link"
              class="bk-nav-link"
              :class="{ 'bk-nav-link--active': isActive(item) }"
            >{{ item.label }}</router-link>
          </li>
        </ul>

        <!-- Right side -->
        <div class="bk-nav-right">
          <router-link v-if="!authorized" to="/login" class="bk-btn-login">Login</router-link>
          <router-link v-else to="/client/orders" class="bk-btn-login">My Orders</router-link>
          <!-- Tablet hamburger (right, visible 640–991px) -->
          <button class="bk-ham bk-ham--tablet" @click="menuOpen = !menuOpen" aria-label="Toggle menu">
            <span class="material-symbols-rounded">menu</span>
          </button>
        </div>

      </div>

      <!-- Tablet dropdown (640–991px) -->
      <div class="bk-dropdown" :class="{ 'bk-dropdown--open': menuOpen }">
        <ul>
          <li v-for="item in navItems" :key="item.id">
            <router-link
              :to="item.link"
              class="bk-dropdown-link"
              :class="{ 'bk-dropdown-link--active': isActive(item) }"
              @click.native="menuOpen = false"
            >{{ item.label }}</router-link>
          </li>
          <li>
            <router-link
              v-if="!authorized" to="/login"
              class="bk-dropdown-link bk-dropdown-link--login"
              @click.native="menuOpen = false"
            >Login</router-link>
            <router-link
              v-else to="/client/orders"
              class="bk-dropdown-link bk-dropdown-link--login"
              @click.native="menuOpen = false"
            >My Orders</router-link>
          </li>
        </ul>
      </div>

    </nav>

    <!-- Mobile drawer overlay -->
    <transition name="bk-fade">
      <div v-if="drawerOpen" class="bk-drawer-overlay" @click="drawerOpen = false" />
    </transition>

    <!-- Mobile drawer (< 640px) -->
    <div class="bk-drawer" :class="{ 'bk-drawer--open': drawerOpen }">
      <div class="bk-drawer-header">
        <img src="@/assets/images/logo-landing.svg" :alt="$appConfig.title" height="22" />
        <button class="bk-drawer-close" @click="drawerOpen = false">✕</button>
      </div>
      <ul>
        <li v-for="item in navItems" :key="item.id">
          <router-link
            :to="item.link"
            class="bk-drawer-link"
            :class="{ 'bk-drawer-link--active': isActive(item) }"
            @click.native="drawerOpen = false"
          >{{ item.label }}</router-link>
        </li>
        <li>
          <router-link
            v-if="!authorized" to="/login"
            class="bk-drawer-link bk-drawer-link--login"
            @click.native="drawerOpen = false"
          >Login</router-link>
          <router-link
            v-else to="/client/orders"
            class="bk-drawer-link bk-drawer-link--login"
            @click.native="drawerOpen = false"
          >My Orders</router-link>
        </li>
      </ul>
    </div>

    <!-- Alert Banner -->
    <div class="bk-alert">
      <div class="bk-alert-inner">
        <div class="bk-alert-icon-wrap">
        <PhoneIcon :width="36" :height="36" style="position: relative; z-index: 1;" />
        </div>
        
        <p class="mb-0">
          If your appointment is less than <strong class="red">48 hours away</strong>, please call or text
          <a href="tel:9493450213" class="red">949-345-0213</a>.
          For medical emergencies, please dial <strong class="red">911 immediately</strong>.
        </p>
      </div>
    </div>

    <!-- Content -->
    <div class="bk-content">
      <div>
        <slot />
      </div>
    </div>

    <!-- Footer links -->
    <div class="bk-footer-links">
      <router-link to="/terms">Terms &amp; Conditions</router-link>
      <router-link to="/policy">Privacy Policy</router-link>
    </div>
  </div>
</template>

<script>
import { mapGetters } from 'vuex';
import { PhoneIcon } from '@/assets/icons'

export default {
  components: { PhoneIcon },
  data() {
    return {
      menuOpen: false,
      drawerOpen: false,
      navItems: [
        { id: 0, label: 'Home',             link: '/',            match: null },
        { id: 1, label: 'Book a Ride',      link: '/ride/step-1?fresh=1', match: '/ride' },
        { id: 2, label: 'About us',         link: '/about',       match: null },
        { id: 3, label: 'FAQ',              link: '/faq',         match: null },
        { id: 4, label: 'Become a partner', link: '/partner',     match: null },
      ],
    };
  },
  computed: {
    ...mapGetters(['authorized']),
  },
  watch: {
    $route() { this.menuOpen = false; this.drawerOpen = false; },
  },
    mounted() {                                          
    window.addEventListener('resize', this.onResize);
  },
  beforeDestroy() {                                  
    window.removeEventListener('resize', this.onResize);
  },
  methods: {
    onResize() {                                 
      if (window.innerWidth >= 992) {
        this.menuOpen = false;
        this.drawerOpen = false;
      } else if (window.innerWidth >= 640) {
        this.drawerOpen = false;
      }
    },
    isActive(item) {                               
      const m = item.match || item.link;
      return this.$route.path === item.link || (item.match && this.$route.path.startsWith(m));
    },
  },
};
</script>

<style lang="scss">
@import "@/assets/scss/booking-step-actions";
@import "@/assets/scss/ios-booking-form";

/* ── Global overrides for booking pages (not scoped) ── */
.bk-layout .pac-container { z-index: 9999 !important; }
</style>

<style lang="scss" scoped>
$teal: #0F8881;
$teal-dk: #0a7870;
$white: #fff;

/* ── Layout ── */
.bk-layout {
  min-height: 100vh;
  background: #e8f5f4;
  display: flex;
  flex-direction: column;
  font-family: 'Inter', 'Montserrat', sans-serif;
}

/* ── Navbar ── */
.bk-navbar {
  background: $teal;
  position: sticky;
  top: 0;
  z-index: 200;
}

.bk-navbar-inner {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 16px;
  height: 60px;
  display: flex;
  align-items: center;
  gap: 12px;
}

.bk-logo img { display: block; }

/* Desktop nav links */
.bk-nav-links {
  display: none;
  @media (min-width: 992px) {
    display: flex;
    align-items: center;
    list-style: none;
    margin: 0 auto;
    padding: 0;
    gap: 4px;
  }
}

.bk-nav-link {
  display: block;
  padding: 7px 14px;
  border-radius: 20px;
  font-weight: 500;
  font-size: 14px;
  color: rgba(255,255,255,.88);
  text-decoration: none;
  white-space: nowrap;
  transition: background .15s, color .15s;
  font-family: 'Montserrat', sans-serif;
  &:hover { color: $white; background: rgba(255,255,255,.14); }
  &--active {
    background: $white !important;
    color: #1a2a2a !important;
    font-weight: 700;
    &:hover { background: $white; }
  }
}

/* Right side */
.bk-nav-right {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-left: auto;
  @media (min-width: 992px) { margin-left: 0; }
}

.bk-btn-login {
  display: none;
  @media (min-width: 992px) {
    display: inline-block;
    padding: 7px 22px;
    border: 2px solid $white;
    border-radius: 22px;
    font-weight: 600;
    font-size: 14px;
    color: $white;
    text-decoration: none;
    font-family: 'Montserrat', sans-serif;
    white-space: nowrap;
    transition: background .15s, color .15s;
    &:hover { background: $white; color: $teal; }
  }
}

/* ── Hamburger shared ── */
.bk-ham {
  display: flex;
  align-items: center;
  justify-content: center;
  border: none;
  cursor: pointer;
  width: 30px;
  height: 30px;
  border-radius: 50%;
  flex-shrink: 0;

  .material-symbols-rounded {
    font-size: 20px;
    font-variation-settings: 'FILL' 0, 'wght' 400;
  }
}

.bk-ham--mobile {
  background: $white;
  .material-symbols-rounded { color: $teal; }  // teal icon on white bg
  @media (min-width: 640px) { display: none; }
}

/* Tablet ham — transparent, white lines, right */
.bk-ham--tablet {
  display: none;
  background: transparent;
  .material-symbols-rounded { color: $white; } 
  @media (min-width: 640px) and (max-width: 991px) { display: flex; }
}

/* ── Tablet dropdown ── */
.bk-dropdown {
  background: $teal-dk;
  max-height: 0;
  overflow: hidden;
  transition: max-height .3s ease;
  &--open { max-height: 400px; }
  ul { list-style: none; margin: 0; padding: 6px 0; }
}

.bk-dropdown-link {
  display: block;
  padding: 13px 20px;
  font-size: 14px;
  font-weight: 500;
  color: rgba(255,255,255,.88);
  text-decoration: none;
  border-bottom: 1px solid rgba(255,255,255,.07);
  font-family: 'Montserrat', sans-serif;
  &:hover { background: rgba(255,255,255,.1); color: $white; }
  &--active { color: $white; font-weight: 700; background: rgba(255,255,255,.08); }
  &--login { color: $white; font-weight: 700; border-bottom: none; padding-top: 16px; }
}

/* ── Mobile drawer overlay ── */
.bk-drawer-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0,0,0,.45);
  z-index: 299;
}

/* ── Mobile drawer ── */
.bk-drawer {
  position: fixed;
  top: 0;
  left: 0;
  height: 100vh;
  width: 260px;
  background: $teal-dk;
  z-index: 300;
  transform: translateX(-100%);
  transition: transform .3s ease;
  &--open { transform: translateX(0); }
  ul { list-style: none; margin: 0; padding: 8px 0; }
}

.bk-drawer-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 18px;
  border-bottom: 1px solid rgba(255,255,255,.12);
}

.bk-drawer-close {
  background: rgba(255,255,255,.12);
  border: none;
  color: $white;
  font-size: 16px;
  width: 30px;
  height: 30px;
  border-radius: 50%;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  &:hover { background: rgba(255,255,255,.2); }
}

.bk-drawer-link {
  display: block;
  padding: 14px 20px;
  font-size: 15px;
  font-weight: 500;
  color: rgba(255,255,255,.88);
  text-decoration: none;
  border-bottom: 1px solid rgba(255,255,255,.07);
  font-family: 'Montserrat', sans-serif;
  &:hover { background: rgba(255,255,255,.1); color: $white; }
  &--active { color: $white; font-weight: 700; background: rgba(255,255,255,.08); }
  &--login { color: $white; font-weight: 700; border-bottom: none; padding-top: 18px; }
}

/* Overlay fade transition */
.bk-fade-enter-active, .bk-fade-leave-active { transition: opacity .25s; }
.bk-fade-enter, .bk-fade-leave-to { opacity: 0; }

/* ── Alert Banner ── */
.bk-alert {
  background: $teal; 
  padding: 16px 14px;
}

.bk-alert-inner {
  max-width: 1200px;
  margin: 0 auto;
  padding: 14px 20px;
  display: flex;
  align-items: center;
  gap: 14px;
  background: #FFDDDDB2;
  border: 1px solid #E33C3C;
  border-radius: 16px;
}

.bk-alert-icon-wrap {
  width: 56px;
  height: 56px;
  min-width: 56px;
  background: #fde8e8;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  position: relative;
  overflow: visible;

  &::before {
    content: '';
    position: absolute;
    width: 24px;
    height: 24px;
    background: #E52323;
    border-radius: 50%;
    top: 8px;
    left: 8px;
    z-index: 0;
  }
}

.bk-alert p {
  font-size: 13px;
  color: #444;
  line-height: 1.5;
  margin: 0;
}

.red { color: #e84040 !important; font-weight: 700; text-decoration: none; }

/* ── Content wrapper ── */
.bk-content {
  flex: 1;
  width: 100%;
  margin: 0 auto;
  padding-top: 30px;
  background: #0F8881;
}

.bk-content > div {
  background: linear-gradient(180deg, #38A7A3 0%, #ECF0F0 100%);
  border-radius: 32px 32px 0 0;
  padding: 30px 28px 36px;
  box-shadow: 0 32px 100px rgba(8, 42, 40, 0.18);
  border: 1px solid white;
  @media (max-width: 600px) { padding: 20px 10px; border-radius: 24px 24px 0 0; }
}

/* ── Footer ── */
.bk-footer-links {
  text-align: center;
  padding: 16px;
  display: flex;
  justify-content: center;
  gap: 24px;
  a {
    font-size: 12px;
    color: #666;
    text-decoration: none;
    &:hover { color: $teal; }
  }
}
</style>