<template>
  <Layout>
    <div class="text-center text-md-left page-headline mb-4">
      <h1 class="display-3">Vendors</h1>
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
              <!-- Status filter -->
              <div class="col-sm-12 col-md-auto text-md-left">
                <div
                  class="table-filters-label d-block d-md-inline-flex align-items-center flex-wrap mr-2"
                >
                  <span class="text-nowrap mr-2"
                    >Filter by status of approval:</span
                  >
                  <multiselect
                    v-model="status"
                    :options="vendorStatuses"
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
                <template #cell(company_name)="data">
                  <router-link :to="`/admin/vendors/${data.item.id}`">{{
                    data.item.company_name
                  }}</router-link>
                </template>

                <template #cell(name)="data">
                  {{ data.item.first_name }} {{ data.item.second_name }}
                  {{ data.item.last_name }}
                </template>

                <template #cell(address)="data">
                  {{ data.item.address }}, {{ data.item.city }},
                  {{ data.item.state }}, {{ data.item.zipcode }}
                </template>

                <template #cell(car_types_price)="data">
                  <div v-if="data.item.costmt1">
                    {{
                      `${carTypesLabelByKey("costmt1")} - $ ${
                        data.item.costmt1
                      },`
                    }}
                  </div>
                  <div v-if="data.item.costmt2">
                    {{
                      `${carTypesLabelByKey("costmt2")} - $ ${
                        data.item.costmt2
                      }`
                    }}
                  </div>
                </template>
                <template #cell(status)="data">
                  <div
                    :class="`color-vendor-status color-vendor-status-${data.item.status}`"
                  >
                    {{ statusLabel(data.item.status) }}
                  </div>
                </template>
                <template #cell(stripe_acc_complete)="data">
                  <div class="text-center">
                    <span
                      v-if="data.item.stripe_acc_complete"
                      class="material-symbols-rounded color-vendor-status-1"
                      title="Stripe acc attached"
                      >done</span
                    >
                    <span
                      v-else
                      title="Stripe acc NOT attached"
                      class="material-symbols-rounded"
                    >
                      remove
                    </span>
                  </div>
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
              :src="require('@/assets/images/vendors-empty.svg')"
              alt="no drivers yet"
              class="img-fluid"
            />
          </div>
          <div class="empty-card-msg">There are no vendors yet</div>
        </div>
      </template>
    </div>

    <!-- <pre>{{carTypes}}</pre> -->
    <!-- <pre>{{ tableData }}</pre> -->
  </Layout>
</template>

<script>
import axios from "axios";
import Layout from "@/views/layouts/main";
import { vendorStatuses, carTypes } from "@/components/data";
import Multiselect from "vue-multiselect";

export default {
  metaInfo() {
    return {
      title: this.$appConfig.title + " | Vendors",
    };
  },
  components: {
    Layout,
    Multiselect,
  },
  data() {
    return {
      loading: true,
      reqError: false,

      carTypes: [...carTypes],
      vendorStatuses: [
        {
          id: "all",
          label: "All",
        },
        ...vendorStatuses,
      ],
      status: {
        id: "all",
        label: "All",
      },

      loadingTable: true,
      tableData: [],
      totalRows: 30,
      currentPage: 1,
      pageOptions: [5, 10, 25, 50, 100],
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
          key: "company_name",
          label: "Vendor name",
          sortable: true,
        },
        {
          key: "login",
          label: "Phone number",
          sortable: true,
        },
        {
          key: "email",
          sortable: true,
        },
        {
          key: "name",
          label: "Full name of represantive",
          sortable: true,
        },
        {
          key: "car_types_price",
          label: "Car types - Price per mile",
        },
        {
          key: "address",
          label: "Address",
        },
        {
          key: "status",
          label: "Approval",
          sortable: true,
        },
        {
          key: "stripe_acc_complete",
          label: "Stripe",
          sortable: true,
        },
      ],
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

      if (this.status.id !== "all") {
        param.status = String(this.status.id);
      }

      try {
        const response = await axios.post(this.$urls.URL_VENDOR_LIST, param);
        console.log("Admin, Vendors, loadTableData, response: ", response);
        this.tableData = response.data.vendorlist.items;
        this.totalRows = response.data.vendorlist.total;
      } catch (error) {
        console.log("Admin, Vendors, loadTableData, error: ", error);
        this.reqError = true;
        if (error.response?.data?.message) {
          this.reqError = `<b>[ERROR: ${error.response.status}]</b> ${error.response?.data?.message}`;
        }
      } finally {
        this.loadingTable = false;
      }
    },
    statusLabel(id) {
      return this.vendorStatuses.find((v) => v.id === id)?.label;
    },
    carTypesLabelByKey(key) {
      return this.carTypes.find((t) => t.key === key).label;
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
  },
};
</script>
