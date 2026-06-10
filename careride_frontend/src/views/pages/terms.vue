<template>
  <Layout>
    <div class="mx-auto mb-3">
      <div id="doc" class="content-anchor"></div>
      <h1 class="display-3 mb-3">Terms of Service</h1>
      <TermsContent />
    </div>
  </Layout>
</template>

<script>
import Layout from "@/views/layouts/main";
import TermsContent from "@/components/terms-content";

export default {
  metaInfo() {
    return {
      title: this.$appConfig.title + " | Terms of Service",
    };
  },
  components: {
    Layout,
    TermsContent,
  },
  data() {
    return {};
  },
  created() { },
  methods: {},
};
</script>
<style scoped lang="scss"></style>
