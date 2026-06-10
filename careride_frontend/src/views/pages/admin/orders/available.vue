<template>
  <Layout>
    <div class="text-center text-md-left page-headline mb-4">
      <h1 class="display-3">Available orders</h1>
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
        <div
          v-if="tableData.length === 0 && status.id === 'all' && onFirst"
          class="empty-card"
        >
          <div class="empty-card-img">
            <img
              :src="require('@/assets/images/orders-empty.svg')"
              alt="no orders yet"
              class="img-fluid"
            />
          </div>
          <div class="empty-card-msg">There are no orders yet</div>
        </div>
        <div v-else class="card">
          <div class="card-body">
            <div class="row mb-md-2 text-center table-filters">
              <!-- Status filter -->
              <div class="col-sm-12 col-md-auto text-md-left">
                <div
                  class="table-filters-label d-block d-md-inline-flex align-items-center flex-wrap mr-2"
                >
                  <span class="text-nowrap mr-2">Filter by status:</span>
                  <multiselect
                    v-model="status"
                    :options="orderStatusesFilter"
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
                  <!-- <label class="d-inline-flex align-items-center">
                    Search:
                    <b-form-input
                      v-model="filter"
                      type="search"
                      placeholder="..."
                      class="form-control form-control-sm ml-2"
                    ></b-form-input>
                  </label> -->
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
                show-empty
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

                <template #empty>
                  <h4 class="text-center">
                    No orders with status: {{ status.label }}
                    <a
                      href="#"
                      @click.prevent="status = vendorStatuses[0]"
                      title="Reset status filter"
                      ><span class="material-symbols-rounded v-middle">
                        cancel
                      </span></a
                    >
                  </h4>
                </template>
                <!-- <template #emptyfiltered="scope">
                  <h4>{{ scope.emptyFilteredText }}</h4>
                </template> -->
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
      </template>
    </div>

    <b-modal
      v-model="showModal"
      hide-header
      hide-footer
      centered
      modal-class="b-modal-ride-history"
      size="xl"
    >
      <div class="common-modal-headline">
        <h4 class="common-modal-title" v-if="order">Order #{{ order.id }}</h4>
        <span
          class="material-symbols-rounded common-modal-close"
          @click="showModal = false"
        >
          close
        </span>
      </div>
      <hr class="my-3" />
      <div v-if="order" class="row mt-3">
        <div class="col-lg-6 col-xl-4">
          <div class="ride-info">
            <div class="ride-info-title">Pickup Date & Time</div>
            <div class="ride-info-text">
              {{ $dateAndTime(order.orderAt) }}
            </div>
          </div>
          <div class="ride-info">
            <div class="ride-info-title">Ordering Date & Time</div>
            <div class="ride-info-text">
              {{ $dateAndTime(order.createdAt) }}
            </div>
          </div>
          <div class="ride-info">
            <div class="ride-info-title">Starting Point</div>
            <div class="ride-info-text">
              {{ order.pfrom_addr }}
            </div>
          </div>
          <div class="ride-info">
            <div class="ride-info-title">Finish Point</div>
            <div class="ride-info-text">
              {{ order.pto_addr }}
            </div>
          </div>
          <div class="ride-info">
            <div class="ride-info-title">Vendor Name</div>
            <div class="ride-info-text">
              {{ order.company_name }}
            </div>
          </div>
          <div class="ride-info">
            <div class="ride-info-title">Price</div>
            <div class="ride-info-text">$ {{ order.price }}</div>
          </div>
        </div>

        <div class="col-lg-6 col-xl-4">
          <div class="ride-info">
            <div class="ride-info-title">Car Type</div>
            <div class="ride-info-text">{{ carTypesLabel(order.cartype) }}</div>
          </div>
          <div class="ride-info">
            <div class="ride-info-title">Car Model</div>
            <div class="ride-info-text">
              <template v-if="order.car && order.car.model">{{
                order.car.model
              }}</template>
              <template v-else> --- </template>
            </div>
          </div>
          <div class="ride-info">
            <div class="ride-info-title">License Plate</div>
            <div class="ride-info-text">
              <template v-if="order.car && order.car.plate">{{
                order.car.plate
              }}</template>
              <template v-else> --- </template>
            </div>
          </div>
          <div class="ride-info">
            <div class="ride-info-title">Driver Name</div>
            <div class="ride-info-text">
              <template v-if="order.driver">{{
                driverName(order.driver)
              }}</template>
              <template v-else> --- </template>
            </div>
          </div>
          <div class="ride-info">
            <div class="ride-info-title">Driver Contact Number</div>
            <div class="ride-info-text">
              <template v-if="order.driver && order.driver.login">{{
                order.driver.login
              }}</template>
              <template v-else> --- </template>
            </div>
          </div>
        </div>

        <div class="col-12 col-xl-4">
          <div v-if="order.contact_first" class="ride-info">
            <div class="ride-info-title">Passenger First Name</div>
            <div class="ride-info-text">
              {{ order.contact_first }}
            </div>
          </div>
          <div v-if="order.contact_last" class="ride-info">
            <div class="ride-info-title">Passenger Last Name</div>
            <div class="ride-info-text">
              {{ order.contact_last }}
            </div>
          </div>
          <div v-if="order.contact_phone" class="ride-info">
            <div class="ride-info-title">Passenger Phone Number</div>
            <div class="ride-info-text">
              {{ order.contact_phone }}
            </div>
          </div>
          <div class="ride-info">
            <div class="ride-info-title">Client Name</div>
            <div class="ride-info-text">
              {{ clientName(order) }}
            </div>
          </div>
          <div class="ride-info">
            <div class="ride-info-title">Phone Number</div>
            <div class="ride-info-text">
              {{ order.client_login }}
            </div>
          </div>

          <hr />

          <formOrderCancel
            :order_id="order.id"
            :order_status="order.status"
            @update="loadTableData"
          />
        </div>
      </div>
      <!-- <pre>order: {{ order }}</pre> -->
    </b-modal>
  </Layout>
</template>

<script>
import Layout from "@/views/layouts/main";
import axios from "axios";
import { orderStatuses, vendorStatuses, carTypes } from "@/components/data";
import Multiselect from "vue-multiselect";
import formOrderCancel from "@/components/admin/form-order-cancel";

export default {
  metaInfo() {
    return {
      title: this.$appConfig.title + " | Available orders",
    };
  },
  components: {
    Layout,
    Multiselect,
    formOrderCancel,
  },
  data() {
    return {
      loading: true,
      reqError: false,
      onFirst: true,

      orderStatuses: orderStatuses,
      orderStatusesFilter: null,
      carTypes: [...carTypes],
      vendorStatuses: [
        {
          id: "",
          label: "All",
        },
        ...vendorStatuses,
      ],
      status: {
        id: "",
        label: "All",
      },

      tableData: [],
      totalRows: 30,
      currentPage: 1,
      // pageOptions: [5, 10, 25, 50, 100],
      pageOptions: [5, 10, 15, 20],
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
          sortByFormatted: (value, key, item) => {
            return `${this.$helpers.orderStatusLabel(item.status)}`;
          },
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

      order: null,
      showModal: false,
    };
  },
  created() {
    this.orderStatusesFilter = [
      {
        id: "",
        label: "All",
      },
      {
        id: 0,
        name: "new",
        label: "New",
        class: "ribbon-purple",
      },
      {
        id: 1,
        name: "accepted",
        label: "Accepted",
        class: "ribbon-warning",
      },
      // {
      //   id: 10,
      //   name: "complete",
      //   label: "Complete",
      //   class: "ribbon-info",
      // },
      // {
      //   id: 20, // cancel before payed
      //   name: "cancel",
      //   label: "Canceled",
      //   class: "ribbon-dark",
      // },
      // {
      //   id: 21,
      //   name: "reject",
      //   label: "Rejected",
      //   class: "ribbon-danger",
      // },
      {
        id: 22,
        name: "expired",
        label: "Expired",
        class: "ribbon-secondary",
      },
      // // canceled payed order: 25-cancel by client, 26-cancel vendor, 27-cancel admin
      // {
      //   id: 25,
      //   name: "cancel_client",
      //   label: "Canceled by client",
      //   class: "ribbon-secondary",
      // },
      // {
      //   id: 26,
      //   name: "cancel_vendor",
      //   label: "Canceled by vendor",
      //   class: "ribbon-secondary",
      // },
      // {
      //   id: 27,
      //   name: "cancel_admin",
      //   label: "Canceled by admin",
      //   class: "ribbon-secondary",
      // },
      {
        id: 3,
        name: "pick_up",
        label: "Pick up",
        class: "ribbon-success",
      },
      {
        id: 4,
        name: "work",
        label: "In progress",
        class: "ribbon-success",
      },
    ];

    this.loadData();
  },
  computed: {
    displayedRows() {
      const items = this.currentPage * this.perPage;
      return items < this.totalRows ? items : this.totalRows;
    },
  },
  methods: {
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
      this.reqError = false;

      // "page": 0,
      // "onpage": 20,
      // "id": 0,
      // "status": 0,
      // "vendor_id": 0,
      // "client_id": 0

      const param = {
        page: this.currentPage - 1,
        onpage: this.perPage,
      };

      if (this.status.id || this.status.id === 0) {
        param.status = Number(this.status.id);
      }

      try {
        const response = await axios.post(
          this.$urls.URL_ADMIN_ORDER_CURRENT,
          param
        );
        // console.log("Admin, Orders, loadTableData, response: ", response);
        this.tableData = response.data.order_list.items;
        this.totalRows = response.data.order_list.total;
      } catch (error) {
        console.log("Admin, Orders, loadTableData, error: ", error);
        this.reqError = true;
        if (error.response?.data?.message) {
          this.reqError = `<b>[ERROR: ${error.response.status}]</b> ${error.response?.data?.message}`;
        }
      }
    },
    carTypesLabel(id) {
      return this.carTypes.find((t) => t.id === id).label;
    },
    // rowClassByOrderStatus(item, type) {
    //   if (!item || type !== "row") return;
    //   // return `tr-order-status-${this.$helpers.orderStatusClass(item.status)}`;
    //   return `tr-order-status-${item.status}`;
    // },
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
    clientName(order) {
      let name = "";

      if (order.client_first_name) {
        name += `${order.client_first_name} `;
      }

      if (order.client_second_name) {
        name += `${order.client_second_name} `;
      }

      if (order.client_last_name) {
        name += `${order.client_last_name}`;
      }

      return name.replace(/\s/g, "") ? name : "---";
    },
    moreInfo(order) {
      this.order = order;
      this.showModal = true;
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
      this.onFirst = false;
      this.currentPage = 1;
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
