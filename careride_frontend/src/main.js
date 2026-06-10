import Vue from "vue";
import App from "./App.vue";
import BootstrapVue from "bootstrap-vue";
import Vuelidate from "vuelidate";
import VueTour from "vue-tour";
import vco from "v-click-outside";
import GmapVue from "gmap-vue";
import "@/plugins/axios";

import router from "@/router";
import store from "@/store";
import { sync } from "vuex-router-sync"; // Sync router with store

import VueApexCharts from "vue-apexcharts";
import VueStringFilter from "vue-string-filter";
import Lightbox from "vue-easy-lightbox";
import vueAwesomeCountdown from "vue-awesome-countdown";

import Debuginfo from "@/components/Debuginfo.vue"; // ###debug

import urls from "@/urls";
import helpers from "@/helpers";
import appConfig from "../app.config";

Vue.config.productionTip = false;

Vue.use(vco);

// As a plugin
import VueMask from "v-mask";
import VueQuillEditor from "vue-quill-editor";
import VueDraggable from "vue-draggable";
Vue.use(VueDraggable);
Vue.use(VueQuillEditor);
Vue.use(VueMask);

import VueSlideBar from "vue-slide-bar";

Vue.component("VueSlideBar", VueSlideBar);
Vue.component("apexchart", VueApexCharts);
Vue.use(BootstrapVue);
Vue.use(Vuelidate);
Vue.use(require("vue-chartist"));
Vue.use(VueStringFilter);
Vue.use(VueTour);
Vue.use(Lightbox);
Vue.use(vueAwesomeCountdown, "vac");
Vue.component("Debuginfo", Debuginfo);

Vue.use(GmapVue, {
  load: {
    // key: "AIzaSyDBPNTp380tgTGRMvwX96PuMOr02oVp__0", // my test
    key: "AIzaSyB4_Fex-YobTyQ3CYWR1Mo9Aiq-x6Uu7l0", // real
    libraries: "places",
    language: "en",
    v: "3.49",
  },
  installComponents: true,
});

// Sync store with router
sync(store, router);

Vue.prototype.$urls = urls;
Vue.prototype.$helpers = helpers;
Vue.prototype.$appConfig = appConfig;
Vue.prototype.$scrollToTop = () => window.scrollTo(0, 0);

// get date in custom format
Vue.prototype.$dateAndTime = (date) => {
  if (!date) return "";

  const d = new Date(date);
  return (
    d.toLocaleString("en-US", { day: "numeric" }) +
    " " +
    d.toLocaleString("en-US", {
      month: "long",
      year: "numeric",
      hour: "numeric",
      minute: "numeric",
    })
  );
};

import "@/assets/scss/app.scss";

new Vue({
  router,
  store,
  render: (h) => h(App),
}).$mount("#app");
