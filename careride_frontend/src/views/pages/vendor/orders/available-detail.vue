<template>
  <Layout>
    <div class="row align-items-center text-center page-headline mb-4">
      <div class="col-auto text-md-left">
        <h1 class="display-3">
          <router-link to="/vendor/orders/available/" class="mr-2"
            >Available orders</router-link
          >
          <span class="material-symbols-rounded fz-28"> chevron_right </span>
          Order #{{ id }} ({{
            order.createdAt ? $dateAndTime(order.createdAt) : ""
          }})
        </h1>
      </div>
    </div>

    <div v-if="loading" class="loader-box">
      <b-spinner variant="primary" />
    </div>
    <template v-else>
      <b-alert
        :variant="msg.type"
        dismissible
        class="mt-3"
        v-model="msg.has"
        :show="msg.text"
        >{{ msg.text }}</b-alert
      >

      <div v-if="order" class="card">
        <div class="card-body">
          <orderCard is-vendor :order="order" :key="order.id"></orderCard>
        </div>
      </div>

      <div v-if="order && order.status === 0" class="row my-0 mt-md-3">
        <div class="col-md-12 col-xl-4">
          <form action="#" @submit.prevent="acceptOrder" novalidate>
            <h3 class="header-title">Car & Driver</h3>

            <div class="card">
              <div class="card-body">
                <div class="form-group mb-2">
                  <label for="order-accept-car" class="required">Car</label>
                  <div class="input-group input-group-merge">
                    <multiselect
                      v-model="form.car"
                      :options="carlist"
                      track-by="id"
                      label="model"
                      :multiple="false"
                      :allow-empty="false"
                      :maxHeight="240"
                      tag-placeholder="Select car"
                      placeholder=""
                      class="w-100"
                      :class="{
                        'is-invalid': submitted && $v.form.car.$error,
                      }"
                    />
                    <div
                      v-if="submitted && $v.form.car.$error"
                      class="invalid-feedback"
                    >
                      Car is required
                    </div>
                  </div>
                </div>

                <div class="form-group mb-2">
                  <label for="order-accept-reason" class="required"
                    >Expected time for driver to arrive</label
                  >
                  <date-picker
                    v-model="form.reason"
                    format="hh:mm a"
                    value-type="format"
                    type="time"
                    placeholder="hh:mm a"
                    class="form-control form-control-timepicker"
                    :class="{
                      'is-invalid': submitted && $v.form.reason.$error,
                    }"
                  />
                  <div
                    v-if="submitted && $v.form.reason.$error"
                    class="invalid-feedback"
                  >
                    Expected time is required field
                  </div>
                </div>

                <div class="form-group mb-0">
                  <label for="order-accept-driver" class="required"
                    >Driver</label
                  >
                  <div class="input-group input-group-merge">
                    <multiselect
                      v-model="form.driver"
                      :options="driverlist"
                      track-by="id"
                      :custom-label="customLabel"
                      :multiple="false"
                      :allow-empty="false"
                      :maxHeight="240"
                      tag-placeholder="Select driver"
                      placeholder=""
                      class="w-100"
                      :class="{
                        'is-invalid': submitted && $v.form.driver.$error,
                      }"
                    />
                    <div
                      v-if="submitted && $v.form.driver.$error"
                      class="invalid-feedback"
                    >
                      Driver is required
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div class="text-center text-md-left my-3">
              <button
                class="btn btn-primary mw-230"
                type="submit"
                :disabled="wait"
              >
                Accept order
              </button>
            </div>
          </form>
        </div>
      </div>

      <!-- <pre>order: {{ order }}</pre> -->
      <!-- <pre>carlist: {{ carlist }}</pre> -->
      <!-- <pre>driverlist: {{ driverlist }}</pre> -->
    </template>
  </Layout>
</template>

<script>
import axios from "axios";
import urls from "@/urls";
import { mapGetters } from "vuex";
import Layout from "@/views/layouts/main";
import orderCard from "@/components/order-card";
import Multiselect from "vue-multiselect";
import DatePicker from "vue2-datepicker";
import {
  required,
  minLength,
  maxLength,
  sameAs,
  requiredIf,
} from "vuelidate/lib/validators";

export default {
  metaInfo() {
    return {
      title: this.$appConfig.title + " | Vendor | Order Details",
    };
  },
  components: {
    Layout,
    orderCard,
    Multiselect,
    DatePicker,
  },
  data() {
    return {
      loading: true,

      msg: {
        has: false,
        type: "",
        text: "",
      },

      wait: false,
      submitted: false,
      order: "",
      carlist: "",
      driverlist: "",

      form: {
        reason: "",
        car: "",
        driver: "",
      },
    };
  },
  validations: {
    form: {
      reason: {
        required,
      },
      car: {
        required,
      },
      driver: {
        required,
      },
    },
  },
  created() {
    this.loadData();
  },
  computed: {
    ...mapGetters(["user"]),
    id() {
      return Number(this.$route.params.id);
    },
  },
  methods: {
    async loadData() {
      this.loading = true;
      this.msg = {
        has: false,
        type: "",
        text: "",
      };

      try {
        const response = await axios.post(urls.URL_VENDOR_ORDER_INFO, {
          id: this.id,
        });
        // console.log("Order detail, response: ", response);
        this.order = response.data.order;
        this.carlist = response.data.carlist.items;
        this.driverlist = response.data.driverlist.items;

        // car - set first as default
        this.form.car = this.carlist[0];

        // driver - set first as default
        this.form.driver = this.driverlist[0];
      } catch (error) {
        console.log("Order detail, error: ", error);

        this.msg.has = true;
        this.msg.type = "danger";
        this.msg.text = error.response?.data?.error
          ? `${error.message}: ${error.response.data.error}`
          : "Error on load order detail";
      } finally {
        this.loading = false;
      }
    },
    async acceptOrder() {
      console.log("acceptOrder");

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

        const param = {
          order_id: this.id,
          accept: 1,
          reason: this.form.reason,
          car_id: this.form.car.id,
          driver_id: this.form.driver.id,
        };

        console.log("acceptOrder, param: ", param);

        try {
          await axios({
            method: "post",
            url: urls.URL_VENDOR_ORDER_ACCEPT,
            data: { ...param },
          });

          // this.msg.has = true;
          // this.msg.type = "success";
          // this.msg.text = "Order accepted...";
          this.$router.push("/vendor/orders/available/");
        } catch (error) {
          console.log("acceptOrder Error: ", error);
          // console.log("acceptOrder Error.response: ", error.response);

          this.msg.has = true;
          this.msg.type = "danger";
          this.msg.text = error.response?.data?.error
            ? `${error.message}: ${error.response.data.error}`
            : "Error on accept order";
        } finally {
          this.$scrollToTop();
          this.wait = false;
        }
      }
    },
    customLabel({ first_name, last_name }) {
      return `${first_name} ${last_name}`;
    },
  },
};
</script>
<style scoped lang="scss">
.form-control-timepicker {
  padding: 0;

  :deep .mx-input {
    border: none !important;
    padding: 0 0 0 14px !important;
    height: 44px !important;
  }

  &.is-invalid :deep .mx-icon-calendar {
    display: none;
  }
}
</style>
