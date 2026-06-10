<template>
  <div>
    <div class="card" v-if="loading">
      <div class="card-body">
        <div class="text-center">
          <b-spinner variant="primary" />
        </div>
      </div>
    </div>
    <template v-else>
      <b-alert
        v-if="reqError"
        variant="danger"
        class="my-0"
        show
        v-html="reqError"
      />
      <template v-else>
        <template v-if="tableData.length > 0">
          <div class="card">
            <div class="card-body">
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
                  <template #cell(full_name)="data">
                    {{ data.item.first_name }} {{ data.item.second_name }}
                    {{ data.item.last_name }}
                  </template>
                  <template #cell(license_files)="data">
                    <a
                      v-for="file in data.item.license_files"
                      :key="file.id"
                      :href="file.name"
                      @click.prevent="getFile(file)"
                      target="_blank"
                      ><span class="material-symbols-rounded fz-18 v-middle">
                        description </span
                      >{{ file.name }}</a
                    >
                  </template>
                </b-table>
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
        <div v-else class="card">
          <div class="card-body empty-card">
            <div class="empty-card-img">
              <img
                :src="require('@/assets/images/drivers-empty.svg')"
                alt="no drivers yet"
                class="img-fluid"
                width="219px"
              />
            </div>
            <div class="empty-card-txt">There are no drivers yet</div>
          </div>
        </div>
      </template>
    </template>
  </div>
</template>

<script>
import axios from "axios";
import { mapActions } from "vuex";

export default {
  props: {
    id: Number,
  },
  components: {},
  data() {
    return {
      loading: true,
      reqError: false,
      tableData: [],
      totalRows: 30,
      currentPage: 1,
      perPage: 10,
      filter: null,
      filterOn: [],
      sortBy: "first_name",
      sortDesc: false,
      tableFields: [
        {
          key: "full_name",
          sortable: true,
          sortByFormatted: (value, key, item) => {
            return `${item.first_name} ${item.second_name} ${item.last_name}`;
          },
          class: "text-bold",
        },
        {
          key: "login",
          label: "Phone number",
          sortable: true,
        },
        {
          key: "license_files",
          label: "Driver license",
          class: "cell-license",
        },
      ],
    };
  },
  created() {
    this.loadData();
  },
  methods: {
    ...mapActions(["getFile"]),
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
    async loadTableData() {
      this.reqError = false;

      const param = {
        vendor_id: this.id,
        page: this.currentPage - 1,
        onpage: this.perPage,
      };

      try {
        const response = await axios.post(
          this.$urls.URL_VENDOR_DRIVER_LIST,
          param
        );
        // console.log("Component table-drivers, response: ", response);
        this.tableData = response.data.driverlist.items;
        this.totalRows = response.data.driverlist.total;
      } catch (error) {
        console.log("loadTableData, error: ", error);
        this.reqError = true;
        if (error.response?.data?.message) {
          this.reqError = `<b>[ERROR: ${error.response.status}]</b> ${error.response?.data?.message}`;
        }
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
  },
};
</script>
