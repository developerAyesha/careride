<template>
  <b-alert show variant="warning" class="text-center">
    <h3>
      To start receiving orders, you need to first connect to your Stripe
      account by clicking the button below
    </h3>
    <button
      :disabled="wait"
      @click.prevent="attachStripeAcc"
      class="btn btn-primary my-3 mx-auto"
    >
      Attach Stripe account
    </button>
  </b-alert>
</template>

<script>
import axios from "axios";
import urls from "@/urls";

export default {
  data() {
    return {
      wait: false,
    };
  },
  methods: {
    async attachStripeAcc() {
      // console.log("attachStripeAcc...");

      this.wait = true;

      try {
        const response = await axios({
          method: "GET",
          url: urls.URL_GET_STRIPE_ATTACH_LINK,
        });

        // console.log("response: ", response);
        const url = response.data?.links?.url;
        // console.log("url: ", url);

        if (url) {
          location.href = url;
        } else {
          console.log("Url missing...");
        }
      } catch (error) {
        console.log("Error: ", error);
        this.wait = false;
      }
    },
  },
};
</script>
