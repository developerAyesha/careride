<script>
import Sidebar from "@/components/Sidebar";
import Footer from "@/components/Footer";

/**
 * Vertical layout
 */
export default {
  components: {
    Sidebar,
    // Topbar,
    Footer,
  },
  data() {
    return {};
  },
  computed: {},
  mounted() {},
  methods: {},
};
</script>

<template>
  <!-- Begin page -->
  <div id="wrapper">
    <Sidebar
      type="light"
      width="fluid"
      size="default"
      menu="fixed"
      topbar="dark"
    />
    <!-- ============================================================== -->
    <!-- Start Page Content here -->
    <!-- ============================================================== -->

    <div class="content-page">
      <div class="content">
        <!-- Start Content-->
        <div class="container-fluid">
          <slot />
        </div>
      </div>
      <Footer />
    </div>
  </div>
</template>
