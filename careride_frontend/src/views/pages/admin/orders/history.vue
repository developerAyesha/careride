<template>
  <Layout>
    <div class="text-center text-md-left page-headline mb-4">
      <h1 class="display-3">Orders history</h1>
    </div>

    <tableOrders />
  </Layout>
</template>

<script>
import Layout from "@/views/layouts/main";
import tableOrders from "@/components/admin/table-orders";

export default {
  metaInfo() {
    return {
      title: this.$appConfig.title + " | Orders history",
    };
  },
  components: {
    Layout,
    tableOrders,
  },
};
</script>
