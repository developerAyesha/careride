<template>
  <div>
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
      modal-class="b-modal-ride-history-admin"
      :size="isFullModal ? (isCanceled(order?.status) ? 'xl' : 'lg') : ''"
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
        <div
          class="col-lg-6"
          :class="
            isFullModal
              ? isCanceled(order?.status)
                ? 'col-xl-3'
                : 'col-xl-4'
              : ''
          "
        >
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
            <div class="ride-info-title">Finish point</div>
            <div class="ride-info-text">
              {{ order.pto_addr }}
            </div>
          </div>
          <div class="ride-info">
            <div class="ride-info-title">Vendor name</div>
            <div class="ride-info-text">
              {{ order.company_name }}
            </div>
          </div>
          <div class="ride-info">
            <div class="ride-info-title">Price</div>
            <div class="ride-info-text">$ {{ order.price }}</div>
          </div>
        </div>

        <div
          class="col-lg-6"
          :class="
            isFullModal
              ? isCanceled(order?.status)
                ? 'col-xl-3'
                : 'col-xl-4'
              : ''
          "
        >
          <div class="ride-info">
            <div class="ride-info-title">Car Type</div>
            <div class="ride-info-text">
              {{ $helpers.carTypesLabel(order.cartype) }}
            </div>
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

        <div
          v-if="isFullModal"
          class="col-lg-6"
          :class="isCanceled(order?.status) ? 'col-xl-3' : 'col-xl-4'"
        >
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
            <div class="ride-info-title">Client name</div>
            <div class="ride-info-text">
              {{ clientName(order) }}
            </div>
          </div>
          <div class="ride-info">
            <div class="ride-info-title">Phone number</div>
            <div class="ride-info-text">
              {{ order.client_login }}
            </div>
          </div>
        </div>

        <!-- Canceled and payback info -->
        <div
          v-if="isFullModal && isCanceled(order?.status)"
          class="col-xl-3 col-lg-6"
        >
          <div class="ride-info">
            <div class="ride-info-title">Canceled by</div>
            <div class="ride-info-text">
              <template v-if="order.status === 20 || order.status === 25"
                >Client</template
              >
              <template v-if="order.status === 26">{{
                order.company_name
              }}</template>
              <template v-if="order.status === 27">Admin</template>
            </div>
          </div>
          <div class="ride-info" v-if="order?.status === 27">
            <div class="ride-info-title">Cancel reason</div>
            <div class="ride-info-text">{{ order.reason || " --- " }}</div>
          </div>
          <template v-if="order.payment && order.payAt">
            <div class="ride-info">
              <div class="ride-info-title">Payment amount</div>
              <div class="ride-info-text">
                {{ formatCurrencyCent(order.payment.amount) }}
              </div>
            </div>
            <div class="ride-info">
              <div class="ride-info-title">Payment capture percent</div>
              <div class="ride-info-text">
                {{ order.payment.detail.capture_percent }} %
              </div>
            </div>
            <div class="ride-info">
              <div class="ride-info-title">Payment capture</div>
              <div class="ride-info-text">
                {{ formatCurrencyCent(order.payment.detail.amount_to_capture) }}
              </div>
            </div>
          </template>
          <div v-else class="ride-info">
            <div class="ride-info-title">Payment info</div>
            <div class="ride-info-text">Not paid</div>
          </div>
        </div>
      </div>
      <!-- <pre>isCanceled: {{ isCanceled(order?.status) }}</pre> -->
      <!-- <pre>order.status: {{ order?.status }}</pre> -->
      <!-- <pre>order.reason: {{ order?.reason }}</pre> -->
      <!-- <pre>order.payment: {{ order?.payment }}</pre> -->
      <!-- <pre>order: {{ order }}</pre> -->
    </b-modal>

    <!-- <pre>tableData: {{ tableData }}</pre> -->
  </div>
</template>

<script>
import axios from "axios";
import { orderStatuses, vendorStatuses } from "@/components/data";
import Multiselect from "vue-multiselect";
import { formatCurrencyCent } from "@/helpers";

export default {
  props: {
    vendor_id: {
      type: Number,
      default: 0,
    },
    client_id: {
      type: Number,
      default: 0,
    },
  },
  components: {
    Multiselect,
  },
  data() {
    return {
      loading: true,
      reqError: false,
      onFirst: true,

      orderStatuses: orderStatuses,
      orderStatusesFilter: [
        {
          id: "",
          label: "All",
        },
        ...orderStatuses,
      ],
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
        //     return `${this.$helpers.carTypesLabel(item.cartype)}`;
        //   },
        //   filterByFormatted: true,
        //   formatter: (value, key, item) => {
        //     return `${this.$helpers.carTypesLabel(item.cartype)}`;
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
    this.loadData();
  },
  computed: {
    displayedRows() {
      const items = this.currentPage * this.perPage;
      return items < this.totalRows ? items : this.totalRows;
    },
    isFullModal() {
      return !this.vendor_id && !this.client_id;
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
        vendor_id: this.vendor_id,
        client_id: this.client_id,
      };

      if (this.status.id || this.status.id === 0) {
        param.status = Number(this.status.id);
      }

      try {
        const response = await axios.post(
          this.$urls.URL_ADMIN_ORDER_HISTORY,
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
    status() {
      this.onFirst = false;
      this.currentPage = 1;
      this.loadTableData();
    },
    client_id() {
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
