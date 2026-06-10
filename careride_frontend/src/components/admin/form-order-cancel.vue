<template>
  <form action="#" @submit.prevent="handleSubmit" class="foc-form">
    <h5 class="mb-3">
      Cancel order <b>#{{ order_id }}</b
      >:
    </h5>

    <b-alert
      :variant="msg.type"
      dismissible
      class="mt-3"
      v-model="msg.has"
      :show="msg.text"
      >{{ msg.text }}</b-alert
    >

    <template v-if="msg.type !== 'success'">
      <div class="form-group mb-2" v-if="payed">
        <input
          class="form-control"
          v-model="form.capture_percent"
          placeholder="0 - 100 %"
          :class="{ 'is-invalid': submitted && $v.form.capture_percent.$error }"
        />
        <div
          v-if="submitted && $v.form.capture_percent.$error"
          class="invalid-feedback"
        >
          <span v-if="!$v.form.capture_percent.required"
            >Capture percent is required</span
          >
          <span v-if="!$v.form.capture_percent.between"
            >Capture percent is between: 0 - 100</span
          >
        </div>
      </div>
      <div class="form-group mb-2">
        <input
          class="form-control"
          v-model="form.reason"
          placeholder="Reason"
          :class="{ 'is-invalid': submitted && $v.form.reason.$error }"
        />
        <div v-if="submitted && $v.form.reason.$error" class="invalid-feedback">
          Reason field max length is 32 chars
        </div>
      </div>
      <div class="text-center text-xl-left">
        <button class="btn btn-primary" type="submit" :disabled="wait">
          Cancel order
        </button>
      </div>
    </template>
  </form>
</template>

<script>
import axios from "axios";
import { required, between, maxLength } from "vuelidate/lib/validators";

export default {
  props: {
    order_id: {
      type: Number,
      default: 0,
    },
    order_status: {
      type: Number,
      default: 0,
    },
  },
  components: {},
  data() {
    return {
      msg: {
        has: false,
        type: "",
        text: "",
      },

      form: {
        capture_percent: "",
        reason: "",
      },

      submitted: false,
      wait: false,
    };
  },
  validations() {
    return {
      form: this.formRules,
    };
  },
  created() {},
  computed: {
    payed() {
      return this.order_status !== 0 && this.order_status !== 1;
    },
    formRules() {
      let rules = {};

      if (this.payed) {
        rules.capture_percent = {
          required,
          between: between(0, 100),
        };
      }

      rules.reason = {
        maxLength: maxLength(32),
      };

      return rules;
    },
  },
  methods: {
    async handleSubmit() {
      this.submitted = true;
      this.msg = {
        has: false,
        type: "",
        text: "",
      };

      this.$v.$touch();

      if (this.$v.$invalid) {
        return;
      } else {
        this.wait = true;

        const formData = {
          order_id: this.order_id,
          capture_percent: this.payed ? this.form.capture_percent : 0,
          reason: this.form.reason,
        };
        // console.log("FOC, formData: ", formData);

        try {
          await axios({
            method: "post",
            url: this.$urls.URL_ADMIN_ORDER_CANCEL,
            data: formData,
          });

          this.msg.has = true;
          this.msg.type = "success";
          this.msg.text = "Order canceled successfully";

          this.$emit("update");
        } catch (error) {
          console.log("Error: ", error);

          this.msg.has = true;
          this.msg.type = "danger";
          this.msg.text = "Error on cancel order ...";

          if (error.response?.status) {
            if (error.response.statusText) {
              this.msg.text = `Error: ${error.response.status} ${error.response.statusText}`;
            } else if (error.response.data?.detail) {
              this.msg.text = `Error: ${error.response.status} ${error.response.data.detail}`;
            } else if (error.response.data?.error) {
              this.msg.text = `Error: ${error.response.status} ${error.response.data.error}`;
            }
          }
        } finally {
          this.wait = false;
        }
      }
    },
  },
};
</script>
<style scoped lang="scss">
.foc-form {
  margin: 0 auto;
  max-width: 420px;
}
</style>
