<template>
  <Layout>
    <div class="row">
      <div class="col-12 mx-auto">
        <div class="card">
          <div class="card-body">
            <div class="col-lg-6 my-3 mx-auto">
              <b-alert
                v-if="isOk"
                variant="success"
                class="mt-3 text-center"
                show
              >
                <h3 class="mt-3">Payment order #{{ $route.query.id }} is successful</h3>
                <br />
                <p class="mb-3">Check order info on page:
                <router-link to="/client/orders">Current order</router-link></p>
              </b-alert>
              <b-alert v-else variant="danger" class="mt-3 text-center" show>
                <h3 class="mt-3">Payment has error!</h3>
                <br />
                <p class="mb-3">Try again on:
                <router-link to="/ride/step-3">Payment page</router-link></p>
              </b-alert>
            </div>
          </div>
        </div>
      </div>
    </div>
  </Layout>
</template>

<script>
import Layout from "@/views/layouts/main";

export default {
  metaInfo() {
    return {
      title: this.$appConfig.title + " | Payment result",
    };
  },
  components: {
    Layout,
  },
  data() {
    return {
      msg: {
        has: false,
        type: "",
        text: "",
      },
    };
  },
  created() {},
  computed: {
    isOk() {
      return this.$route.query.redirect_status === "succeeded";
    },
  },
  methods: {},
};
</script>
