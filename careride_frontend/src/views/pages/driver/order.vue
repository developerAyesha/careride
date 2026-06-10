<template>
  <Layout>
    <div class="row align-items-center text-center page-headline mb-3 mx-w">
      <h1 class="display-3 text-md-left">Available orders</h1>
    </div>

    <b-alert
      :variant="msg.type"
      dismissible
      class="mt-3"
      v-model="msg.has"
      :show="msg.text"
      >{{ msg.text }}</b-alert
    >

    <template v-if="driver.orderlist && driver.orderlist.length">
      <div
        v-for="(order, i) in driver.orderlist"
        :key="order.id"
        class="card ribbon-box"
      >
        <div v-if="order.roundtrip" class="ribbon ribbon-round-trip">
          <div v-if="order.roundtrip" class="round-trip">Round trip</div>
        </div>
        <div class="order-info-id">#{{ order.id }}</div>
        <div class="card-body">
          <div class="ribbon-content">
            <!-- 1 view minimal  -->
            <!-- <b-collapse
                :id="`order-info-minimal-${order.id}`"
                :visible="i !== 0"
              >
                <div class="row order-info-view-minimal">
                  <div class="col-lg-6 col-xl order-info-col-1">
                    <div class="order-info">
                      <div class="order-info-title">Starting Point</div>
                      <div class="order-info-text">
                        {{ order.pfrom_addr }}
                      </div>
                    </div>
                  </div>
                  <div class="col-lg-6 col-xl order-info-col-2">
                    <div class="order-info">
                      <div class="order-info-title">End point</div>
                      <div class="order-info-text">
                        {{ order.pto_addr }}
                      </div>
                    </div>
                  </div>
                  <div class="col-lg-6 col-xl order-info-col-3">
                    <div class="order-info">
                      <div class="order-info-title">Price</div>
                      <div class="order-info-text text-success">
                        $ {{ order.price }}
                      </div>
                    </div>
                  </div>
                  <div
                    class="col-12 col-lg-12 col-xl-auto ml-xl-auto order-info-col-4 text-center text-xl-right order-2 order-xl-1"
                  >
                    <button
                      class="btn btn-primary btn-finish mx-2 mx-lg-0"
                      @click.prevent="finishOrder(order.id)"
                    >
                      Finish ride
                    </button>
                  </div>
                  <div
                    class="col-12 col-lg-12 order-info-more text-center text-lg-left my-3 my-lg-0 order-1 order-xl-2"
                  >
                    <a
                      v-b-toggle="[
                        `order-info-minimal-${order.id}`,
                        `order-info-full-${order.id}`,
                      ]"
                      href="#"
                      @click.prevent
                      >More details
                      <span class="material-symbols-rounded v-middle">
                        expand_more
                      </span></a
                    >
                  </div>
                </div>
              </b-collapse> -->

            <!-- 2 view full  -->
            <!-- <b-collapse
                :id="`order-info-full-${order.id}`"
                :visible="i === 0"
              > -->
            <orderCard :order="order" :key="order.id">
              <template v-slot:default>
                <!-- if order.status === 3 - pick up -->
                <button
                  v-if="order.status === 3"
                  class="btn btn-outline-primary btn-finish mx-2 mx-lg-0"
                  @click.prevent="confirmPickup(order)"
                >
                  Pick up
                </button>
                <!-- if order.status === 4 - in work -->
                <button
                  v-if="order.status === 4"
                  class="btn btn-primary btn-finish mx-2 mx-lg-0"
                  @click.prevent="confirmFinish(order)"
                >
                  Finish ride
                </button>
              </template>
              <!-- <template v-slot:more>
                    <a
                      v-b-toggle="[
                        `order-info-minimal-${order.id}`,
                        `order-info-full-${order.id}`,
                      ]"
                      href="#"
                      @click.prevent
                      >Hide details
                      <span class="material-symbols-rounded v-middle">
                        expand_less
                      </span></a
                    >
                  </template> -->
            </orderCard>
            <!-- </b-collapse> -->
          </div>
        </div>
      </div>

      <!-- <div class="row mb-3">
          <div class="col-12">
            <div class="dataTables_paginate paging_simple_numbers">
              <ul class="pagination mb-0">
                <b-pagination
                  v-model="currentPage"
                  :total-rows="totalRows"
                  :per-page="perPage"
                ></b-pagination>
              </ul>
            </div>
          </div>
        </div> -->
    </template>
    <div v-else class="empty-card">
      <div class="empty-card-img">
        <img
          :src="require('@/assets/images/no-orders.svg')"
          alt="no available orders"
          class="img-fluid"
        />
      </div>
      <div class="empty-card-msg">You do not have any available orders</div>
    </div>

    <!-- <pre>optServices: {{ optServices }}</pre> -->
    <!-- <pre>orders: {{ orders }}</pre> -->
  </Layout>
</template>

<script>
import Layout from "@/views/layouts/main";
import { mapState, mapGetters, mapActions } from "vuex";
import axios from "axios";
import urls from "@/urls";
import { orderStatuses, escortTypes } from "@/components/data";
import orderCard from "@/components/order-card";

export default {
  metaInfo() {
    return {
      title: this.$appConfig.title + " | Driver | Available orders",
    };
  },
  components: {
    Layout,
    orderCard,
  },
  data() {
    return {
      msg: {
        has: false,
        type: "",
        text: "",
      },

      wait: false,

      totalRows: 30,
      currentPage: 1,
      perPage: 10,
      filter: null,
      filterOn: [],
      sortBy: "first_name",
      sortDesc: false,
      orderStatuses: orderStatuses,
      escortTypes: escortTypes,
    };
  },
  created() {
    this.fetchDriverOrders();
  },
  computed: {
    ...mapGetters(["user", "opt", "driver"]),
    optServices() {
      return this.opt?.VENDOR_SERVICES || [];
    },
  },
  methods: {
    ...mapActions(["fetchDriverOrders"]),
    orderStatusClass(status) {
      // set class via status
      return this.orderStatuses.find((o) => o.id === status)?.class;
    },
    orderStatusLabel(status) {
      // set label via status
      const debug = process.env.VUE_APP_DEBUG_INFO;
      return (
        this.orderStatuses.find((o) => o.id === status)?.label +
        `${debug ? ` (${status})` : ""}`
      );
    },
    confirmPickup(order) {
      this.$bvModal
        .msgBoxConfirm(`Do you want to pick up order: #${order.id} ?`, {
          title: "Pick up order confirmation",
          size: "md",
          buttonSize: "md",
          okVariant: "danger",
          okTitle: "Yes",
          cancelTitle: "Cancel",
          footerClass: "p-2",
          hideHeaderClose: false,
          centered: true,
        })
        .then((sure) => {
          if (sure) {
            this.pickupOrder(order.id);
          }
        })
        .catch((err) => {
          // An error occurred
        });
    },
    confirmFinish(order) {
      this.$bvModal
        .msgBoxConfirm(`Do you want to finish order: #${order.id} ?`, {
          title: "Finish order confirmation",
          size: "md",
          buttonSize: "md",
          okVariant: "danger",
          okTitle: "Yes",
          cancelTitle: "Cancel",
          footerClass: "p-2",
          hideHeaderClose: false,
          centered: true,
        })
        .then((sure) => {
          if (sure) {
            this.finishOrder(order.id);
          }
        })
        .catch((err) => {
          // An error occurred
        });
    },
    async pickupOrder(id) {
      console.log("pickupOrder, id: ", id);
      this.wait = true;
      this.msg = {
        has: false,
        type: "",
        text: "",
      };

      try {
        await axios({
          method: "post",
          url: urls.URL_DRIVER_ORDER_PICKUP,
          data: {
            order_id: id,
          },
        });

        // this.msg.has = true;
        // this.msg.type = "success";
        // this.msg.text = "Order pick up !";
      } catch (error) {
        console.log("Order pick up Error.response: ", error.response);

        this.msg.has = true;
        this.msg.type = "danger";
        this.msg.text = error.response?.data?.error
          ? `${error.message}: ${error.response.data.error}`
          : "Error on pick up order";
      } finally {
        this.fetchDriverOrders();
        this.wait = false;
      }
    },
    async finishOrder(id) {
      console.log("finishOrder, id: ", id);
      this.wait = true;
      this.msg = {
        has: false,
        type: "",
        text: "",
      };

      try {
        await axios({
          method: "post",
          url: urls.URL_DRIVER_ORDER_COMPLETE,
          data: {
            order_id: id,
          },
        });

        this.msg.has = true;
        this.msg.type = "success";
        this.msg.text = "Order complete !";
      } catch (error) {
        console.log("Order complete Error.response: ", error.response);

        this.msg.has = true;
        this.msg.type = "danger";
        this.msg.text = error.response?.data?.error
          ? `${error.message}: ${error.response.data.error}`
          : "Error on complete order";
      } finally {
        this.fetchDriverOrders();
        this.wait = false;
      }
    },
  },
};
</script>
<style scoped lang="scss">
.order-info-col-4 {
  .btn-finish {
    width: 264px;
  }
}

.order-info {
  margin-bottom: 18px;
}

.order-info-title {
  font-size: 14px;
  font-weight: 400;
  color: #505655;
  margin-bottom: 4px;
}

.order-info-text {
  font-family: "Montserrat", sans-serif;
  font-weight: 600;
  font-size: 18px;
  color: #293331;
}

.order-info-more {
  font-family: "Montserrat", sans-serif;
  font-weight: 600;
  font-size: 18px;
  text-decoration: none;
  color: #ff8528;
}
</style>
