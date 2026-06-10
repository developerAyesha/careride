<template>
  <Layout>
    <div class="row align-items-center text-center page-headline mb-3 mx-w">
      <h1 class="display-3 text-md-left">Available orders</h1>
    </div>

    <!--STATUS 999: NOT attached stripe acc -->
    <notAttachStripeMsg v-if="!user.stripe_acc_complete" />

    <template v-else>
      <!--STATUS 0: New / Waiting approved changes -->
      <waitCard v-if="user.status === 0" />

      <!--STATUS 2: Declined -->
      <declinedCard v-if="user.status === 2" />

      <!--STATUS 1: Approved -->
      <template v-if="user.status === 1">
        <div v-if="loading">
          <div class="text-center">
            <b-spinner variant="primary" />
          </div>
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

          <template v-if="tableData.length">
            <div
              v-for="(order, i) in tableData"
              :key="order.id"
              class="card ribbon-box"
            >
              <div class="ribbon" :class="orderStatusClass(order.status)">
                <div class="ribbon-text">
                  {{ orderStatusLabel(order.status) }}
                </div>
                <div v-if="order.roundtrip" class="round-trip">Round trip</div>
              </div>
              <div class="order-info-id">#{{ order.id }}</div>
              <!-- <pre>order: {{ order }}</pre> -->

              <div class="card-body">
                <div class="ribbon-content">
                  <!-- 1 view minimal  -->
                  <b-collapse
                    :id="`order-info-minimal-${order.id}`"
                    :visible="i !== 0"
                  >
                    <div class="row order-info-view-minimal">
                      <div class="col-lg-6 col-xl order-info-col-1">
                        <div class="order-info">
                          <div class="order-info-title">Starting Point</div>
                          <div class="order-info-text">
                            {{
                              order.status < 2
                                ? order.pfrom_city
                                : order.pfrom_addr
                            }}
                          </div>
                        </div>
                      </div>
                      <div class="col-lg-6 col-xl order-info-col-2">
                        <div class="order-info">
                          <div class="order-info-title">End point</div>
                          <div class="order-info-text">
                            {{
                              order.status < 2 ? order.pto_city : order.pto_addr
                            }}
                          </div>
                        </div>
                      </div>
                      <div class="col-lg-6 col-xl order-info-col-3">
                        <div class="order-info">
                          <div class="order-info-title">Price</div>
                          <div class="order-info-text text-success">
                            $ {{ order.pricemk.payout }}
                          </div>
                        </div>
                      </div>

                      <!-- if order - (status = 3 - pick up, 4 - in work) -->
                      <div
                        v-if="order.status === 3 || order.status === 4"
                        class="col-12 col-lg-12 col-xl-auto ml-xl-auto order-info-col-4 text-center text-xl-right"
                      >
                        <div class="order-info">
                          <div class="order-info-title">Car plate</div>
                          <div class="order-info-text">
                            <template v-if="order.car && order.car.plate">{{
                              order.car.plate
                            }}</template>
                            <template v-else> --- </template>
                          </div>
                        </div>
                      </div>

                      <!-- if order - new (status = 0) -->
                      <div
                        v-if="order.status === 0"
                        class="col-12 col-lg-12 col-xl-auto ml-xl-auto order-info-col-4 text-center text-xl-right order-2 order-xl-1"
                      >
                        <router-link
                          :to="`/vendor/orders/available/${order.id}`"
                          class="btn btn-primary mx-2"
                          >Accept</router-link
                        >
                        <button
                          v-if="order.vendor_id"
                          class="btn btn-outline-primary mx-2 mx-lg-0"
                          @click.prevent="declineOrder(order.id)"
                        >
                          Decline
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
                  </b-collapse>

                  <!-- 2 view full  -->
                  <b-collapse
                    :id="`order-info-full-${order.id}`"
                    :visible="i === 0"
                  >
                    <orderCard is-vendor :order="order" :key="order.id">
                      <template v-slot:default>
                        <!-- if order - (status = 3 - pick up, 4 - in work) -->
                        <template
                          v-if="order.status === 3 || order.status === 4"
                        >
                          <div class="order-info">
                            <div class="order-info-title">Car plate</div>
                            <div class="order-info-text">
                              <template v-if="order.car && order.car.plate">{{
                                order.car.plate
                              }}</template>
                              <template v-else> --- </template>
                            </div>
                          </div>

                          <div class="order-info">
                            <div class="order-info-title">Driver</div>
                            <div class="order-info-text">
                              <template v-if="order.driver">
                                {{ driverName(order.driver) }}
                              </template>
                              <template v-else> --- </template>
                            </div>
                          </div>

                          <div class="order-info">
                            <div class="order-info-title">Car model</div>
                            <div class="order-info-text">
                              <template v-if="order.car && order.car.model">{{
                                order.car.model
                              }}</template>
                              <template v-else> --- </template>
                            </div>
                          </div>

                          <div class="order-info">
                            <div class="order-info-title">Car color</div>
                            <div class="order-info-text">
                              <template v-if="order.car && order.car.color">{{
                                order.car.color
                              }}</template>
                              <template v-else> --- </template>
                            </div>
                          </div>

                          <div class="order-info">
                            <div class="order-info-title">Car type</div>
                            <div class="order-info-text">
                              <template v-if="order.car && order.car.cartype">{{
                                carTypesLabel(order.car.cartype)
                              }}</template>
                              <template v-else> --- </template>
                            </div>
                          </div>
                        </template>

                        <!-- if order - new (status = 0) -->
                        <template v-if="order.status === 0">
                          <router-link
                            :to="`/vendor/orders/available/${order.id}`"
                            class="btn btn-primary mx-2"
                            >Accept</router-link
                          >
                          <button
                            v-if="order.vendor_id"
                            class="btn btn-outline-primary mx-2 mx-lg-0"
                            @click.prevent="declineOrder(order.id)"
                            :disabled="wait"
                          >
                            Decline
                          </button>
                        </template>

                        <!-- cancel order -->
                        <div v-else class="text-center text-lg-right">
                          <button
                            class="btn btn-danger btn-cancel-order"
                            @click.prevent="confirmCancel(order)"
                            :disabled="wait"
                          >
                            <span class="material-symbols-rounded">
                              close
                            </span>
                            Cancel order
                          </button>
                        </div>
                      </template>
                      <template v-slot:more>
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
                      </template>
                    </orderCard>
                  </b-collapse>
                </div>
              </div>
            </div>

            <div class="row mb-3">
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
            </div>
          </template>
          <div v-else class="empty-card">
            <div class="empty-card-img">
              <img
                :src="require('@/assets/images/no-orders.svg')"
                alt="no available orders"
                class="img-fluid"
              />
            </div>
            <div class="empty-card-msg">
              You do not have any available orders
            </div>
          </div>
        </template>
      </template>
    </template>

    <!-- <pre>optServices: {{ optServices }}</pre> -->
    <!-- <pre>tableData: {{ tableData }}</pre> -->
  </Layout>
</template>

<script>
import Layout from "@/views/layouts/main";
import { mapGetters, mapActions } from "vuex";
import axios from "axios";
import urls from "@/urls";
import notAttachStripeMsg from "@/components/vendor/not-attach-stripe-msg";
import waitCard from "@/components/vendor/wait-card";
import declinedCard from "@/components/vendor/declined-card";
import { orderStatuses, escortTypes, carTypes } from "@/components/data";
import orderCard from "@/components/order-card";

export default {
  metaInfo() {
    return {
      title: this.$appConfig.title + " | Vendor | Available orders",
    };
  },
  components: {
    Layout,
    notAttachStripeMsg,
    waitCard,
    declinedCard,
    orderCard,
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

      tableData: [],
      totalRows: 30,
      currentPage: 1,
      perPage: 10,
      filter: null,
      filterOn: [],
      sortBy: "first_name",
      sortDesc: false,
      orderStatuses: orderStatuses,
      escortTypes: escortTypes,
      carTypes: [...carTypes],
    };
  },
  created() {
    this.loadData();
  },
  computed: {
    ...mapGetters(["user", "opt"]),
    optServices() {
      return this.opt?.VENDOR_SERVICES || [];
    },
  },
  methods: {
    ...mapActions(["fetchVendorOrders"]),
    async loadData() {
      try {
        this.loading = true;
        await this.loadTableData();
      } catch (error) {
        console.log("loadData, error: ", error);
      } finally {
        this.loading = false;
      }
    },
    async loadTableData(saveMsg = false) {
      if (!saveMsg) {
        this.msg = {
          has: false,
          type: "",
          text: "",
        };
      }

      // status: 0-new, 1=accepted, 3=work
      const param = {
        status: "", // all orders
        page: this.currentPage - 1,
        onpage: this.perPage,
      };

      try {
        const response = await this.fetchVendorOrders(param);
        // console.log("Vendor available orders page, response: ", response);
        this.tableData = response.data.orderlist.items;
        this.totalRows = response.data.orderlist.total;
      } catch (error) {
        console.log("Vendor available orders page, error: ", error);

        this.msg.has = true;
        this.msg.type = "danger";
        this.msg.text = error.response?.data?.error
          ? `${error.message}: ${error.response.data.error}`
          : "Error on load orders list";
      }
    },
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
    async declineOrder(id) {
      // console.log("declineOrder, id: ", id);
      this.wait = true;
      this.msg = {
        has: false,
        type: "",
        text: "",
      };

      try {
        await axios({
          method: "post",
          url: urls.URL_VENDOR_ORDER_ACCEPT,
          data: {
            order_id: id,
            accept: 2,
            reason: "vendor decline order",
            car_id: 0,
            driver_id: 0,
          },
        });

        // this.msg.has = true;
        // this.msg.type = "success";
        // this.msg.text = "Order decline...";
      } catch (error) {
        console.log("declineOrder Error.response: ", error.response);

        this.msg.has = true;
        this.msg.type = "danger";
        this.msg.text = error.response?.data?.error
          ? `${error.message}: ${error.response.data.error}`
          : "Error on decline order";
      } finally {
        this.loadTableData(1);
        this.wait = false;
      }
    },
    carTypesLabel(id) {
      return this.carTypes.find((t) => t.id === id).label;
    },
    driverName(driver) {
      let name = "";

      if (driver.first_name) {
        name += `${driver.first_name} `;
      }

      if (driver.second_name) {
        name += `${driver.second_name} `;
      }

      if (driver.last_name) {
        name += `${driver.last_name}`;
      }

      return name.replace(/\s/g, "") ? name : "---";
    },
    htmlToVNode(html) {
      return [this.$createElement("div", { domProps: { innerHTML: html } })];
    },
    confirmCancel(order) {
      // console.log("confirmCancel, order: ", order);
      let msg = "";
      if (order.payAt) {
        msg = this
          .htmlToVNode(`Do you want to cancel order: <b>#${order.id}</b> ?
          <br />
          <br />
          <b>WARNING:</b> 100% of the money paid for the trip will be returned to client!`);
      } else {
        msg = this.htmlToVNode(
          `Do you want to cancel order: <b>#${order.id}</b> ?`
        );
      }

      this.$bvModal
        .msgBoxConfirm(msg, {
          title: "Cancel order confirmation",
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
            this.cancelOrder(order.id);
          }
        })
        .catch((err) => {
          // An error occurred
        });
    },
    async cancelOrder(id) {
      this.wait = true;

      const formData = {
        order_id: id,
        reason: "",
      };

      try {
        await axios({
          method: "post",
          url: this.$urls.URL_VENDOR_ORDER_CANCEL,
          data: formData,
        });

        this.msg.has = true;
        this.msg.type = "success";
        this.msg.text = "Order canceled successfully";

        this.loadTableData(1);
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
    },
  },
  watch: {
    currentPage() {
      this.loadTableData();
    },
    perPage() {
      this.loadTableData();
    },
    $route() {
      this.loadTableData();
    },
  },
};
</script>
<style scoped lang="scss">
.order-info-col-1 {
}

.order-info-col-2 {
}

.order-info-col-3 {
}

.order-info-col-4 {
  .btn {
    width: 120px;
  }

  .btn-cancel-order {
    width: auto;
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
