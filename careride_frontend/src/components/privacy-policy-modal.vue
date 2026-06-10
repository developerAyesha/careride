<template>
  <b-modal :visible="show" @hide="$emit('close')" size="lg" hide-header hide-footer centered>
    <div class="common-modal-headline">
      <h4 class="common-modal-title">CareRide, Inc. - Privacy Policy</h4>
      <span class="material-symbols-rounded common-modal-close" @click="$emit('close')">
        close
      </span>
    </div>
    <hr class="my-3" />
    <PrivacyPolicyContent is-modal />
  </b-modal>
</template>

<script>
import PrivacyPolicyContent from "@/components/privacy-policy-content";

export default {
  components: {
    PrivacyPolicyContent,
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
