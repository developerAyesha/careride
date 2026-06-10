<template>
  <Landing>
    <Hero />

    <Features />

    <Statistics />

    <Nemt />

    <Whatis />

    <Partner />

    <Feedbacks />

    <Ride />

    <Contacts />
  </Landing>
</template>

<script>
import store from "@/store";
import router from "@/router";
// import { mapState, mapGetters } from "vuex";
import Landing from "@/views/layouts/landing";
import Hero from "@/components/landing/section/hero";
import Features from "@/components/landing/section/features";
import Statistics from "@/components/landing/section/statistics";
import Nemt from "@/components/landing/section/nemt";
import Whatis from "@/components/landing/section/whatis";
import Partner from "@/components/landing/section/partner";
import Feedbacks from "@/components/landing/section/feedbacks";
import Ride from "@/components/landing/section/ride";
import Contacts from "@/components/landing/section/contacts";

export default {
  metaInfo() {
    return {
      title: this.$appConfig.title + " | Main",
    };
  },
  beforeRouteEnter(to, from, next) {
    // redirect from main to role main page
    if (store.getters.authorized) {
      if (store.getters.user.role === "a") {
        router.push("/admin/clients").catch(() => { });
      }

      if (store.getters.user.role === "v") {
        router.push("/vendor/orders/available").catch(() => { });
      }

      if (store.getters.user.role === "d") {
        router.push("/driver/order").catch(() => { });
      }

      // if (store.getters.user.role === "c") {
      //   // #TODO if has not payed order - move to step 3 - page pay order form

      //   // #TODO if has orders move to client/orders
      //   // router.push("/client/orders").catch(() => {});
      // }
    }

    next();

    // if (
    //   store.getters.authorized &&
    //   store.getters.user.role === "c" &&
    //   from.name === "login" &&
    //   store.getters.client?.currentorders?.items[0]?.status === 1
    // ) {
    //   router.push("/ride/step-3");
    // } else {
    //   if (
    //     store.getters.authorized &&
    //     store.getters.user.role === "c" &&
    //     from.name === "login" &&
    //     store.getters.routeData
    //   ) {
    //     if (
    //       store.getters.client?.currentorders?.items[0]?.status === 3 ||
    //       store.getters.client?.currentorders?.items[0]?.status === 4
    //     ) {
    //       router.push("/client/orders");
    //     } else {
    //       router.push("/ride/step-2");
    //     }
    //   } else {
    //     next();
    //   }
    // }
  },
  components: {
    Landing,
    Hero,
    Features,
    Statistics,
    Nemt,
    Whatis,
    Partner,
    Feedbacks,
    Ride,
    Contacts,
  },
  data() {
    return {};
  },
  computed: {
    // ...mapGetters([
    //   "authorized",
    //   "user",
    //   "currentorders",
    //   "historyorders",
    //   "routeData",
    // ]),
  },
};
</script>
