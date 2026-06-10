<template>
  <Layout>
    <div class="text-center text-md-left page-headline mb-4">
      <h1 class="display-3">Ride history</h1>
    </div>

    <div v-if="loading">
      <div class="text-center">
        <b-spinner variant="primary" />
      </div>
    </div>
    <div v-else>
      <b-alert
        v-if="reqError"
        variant="danger"
        class="my-0"
        show
        v-html="reqError"
      />
      <template v-else>
        <div v-if="tableData.length > 0" class="card">
          <div class="card-body">
            <div class="row mb-md-2 text-center table-filters">
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
                      v-model="filter"
                      type="search"
                      placeholder="..."
                      class="form-control form-control-sm ml-2"
                    ></b-form-input>
                  </label>
                </div>
              </div>
            </div>

            <div class="table-responsive mb-0">
              <b-table
                :items="tableData"
                :fields="tableFields"
                responsive="sm"
                :per-page="perPage"
                :sort-by.sync="sortBy"
                :sort-desc.sync="sortDesc"
                :filter="filter"
                :filter-included-fields="filterOn"
              >
                <template #cell(price)="data">
                  $ {{ data.item.price }}
                </template>
                <template #cell(status)="data">
                  <div class="ribbon-box ribbon-cell">
                    <div
                      class="ribbon"
                      :class="$helpers.orderStatusClass(data.item.status)"
                    >
                      <div class="ribbon-text">
                        {{ $helpers.orderStatusLabel(data.item.status) }}
                      </div>
                      <div v-if="data.item.roundtrip" class="round-trip">
                        Round trip
                      </div>
                    </div>
                  </div>
                </template>
                <template #cell(more)="data">
                  <a href="#" @click.prevent="moreInfo(data.item)">More info</a>
                </template>
              </b-table>
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
          </div>
        </div>

        <div v-else class="empty-card">
          <div class="empty-card-img">
            <img
              :src="require('@/assets/images/no-orders.svg')"
              alt="no drivers yet"
              class="img-fluid"
            />
          </div>
          <div class="empty-card-msg">
            You do not have any orders in history
          </div>
        </div>
      </template>
    </div>

    <b-modal
      v-model="showModal"
      hide-header
      hide-footer
      centered
      modal-class="b-modal-ride-history-client"
      size="lg"
    >
      <div class="common-modal-headline">
        <h4 class="common-modal-title" v-if="ride">Order #{{ ride.id }}</h4>
        <span
          class="material-symbols-rounded common-modal-close"
          @click="showModal = false"
        >
          close
        </span>
      </div>
      <hr class="my-3" />
      <div v-if="ride" class="row mt-3">
        <div :class="isCanceled(ride.status) ? 'col-lg-4' : 'col-lg-6'">
          <div class="ride-info">
            <div class="ride-info-title">Pickup Date & Time</div>
            <div class="ride-info-text">
              {{ $dateAndTime(ride.orderAt) }}
            </div>
          </div>
          <div class="ride-info">
            <div class="ride-info-title">Ordering Date & Time</div>
            <div class="ride-info-text">
              {{ $dateAndTime(ride.createdAt) }}
            </div>
          </div>
          <div class="ride-info">
            <div class="ride-info-title">Starting Point</div>
            <div class="ride-info-text">
              {{ ride.pfrom_addr }}
            </div>
          </div>
          <div class="ride-info">
            <div class="ride-info-title">Finish point</div>
            <div class="ride-info-text">
              {{ ride.pto_addr }}
            </div>
          </div>
          <div class="ride-info">
            <div class="ride-info-title">Vendor name</div>
            <div class="ride-info-text">
              {{ ride.company_name }}
            </div>
          </div>
          <div class="ride-info">
            <div class="ride-info-title">Price</div>
            <div class="ride-info-text">$ {{ ride.price }}</div>
          </div>
        </div>
        <div :class="isCanceled(ride.status) ? 'col-lg-4' : 'col-lg-6'">
          <div class="ride-info">
            <div class="ride-info-title">Car Type</div>
            <div class="ride-info-text">{{ carTypesLabel(ride.cartype) }}</div>
          </div>
          <div class="ride-info">
            <div class="ride-info-title">Car model</div>
            <div class="ride-info-text">
              <template v-if="ride.car && ride.car.model">{{
                ride.car.model
              }}</template>
              <template v-else> --- </template>
            </div>
          </div>
          <div class="ride-info">
            <div class="ride-info-title">License Plate</div>
            <div class="ride-info-text">
              <template v-if="ride.car && ride.car.plate">{{
                ride.car.plate
              }}</template>
              <template v-else> --- </template>
            </div>
          </div>
          <div class="ride-info">
            <div class="ride-info-title">Driver Name</div>
            <div class="ride-info-text">
              <template v-if="ride.driver">{{
                driverName(ride.driver)
              }}</template>
              <template v-else> --- </template>
            </div>
          </div>
          <div class="ride-info">
            <div class="ride-info-title">Driver Contact Number</div>
            <div class="ride-info-text">
              <template v-if="ride.driver && ride.driver.login">{{
                ride.driver.login
              }}</template>
              <template v-else> --- </template>
            </div>
          </div>
        </div>

        <!-- Canceled and payback info -->
        <div v-if="isCanceled(ride.status)" class="col-lg-4">
          <div class="ride-info">
            <div class="ride-info-title">Canceled By</div>
            <div class="ride-info-text">
              <template v-if="ride.status === 20 || ride.status === 25"
                >Client</template
              >
              <template v-if="ride.status === 26">{{
                ride.company_name
              }}</template>
              <template v-if="ride.status === 27">Admin</template>
            </div>
          </div>
          <div class="ride-info" v-if="ride?.status === 27">
            <div class="ride-info-title">Cancel Reason</div>
            <div class="ride-info-text">{{ ride.reason || " --- " }}</div>
          </div>
          <template v-if="ride.payment && ride.payAt">
            <div class="ride-info">
              <div class="ride-info-title">Payment Amount</div>
              <div class="ride-info-text">
                {{ formatCurrencyCent(ride.payment.amount) }}
              </div>
            </div>
            <div class="ride-info">
              <div class="ride-info-title">Payment Capture Percent</div>
              <div class="ride-info-text">
                {{ ride.payment.detail.capture_percent }} %
              </div>
            </div>
            <div class="ride-info">
              <div class="ride-info-title">Payment Capture</div>
              <div class="ride-info-text">
                {{ formatCurrencyCent(ride.payment.detail.amount_to_capture) }}
              </div>
            </div>
          </template>
          <div v-else class="ride-info">
            <div class="ride-info-title">Payment Info</div>
            <div class="ride-info-text">Not paid</div>
          </div>
        </div>
      </div>
      <!-- <pre>ride: {{ ride }}</pre> -->
    </b-modal>
  </Layout>
</template>

<script>
import axios from "axios";
import Layout from "@/views/layouts/main";
import { carTypes, orderStatuses } from "@/components/data";
import { formatCurrencyCent } from "@/helpers";

export default {
  metaInfo() {
    return {
      title: this.$appConfig.title + " | Ride history",
    };
  },
  components: {
    Layout,
  },
  data() {
    return {
      loading: true,
      reqError: false,
      loadingTable: true,

      orderStatuses: orderStatuses,
      carTypes: [...carTypes],

      tableData: [],
      totalRows: 30,
      currentPage: 1,
      pageOptions: [5, 10, 25, 50],
      perPage: 10,
      filter: null,
      filterOn: [],
      sortBy: "id",
      sortDesc: true,
      tableFields: [
        {
          key: "id",
          label: "ID",
          sortable: true,
          class: "cell-id",
        },
        {
          key: "createdAt",
          label: "Ordering Date & Time",
          sortable: true,
          sortByFormatted: (value, key, item) => {
            return this.$dateAndTime(item.createdAt);
          },
          filterByFormatted: true,
          formatter: (value, key, item) => {
            return this.$dateAndTime(item.createdAt);
          },
        },
        {
          key: "pfrom_addr",
          label: "Starting point",
          sortable: true,
        },
        {
          key: "pto_addr",
          label: "Finish point",
          sortable: true,
        },
        {
          key: "company_name",
          label: "Vendor name",
          sortable: true,
        },
        {
          key: "price",
          sortable: true,
          class: "text-nowrap",
        },
        // {
        //   key: "cartype",
        //   label: "Car type",
        //   sortable: true,
        //   sortByFormatted: (value, key, item) => {
        //     return `${this.carTypesLabel(item.cartype)}`;
        //   },
        //   filterByFormatted: true,
        //   formatter: (value, key, item) => {
        //     return `${this.carTypesLabel(item.cartype)}`;
        //   },
        // },
        {
          key: "status",
          sortable: true,
          // sortByFormatted: (value, key, item) => {
          //   return `${this.$helpers.orderStatusLabel(item.status)}`;
          // },
          filterByFormatted: true,
          formatter: (value, key, item) => {
            return `${this.$helpers.orderStatusLabel(item.status)}`;
          },
        },
        {
          key: "more",
          label: "",
          class: "cell-more",
        },
      ],

      ride: null,
      showModal: false,
    };
  },
  created() {
    this.loadData();
  },
  computed: {
    displayedRows() {
      const items = this.currentPage * this.perPage;
      return items < this.totalRows ? items : this.totalRows;
    },
  },
  methods: {
    formatCurrencyCent,
    async loadData() {
      try {
        this.loading = true;
        await this.loadTableData();
      } catch (error) {
        console.log("loadData Error: ", error);
      } finally {
        this.loading = false;
      }
    },
    async loadTableData() {
      this.loadingTable = true;
      this.reqError = false;

      const param = {
        page: this.currentPage - 1,
        onpage: this.perPage,
      };

      try {
        const response = await axios.post(
          this.$urls.URL_CLIENT_ORDER_HISTORY,
          param
        );
        // console.log("Client order history, response: ", response);
        this.tableData = response.data.order_list.items;
        this.totalRows = response.data.order_list.total;
      } catch (error) {
        console.log("Client order history, error: ", error);
        this.reqError = true;
        if (error.response?.data?.message) {
          this.reqError = `<b>[ERROR: ${error.response.status}]</b> ${error.response?.data?.message}`;
        }
      } finally {
        this.loadingTable = false;
      }
    },
    // rowClassByOrderStatus(item, type) {
    //   if (!item || type !== "row") return;
    //   // return `tr-order-status-${this.$helpers.orderStatusClass(item.status)}`;
    //   return `tr-order-status-${item.status}`;
    // },
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
    moreInfo(ride) {
      this.ride = ride;
      this.showModal = true;
    },
    isCanceled(status = null) {
      if (!status) {
        return;
      }
      // 20 cancel client - cancel before payed,
      // 25 cancel client - after payed
      // 26 cancel vendor
      // 27 cancel admin
      return status === 20 || status === 25 || status === 26 || status === 27;
    },
  },
  watch: {
    currentPage() {
      this.loadTableData();
    },
    perPage() {
      this.loadTableData();
    },
  },
};
</script>
<style scoped lang="scss">
:deep .b-table .cell-more {
  width: 128px;
  text-align: center;
}

:deep .b-table .cell-more a {
  font-family: "Montserrat", sans-serif;
  font-size: 16px;
  font-weight: 600;
  white-space: nowrap;
  color: #ff8528;
  text-decoration: none;

  &:hover {
    color: #ff8528;
    text-decoration: underline;
  }
}

.ride-info {
  margin-top: 16px;

  &:first-child {
    margin-top: 0;
  }
}

.ride-info-title {
  font-size: 14px;
  font-weight: 600;
  color: #505655;
  margin-bottom: 2px;
}

.ride-info-text {
  font-size: 16px;
  font-weight: 400;
  color: #505655;
}
</style>
