<template>
  <Layout>
    <div class="row align-items-center text-center page-headline mb-3 mx-w">
      <h1 class="display-3 text-md-left">Current orders</h1>
    </div>

    <Debuginfo class="static">
      <div>
        <pre>ordersInWork: {{ ordersInWork }}</pre>
      </div>
    </Debuginfo>

    <template v-if="ordersInWork?.length">
      <div
        v-for="(order, i) in ordersInWork"
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
                    info col...
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

            <!-- if new -->
            <orderCard v-if="order.status === 0" :order="order">
              <template v-slot:default></template>
            </orderCard>
            <orderCard v-else :order="order" wide>
              <template v-slot:default>
                <!-- <div>
                  <pre>order: {{ order }}</pre>
                </div> -->

                <div class="order-info">
                  <div class="order-info-title">Company</div>
                  <div class="order-info-text">
                    {{ order.company_name }}
                  </div>
                </div>
                <!-- <div class="order-info">
                  <div class="order-info-title">Driver name</div>
                  <div class="order-info-text">
                    {{ order.driver.first_name }} {{ order.driver.last_name }}
                  </div>
                </div>
                <div class="order-info">
                  <div class="order-info-title">Driver phone number</div>
                  <div class="order-info-text">+ {{ order.driver.login }}</div>
                </div> -->
                <div class="order-info" v-if="order.car?.model">
                  <div class="order-info-title">Car</div>
                  <div class="order-info-text">
                    {{ order.car.model }}
                  </div>
                </div>
                <div class="order-info" v-if="order.car?.plate">
                  <div class="order-info-title">License plate</div>
                  <div class="order-info-text">
                    {{ order.car.plate }}
                  </div>
                </div>
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
            <!-- cancel order -->
            <div class="text-center text-lg-right">
              <template v-if="order.status === 1">
                <router-link
                  :to="`/ride/step-3?id=${order.id}`"
                  class="btn btn-primary mb-3"
                  >Pay $ {{ order.price }}</router-link
                >
                <br />
              </template>

              <!-- delete order btn when expired or canceled: 10, 20, 21, 22, 25, 26, 27 -->
              <button
                v-if="[10, 20, 21, 22, 25, 26, 27].includes(order.status)"
                class="btn btn-dark"
                @click.prevent="confirmCancel(order)"
              >
                <span class="material-symbols-rounded ico-reposition">
                  delete
                </span>
                Delete order
              </button>
              <button
                v-else
                class="btn btn-danger"
                @click.prevent="confirmCancel(order)"
              >
                <span class="material-symbols-rounded"> close </span> Cancel
                order
              </button>
            </div>
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
      <div class="empty-card-msg">You do not have any current orders</div>
    </div>

    <!-- <pre>optServices: {{ optServices }}</pre> -->
  </Layout>
</template>

<script>
import Layout from "@/views/layouts/main";
import { mapState, mapGetters, mapActions } from "vuex";
import { orderStatuses, escortTypes } from "@/components/data";
import orderCard from "@/components/order-card";

export default {
  metaInfo() {
    return {
      title: this.$appConfig.title + " | Current orders",
    };
  },
  components: {
    Layout,
    orderCard,
  },
  data() {
    return {
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
  computed: {
    ...mapGetters(["user", "opt", "client"]),
    optServices() {
      return this.opt?.VENDOR_SERVICES || [];
    },
    ordersInWork() {
      // pick up or work
      // let inWork = [];
      // inWork = this.client.currentorders?.items?.filter(
      //   (order) => order.status === 3 || order.status === 4
      // );

      // return inWork;

      // all orders
      return this.client.orderlist?.items || [];
    },
  },
  async created() {
    await this.$store.dispatch("fetchClientOrderlist");
  },
  methods: {
    ...mapActions(["fetchUserDataCustomer", "clientCancelOrder"]),
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
    htmlToVNode(html) {
      return [this.$createElement("div", { domProps: { innerHTML: html } })];
    },
    confirmCancel(order) {
      console.log("confirmCancel, order: ", order);

      let sanction = "";

      // if not new and accepted
      // delete order NO sanction: 0, 10, 21, 22, 26, 27
      if (![0, 10, 21, 22, 26, 27].includes(order.status)) {
        // not pick up status !== 3, other pick up
        if (order.status !== 3) {
          sanction =
            "<b>WARNING:</b> 50% of the money paid for the trip will be returned to you";
        } else {
          sanction =
            "<b>WARNING:</b> 80% of the money paid for the trip will be returned to you";
        }
      }

      const msg = this
        .htmlToVNode(`Do you want to cancel order: <b>#${order.id}</b> ?
          <br />
          <br />
          ${sanction}`);

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
      // console.log("cancelOrder, id: ", id);
      try {
        await this.clientCancelOrder(id);
        await this.fetchUserDataCustomer();
      } catch (error) {
        console.log("cancelOrder, error: ", error);
      }
    },
  },
  watch: {
    // currentPage() {
    //   this.loadTableData();
    // },
    // perPage() {
    //   this.loadTableData();
    // },
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

.ico-reposition {
  position: relative;
  top: -2px;
}
</style>
