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
                  <template #cell(cartype)="data">
                    {{ carTypesLabel(data.item.cartype) }}
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
                :src="require('@/assets/images/cars-empty.svg')"
                alt="no cars yet"
                class="img-fluid"
                width="336px"
              />
            </div>
            <div class="empty-card-txt">There are no cars yet</div>
          </div>
        </div>
      </template>
    </template>
  </div>
</template>

<script>
import axios from "axios";
import { carTypes } from "@/components/data";

export default {
  props: {
    id: Number,
  },
  components: {},
  data() {
    return {
      reqError: false,
      loading: true,
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
          key: "model",
          label: "Car Model",
          sortable: true,
          class: "text-bold",
        },
        {
          key: "plate",
          label: "License plate",
          sortable: true,
        },
        {
          key: "cartype",
          label: "Car type",
          sortable: true,
          sortByFormatted: (value, key, item) => {
            return `${this.carTypesLabel(item.cartype)}`;
          },
        },
        {
          key: "color",
          sortable: true,
        },
      ],
      carTypes: [...carTypes],
    };
  },
  created() {
    this.loadData();
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
    async loadTableData() {
      this.reqError = false;

      const param = {
        vendor_id: this.id,
        page: this.currentPage - 1,
        onpage: this.perPage,
      };

      try {
        const response = await axios.post(
          this.$urls.URL_VENDOR_CAR_LIST,
          param
        );
        console.log("Component table-cars, response: ", response);
        this.tableData = response.data.carlist.items;
        this.totalRows = response.data.carlist.total;
      } catch (error) {
        console.log("loadTableData, error: ", error);
        this.reqError = true;
        if (error.response?.data?.message) {
          this.reqError = `<b>[ERROR: ${error.response.status}]</b> ${error.response?.data?.message}`;
        }
      }
    },
    carTypesLabel(id) {
      return this.carTypes.find((t) => t.id === id).label;
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
