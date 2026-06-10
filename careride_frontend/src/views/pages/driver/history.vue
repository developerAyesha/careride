<template>
  <Layout>
    <div class="row align-items-center text-center page-headline mb-3 mx-w">
      <h1 class="display-3 text-md-left">Orders history</h1>
    </div>

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

      <div class="row mb-md-2 text-center table-filters">
        <!-- Status filter -->
        <div class="col-sm-12 col-md-auto text-md-left">
          <div
            class="table-filters-label d-block d-md-inline-flex align-items-center flex-wrap mr-2"
          >
            <span class="text-nowrap mr-2">Filter by status:</span>
            <multiselect
              v-model="status"
              :options="orderStatuses"
              track-by="id"
              label="label"
              :multiple="false"
              :allow-empty="false"
              :maxHeight="240"
              tag-placeholder=""
              placeholder=""
              class="d-inline-flex"
            />
          </div>
        </div>

        <!-- Search filter -->
        <div class="col-sm-12 col-md-auto ml-auto mt-2 mt-md-0">
          <div
            id="tickets-table_filter"
            class="dataTables_filter text-md-right"
          >
            <label class="d-inline-flex align-items-center mr-2">
              <span class="text-nowrap">Quantity:</span>
              <b-form-select
                v-model="perPage"
                size="sm"
                :options="pageOptions"
                class="form-control form-control-sm ml-2"
              ></b-form-select>
            </label>
            <label class="d-inline-flex align-items-center">
              Search:
              <b-form-input
                v-model="carPlate"
                type="search"
                placeholder="Search by license plate"
                class="form-control form-control-sm ml-2"
              ></b-form-input>
            </label>
          </div>
        </div>
      </div>

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
                  <div
                    class="col-12 col-lg-12 order-info-more text-center text-lg-left my-3 my-lg-0"
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
                <orderCard :order="order" :key="order.id">
                  <template v-slot:default>
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

                    <!-- <pre>driver: {{ order.driver }}</pre> -->
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
            :src="require('@/assets/images/no-history-orders.svg')"
            alt="no available orders"
            class="img-fluid"
          />
        </div>
        <div class="empty-card-msg">Your order history is empty</div>
      </div>
    </template>

    <!-- <pre>optServices: {{ optServices }}</pre> -->
    <!-- <pre>tableData: {{ tableData }}</pre> -->
  </Layout>
</template>

<script>
import Layout from "@/views/layouts/main";
import { mapState, mapGetters, mapActions } from "vuex";
import axios from "axios";
import urls from "@/urls";
import { orderStatuses, escortTypes, carTypes } from "@/components/data";
import orderCard from "@/components/order-card";
import Multiselect from "vue-multiselect";

export default {
  metaInfo() {
    return {
      title: this.$appConfig.title + " | Driver | Orders history",
    };
  },
  components: {
    Layout,
    orderCard,
    Multiselect,
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
      pageOptions: [5, 10, 25, 50, 100],
      sortBy: "first_name",
      sortDesc: false,
      carTypes: [...carTypes],
      orderStatuses: [...orderStatuses],
      escortTypes: escortTypes,
      status: {
        id: 0,
        label: "All", // New
      },
      carPlate: "",
    };
  },
  created() {
    // rename New -> All
    this.orderStatuses.map((s) => {
      if (s.id === 0) {
        s.label = "All";
      }
    });
    this.loadData();
  },
  computed: {
    ...mapGetters(["user", "opt"]),
    optServices() {
      return this.opt?.VENDOR_SERVICES || [];
    },
  },
  methods: {
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

      const param = {
        page: this.currentPage - 1,
        onpage: this.perPage,
        status: this.status.id,
        car_plate: this.carPlate,
      };

      try {
        const response = await axios.post(urls.URL_DRIVER_ORDER_HISTORY, param);
        // console.log("Vendor history orders page, response: ", response);

        this.tableData = response.data.order_list.items;
        this.totalRows = response.data.order_list.total;
      } catch (error) {
        // console.log("Vendor history orders page, error: ", error);

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
  },
  watch: {
    currentPage() {
      this.loadTableData();
    },
    perPage() {
      this.loadTableData();
    },
    status() {
      this.currentPage = 1;
      this.loadTableData();
    },
    carPlate(search) {
      // search if 3 char min or empty
      if ((search && search.length > 2) || !search) {
        this.currentPage = 1;
        this.loadTableData();
      }
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
