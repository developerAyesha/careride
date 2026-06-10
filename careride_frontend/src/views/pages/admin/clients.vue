<template>
  <Layout>
    <div class="text-center text-md-left page-headline mb-4">
      <h1 class="display-3">Clients</h1>
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
        <div v-if="onstart && tableData.length === 0" class="empty-card">
          <div class="empty-card-img">
            <img
              :src="require('@/assets/images/no-clients.svg')"
              alt="no clients yet"
              class="img-fluid"
            />
          </div>
          <div class="empty-card-msg">There are no clients yet</div>
        </div>
        <div v-else class="card">
          <div class="card-body">
            <div class="row mb-md-2 text-center table-filters">
              <!-- Status filter -->
              <div class="col-sm-12 col-md-auto text-md-left">
                <div
                  class="table-filters-label d-block d-md-inline-flex align-items-center flex-wrap mr-2"
                >
                  <span class="text-nowrap mr-2">Filter by block:</span>
                  <multiselect
                    v-model="block"
                    :options="blockStatuses"
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
                <template #cell(user)="data">
                  <router-link :to="`/admin/clients/${data.item.id}`">{{
                    userName(data.item)
                  }}</router-link>
                </template>

                <template #empty>
                  <h4 class="text-center">
                    No orders with status: {{ block.label }}
                    <a
                      href="#"
                      @click.prevent="block = blockStatuses[0]"
                      title="Reset filter"
                      ><span class="material-symbols-rounded v-middle">
                        cancel
                      </span></a
                    >
                  </h4>
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
      </template>
    </div>

    <!-- <pre>blockStatuses: {{ blockStatuses }}</pre> -->
    <!-- <pre>tableData: {{ tableData }}</pre> -->
    <!-- <pre>{{carTypes}}</pre> -->
  </Layout>
</template>

<script>
import axios from "axios";
import Layout from "@/views/layouts/main";
import Multiselect from "vue-multiselect";
import {
  genderTypes,
} from "@/components/data";

export default {
  metaInfo() {
    return {
      title: this.$appConfig.title + " | Clients",
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
      onstart: true,

      genderTypes: genderTypes,
      blockStatuses: [
        {
          id: 0,
          label: "All", // Normal
        },
        {
          id: 1,
          label: "Block",
        },
      ],
      block: {
        id: 0,
        label: "All", // Normal
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
          key: "user",
          label: "Full name",
          sortable: true,
          class: "cell-user",
          sortByFormatted: (value, key, item) => {
            return this.userName(item);
          },
          filterByFormatted: true,
          formatter: (value, key, item) => {
            return this.userName(item);
          },
        },
        {
          key: "login",
          label: "Phone number",
          sortable: true,
        },
        {
          key: "datebirth",
          label: "Date of birth",
          sortable: true,
          sortByFormatted: (value, key, item) => {
            return `${this.fromCustomDate(item.datebirth)}`;
          },
          filterByFormatted: true,
          formatter: (value, key, item) => {
            return `${this.fromCustomDate(item.datebirth)}`;
          },
        },
        {
          key: "gender",
          sortable: true,
          sortByFormatted: (value, key, item) => {
            return item.gender ? this.genderTypes.find((g) => g.key === item.gender)?.label : "";
          },
          filterByFormatted: true,
          formatter: (value, key, item) => {
            return item.gender ? this.genderTypes.find((g) => g.key === item.gender)?.label : "";
          },
        },
        {
          key: "email",
          sortable: true,
        },
        {
          key: "address",
          sortable: true,
        },
        {
          key: "facility_name",
          sortable: true,
        },
      ],
    };
  },
  created() {
    // this.block = this.blockStatuses[0];
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
      // "block": 0,
      // "login": ""

      const param = {
        page: this.currentPage - 1,
        onpage: this.perPage,
        block: Number(this.block.id),
      };

      try {
        const response = await axios.post(
          this.$urls.URL_ADMIN_CLIENT_LIST,
          param
        );
        // console.log("Admin, Clients, loadTableData, response: ", response);
        this.tableData = response.data.client_list.items;
        // this.tableData = [];
        this.totalRows = response.data.client_list.total;
      } catch (error) {
        console.log("Admin, Clients, loadTableData, error: ", error);
        this.reqError = true;
        if (error.response?.data?.message) {
          this.reqError = `<b>[ERROR: ${error.response.status}]</b> ${error.response?.data?.message}`;
        }
      }
    },
    userName(user) {
      let name = "";

      if (user.first_name) {
        name += `${user.first_name} `;
      }

      if (user.second_name) {
        name += `${user.second_name} `;
      }

      if (user.last_name) {
        name += `${user.last_name}`;
      }

      return name.replace(/\s/g, "") ? name : "---";
    },
    fromCustomDate(date) {
      if (!date) {
        return " --- ";
      }

      const s = String(date);
      const parsed = `${s.substring(0, 4)}-${s.substring(4, 6)}-${s.substring(
        6,
        8
      )}`;

      return (
        new Date(parsed).toLocaleString("en-US", {
          day: "numeric",
        }) +
        " " +
        new Date(parsed).toLocaleString("en-US", {
          month: "short",
          year: "numeric",
        })
      );
    },
  },
  watch: {
    currentPage() {
      this.loadTableData();
    },
    perPage() {
      this.loadTableData();
    },
    block() {
      this.onstart = false;
      this.currentPage = 1;
      this.loadTableData();
    },
  },
};
</script>
<style scoped lang="scss">
.cell-user a {
  color: #ff8528;
  text-decoration: none;
  font-weight: 600;

  &:hover {
    color: #ff8528;
    text-decoration: underline;
  }
}
</style>
