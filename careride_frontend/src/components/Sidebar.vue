<script>
import { mapState, mapGetters } from "vuex";
import { menuItems } from "@/components/menu";

/**
 * Sidebar component
 */
export default {
  data() {
    return {
      menuItems: menuItems,
    };
  },
  props: {
    type: {
      type: String,
      required: true,
    },
    width: {
      type: String,
      required: true,
    },
    size: {
      type: String,
      required: true,
    },
    menu: {
      type: String,
      required: true,
    },
    topbar: {
      type: String,
      required: true,
    },
  },
  computed: {
    ...mapState(["layout"]),
    ...mapGetters(["user", "userRoles", "authorized"]),
    menuItemsByRoles() {
      // filter menu items if req roles include user.roles
      return this.menuItems.filter((m) => {
        let match = false;

        if (m.requiresRoles) {
          if (this.userRoles && this.userRoles.length) {
            match = this.userRoles.some((r) => m.requiresRoles.includes(r));
          }
        } else {
          // hide authorized user public pages
          if (!this.authorized) {
            match = true;
          }
        }

        return match;
      });
    },
  },
  watch: {
    type: {
      immediate: true,
      handler(newVal, oldVal) {
        if (newVal !== oldVal) {
          switch (newVal) {
            case "dark":
              document.body.setAttribute("data-sidebar-color", "dark");
              break;
            case "light":
              document.body.setAttribute("data-sidebar-color", "light");
              break;
            case "brand":
              document.body.setAttribute("data-sidebar-color", "brand");
              break;
            case "gradient":
              document.body.setAttribute("data-sidebar-color", "gradient");
              break;
            default:
              document.body.setAttribute("data-sidebar-color", "light");
              break;
          }
        }
      },
    },
    width: {
      immediate: true,
      handler(newVal, oldVal) {
        if (newVal !== oldVal) {
          switch (newVal) {
            case "boxed":
              document.body.setAttribute("data-layout-width", "boxed");
              document.body.setAttribute("data-sidebar-size", "condensed");
              break;
            case "fluid":
              document.body.setAttribute("data-layout-width", "fluid");
              document.body.removeAttribute("data-sidebar-size");
              document.body.removeAttribute("data-layout-width");
              break;
            default:
              document.body.setAttribute("data-layout-mode", "fluid");
              break;
          }
        }
      },
    },
    size: {
      immediate: true,
      handler(newVal, oldVal) {
        if (newVal !== oldVal) {
          switch (newVal) {
            case "default":
              document.body.setAttribute("data-sidebar-size", "default");
              break;
            case "condensed":
              document.body.setAttribute("data-sidebar-size", "condensed");
              break;
            case "compact":
              document.body.setAttribute("data-sidebar-size", "compact");
              break;
            default:
              document.body.setAttribute("data-sidebar-size", "default");
              break;
          }
        }
      },
    },
    menu: {
      immediate: true,
      handler(newVal, oldVal) {
        if (newVal !== oldVal) {
          switch (newVal) {
            case "fixed":
              document.body.setAttribute("data-layout-menu-position", "fixed");
              break;
            case "scrollable":
              document.body.setAttribute(
                "data-layout-menu-position",
                "scrollable"
              );
              break;
            default:
              document.body.setAttribute("data-layout-menu-position", "fixed");
              break;
          }
        }
      },
    },
    topbar: {
      immediate: true,
      handler(newVal, oldVal) {
        if (newVal !== oldVal) {
          switch (newVal) {
            case "dark":
              document.body.setAttribute("data-topbar-color", "dark");
              break;
            case "light":
              document.body.setAttribute("data-topbar-color", "light");
              break;
            default:
              document.body.setAttribute("data-topbar-color", "dark");
              break;
          }
        }
      },
    },
  },
  mounted: function () {
    this._activateMenuDropdown();
    this.$router.afterEach((routeTo, routeFrom) => {
      this._activateMenuDropdown();
    });
  },
  methods: {
    /**
     * Returns true or false if given menu item has child or not
     * @param item menuItem
     */
    hasItems(item) {
      return item.subItems !== undefined ? item.subItems.length > 0 : false;
    },

    _activateMenuDropdown() {
      const resetParent = (el) => {
        el.classList.remove("active");
        var parent = el.parentElement;
        if (parent) {
          parent.classList.remove("menuitem-active");
          const parent2 = parent.parentElement;
          if (parent2) {
            const parent3 = parent2.parentElement;
            if (parent3) {
              parent3.classList.remove("show");
              const parent4 = parent3.parentElement;
              if (parent4) {
                parent4.classList.remove("menuitem-active");
              }
            }
          }
        }
      };
      var links = document.getElementsByClassName("side-nav-link-ref");
      var matchingMenuItem = null;
      const paths = [];
      for (let i = 0; i < links.length; i++) {
        // reset menu
        resetParent(links[i]);
      }
      for (var i = 0; i < links.length; i++) {
        paths.push(links[i]["pathname"]);
      }
      var itemIndex = paths.indexOf(window.location.pathname);
      if (itemIndex === -1) {
        const strIndex = window.location.pathname.lastIndexOf("/");
        const item = window.location.pathname.substr(0, strIndex).toString();
        matchingMenuItem = links[paths.indexOf(item)];
      } else {
        matchingMenuItem = links[itemIndex];
      }

      if (matchingMenuItem) {
        matchingMenuItem.classList.add("active");
        var parent = matchingMenuItem.parentElement;

        /**
         * TODO: This is hard coded way of expading/activating parent menu dropdown and working till level 3.
         * We should come up with non hard coded approach
         */
        if (parent) {
          parent.classList.add("menuitem-active");
          const parent2 = parent.parentElement;
          if (parent2) {
            const parent3 = parent2.parentElement;
            if (parent3) {
              parent3.classList.add("show");
              const parent4 = parent3.parentElement;
              if (parent4) {
                parent4.classList.add("menuitem-active");
              }
            }
          }
        }
      }
    },
    closeMenuOnMobile() {
      if (window.innerWidth && window.innerWidth < 991.8) {
        this.$store.commit("closeMenu");
      }
    },
  },
};
</script>

<template>
  <!-- ========== Left Sidebar Start ========== -->
  <div class="left-side-menu">
    <!-- LOGO -->
    <div class="logo-box">
      <router-link to="/" class="logo logo-light text-center">
        <span class="logo-sm">
          <img
            src="@/assets/images/logo-sm.svg"
            :alt="$appConfig.title"
            width="36"
            height="26"
          />
        </span>
        <span class="logo-lg">
          <img
            src="@/assets/images/logo.svg"
            :alt="$appConfig.title"
            width="118"
            height="26"
          />
        </span>
      </router-link>
    </div>

    <div id="sidebar-menu">
      <ul class="list-unstyled" id="side-menu">
        <template v-for="item in menuItemsByRoles">
          <li class="menu-title" v-if="item.isTitle" :key="item.id">
            {{ item.label }}
          </li>
          <li v-if="!item.isTitle && !item.isLayout" :key="item.id">
            <a
              v-if="hasItems(item)"
              href="javascript:void(0);"
              @click="item.isMenuCollapsed = !item.isMenuCollapsed"
              :class="{
                'has-arrow': !item.badge,
                'has-dropdown': item.badge,
              }"
            >
              <i class="material-symbols-rounded">{{ item.icon }}</i>
              <span>{{ item.label }}</span>
              <span class="menu-arrow" v-if="!item.badge"></span>
              <span
                :class="`badge badge-pill badge-${item.badge.variant} float-right`"
                v-if="item.badge"
                >{{ item.badge.text }}</span
              >
            </a>

            <router-link
              :to="item.link"
              v-if="!hasItems(item)"
              class="side-nav-link-ref"
              @click.native="closeMenuOnMobile"
            >
              <i class="material-symbols-rounded">{{ item.icon }}</i>
              <span>{{ item.label }}</span>
              <span
                :class="`badge badge-pill badge-${item.badge.variant} float-right`"
                v-if="item.badge"
                >{{ item.badge.text }}</span
              >
            </router-link>
            <div
              class="collapse"
              :class="{ show: item.isMenuCollapsed }"
              id="sidebarTasks"
            >
              <ul
                v-if="hasItems(item)"
                class="sub-menu nav-second-level"
                aria-expanded="false"
              >
                <li v-for="(subitem, index) of item.subItems" :key="index">
                  <router-link
                    :to="subitem.link"
                    v-if="!hasItems(subitem)"
                    class="side-nav-link-ref"
                    @click.native="closeMenuOnMobile"
                    >{{ subitem.label }}</router-link
                  >
                  <a
                    v-if="hasItems(subitem)"
                    class="side-nav-link-a-ref has-arrow"
                    @click="subitem.isMenuCollapsed = !subitem.isMenuCollapsed"
                    href="javascript:void(0);"
                    >{{ subitem.label }}
                    <span class="menu-arrow"></span>
                  </a>

                  <div
                    class="collapse"
                    :class="{ show: subitem.isMenuCollapsed }"
                  >
                    <ul
                      v-if="hasItems(subitem)"
                      class="sub-menu"
                      aria-expanded="false"
                    >
                      <li
                        v-for="(subSubitem, index) of subitem.subItems"
                        :key="index"
                      >
                        <router-link
                          :to="subSubitem.link"
                          class="side-nav-link-ref"
                          @click.native="closeMenuOnMobile"
                          >{{ subSubitem.label }}</router-link
                        >
                      </li>
                    </ul>
                  </div>
                </li>
              </ul>
            </div>
          </li>
        </template>
      </ul>
      <div class="notice">
        If your appointment is less than 48 hours away.  Please call or text 949-345-0213.  For medical emergencies, please dial 911 immediately.
      </div>
    </div>

    <div class="clearfix"></div>
    <!-- Sidebar -left -->
  </div>
  <!-- Left Sidebar End -->
</template>
