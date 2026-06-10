<template>
  <b-modal :visible="show" @hide="$emit('close')" size="lg" hide-header hide-footer centered>
    <div class="common-modal-headline">
      <h4 class="common-modal-title" id="doc">CareRide, Inc. - Terms of Service</h4>
      <span class="material-symbols-rounded common-modal-close" @click="$emit('close')">
        close
      </span>
    </div>
    <hr class="my-3" />
    <TermsContent is-modal />

  </b-modal>
</template>

<script>
import TermsContent from "@/components/terms-content";

export default {
  components: {
    TermsContent,
  },
  props: {
    show: {
      type: Boolean,
      default: false,
    },
  },
  data() {
    return {};
  },
};
</script>
<style lang="scss"></style>
