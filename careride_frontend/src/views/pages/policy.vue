<template>
  <Layout>
    <div class="mx-auto mb-3">
      <div id="doc" class="content-anchor"></div>
      <h1 class="display-3 mb-3">Privacy Policy</h1>
      <PrivacyPolicyContent />
    </div>
  </Layout>
</template>

<script>
import Layout from "@/views/layouts/main";
import PrivacyPolicyContent from "@/components/privacy-policy-content";

export default {
  metaInfo() {
    return {
      title: this.$appConfig.title + " | Privacy Policy",
    };
  },
  components: {
    Layout,
    PrivacyPolicyContent,
  },
  data() {
    return {};
  },
  created() { },
  methods: {},
};
</script>
<style scoped lang="scss"></style>
