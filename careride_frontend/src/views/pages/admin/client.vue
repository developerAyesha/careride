<template>
  <Layout>
    <div class="row align-items-center text-center page-headline mb-4">
      <div class="col-auto text-md-left">
        <h1 class="display-3">
          <router-link to="/admin/clients" class="mr-2">Clients</router-link>
          <span class="material-symbols-rounded fz-28"> chevron_right </span>
          {{ userName(client) }}
        </h1>
      </div>
      <div class="col-auto text-md-right ml-md-auto">
        <button
          v-if="client.block"
          @click="clientAction('unblock')"
          :disabled="wait"
          class="btn btn-primary mx-auto mr-sm-3 mb-3"
        >
          Unblock
        </button>
        <button
          v-else
          @click="clientAction('block')"
          :disabled="wait"
          class="btn btn-outline-secondary mx-auto mr-sm-3 mb-3"
        >
          <span class="material-symbols-rounded fz-28 mr-2"> block </span>Block
        </button>
      </div>
    </div>

    <template v-if="client.id">
      <!-- <pre>client.id: {{ client.id }}</pre> -->
      <h3 class="header-title mb-2">Orders</h3>
      <tableOrders :client_id="client.id" />
    </template>
  </Layout>
</template>

<script>
import axios from "axios";
import Layout from "@/views/layouts/main";
import tableOrders from "@/components/admin/table-orders";

export default {
  metaInfo() {
    return {
      title: this.$appConfig.title + " | Client detail",
    };
  },
  components: {
    Layout,
    tableOrders,
  },
  data() {
    return {
      client: "",
      wait: false,
    };
  },
  created() {
    this.clientAction();
  },
  computed: {
    id() {
      return Number(this.$route.params.id);
    },
  },
  methods: {
    async clientAction(action) {
      // action - default get client data, else block or unblock
      let block = null;

      if (action === "block") {
        block = 1;
      } else if (action === "unblock") {
        block = 0;
      }

      try {
        const response = await axios.post(this.$urls.URL_ADMIN_CLIENT_INFO, {
          id: this.id,
          block,
        });
        // console.log("client, response: ", response);
        this.client = response.data.user;
      } catch (error) {
        console.log("client, error: ", error);
      }
    },
    userName(order) {
      let name = "";

      if (order.first_name) {
        name += `${order.first_name} `;
      }

      if (order.second_name) {
        name += `${order.second_name} `;
      }

      if (order.last_name) {
        name += `${order.last_name}`;
      }

      return name.replace(/\s/g, "") ? name : "---";
    },
  },
  watch: {},
};
</script>
<style scoped lang="scss"></style>
