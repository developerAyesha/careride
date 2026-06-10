<template>
  <div>
    <button
      :disabled="wait"
      @click.prevent="attachStripeAcc"
      class="btn btn-primary my-3 mx-auto"
    >
      Open stripe acc
    </button>
  </div>
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
          window.open(url, "_blank");
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
