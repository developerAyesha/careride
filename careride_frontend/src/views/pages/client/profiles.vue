<template>
  <Layout>
    <div class="row align-items-center text-center page-headline mb-3">
      <div class="col-md-6 text-md-left">
        <h1 class="display-3">Ride profiles</h1>
      </div>

      <div class="col-md-6 text-md-right">
        <button class="btn btn-primary" @click.prevent="addProfile">
          <span class="material-symbols-rounded mr-2"> add </span>Add new
          profile
        </button>
      </div>
    </div>

    <div v-if="loading">
      <div class="text-center">
        <b-spinner variant="primary" />
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
        <template v-if="tableData.length">
          <div class="card">
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
                  @filtered="onFiltered"
                  :current-page="currentPage"
                >
                  <template #cell(actions)="data">
                    <a
                      href="#"
                      @click.prevent="editProfile(data.item)"
                      class="action-edit"
                      title="Edit"
                      ><span
                        class="material-symbols-rounded fz-24 v-middle mx-1"
                      >
                        edit
                      </span></a
                    >
                    <a
                      href="#"
                      @click.prevent="confirmDelete(data.item)"
                      class="action-remove"
                      title="Delete"
                      ><span
                        class="material-symbols-rounded fz-28 v-middle mx-1"
                      >
                        delete
                      </span></a
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
        <div v-else class="empty-card">
          <div class="empty-card-img">
            <img
              :src="require('@/assets/images/no-profiles.svg')"
              alt="no profiles yet"
              class="img-fluid"
            />
          </div>
          <div class="empty-card-msg">
            You haven't added any ride profiles yet
          </div>
        </div>
      </template>
    </template>
    <b-modal v-model="showModal" size="lg" hide-header hide-footer centered>
      <formProfile
        :profile="profile"
        @onSubmit="submitForm"
        @onClose="showModal = false"
      />
    </b-modal>

    <!-- <pre>tableData: {{ tableData }}</pre> -->
    <!-- <pre>client.orderpreset: {{ client.orderpreset }}</pre> -->
  </Layout>
</template>

<script>
import Layout from "@/views/layouts/main";
import axios from "axios";
import { mapState, mapGetters, mapActions } from "vuex";
import formProfile from "@/components/client/form-profile";
import {
  genderTypes,
  escortTypes,
  carTypes,
  mapFields,
} from "@/components/data";

export default {
  metaInfo() {
    return {
      title: this.$appConfig.title + " | Ride profiles",
    };
  },
  components: {
    Layout,
    formProfile,
  },
  data() {
    return {
      loading: true,
      reqError: false,

      totalRows: 30,
      currentPage: 1,
      pageOptions: [5, 10, 25, 50],
      perPage: 10,
      filter: null,
      filterOn: [],
      sortBy: "title",
      sortDesc: false,

      carTypes: [...carTypes],
      genderTypes: genderTypes,
      escortTypes: escortTypes,

      tableFields: [
        {
          key: "title",
          sortable: true,
        },
        {
          key: "cartype",
          label: "Car type",
          sortable: true,
          sortByFormatted: (value, key, item) => {
            return `${this.carTypesLabel(item.cartype)}`;
          },
          filterByFormatted: true,
          formatter: (value, key, item) => {
            return `${this.carTypesLabel(item.cartype)}`;
          },
        },
        {
          key: "escort",
          label: "Accompanied by",
          sortable: true,
          sortByFormatted: (value, key, item) => {
            return `${this.escortLabel(item.escort)}`;
          },
          filterByFormatted: true,
          formatter: (value, key, item) => {
            return `${this.escortLabel(item.escort)}`;
          },
        },
        {
          key: "contact",
          label: "Contact number",
          sortable: true,
        },
        {
          key: "weight",
          label: "Weight (lb)",
          sortable: true,
        },
        {
          key: "height",
          label: "Height (ft, inches)",
          sortable: true,
          sortByFormatted: (value, key, item) => {
            return `${this.heightFormatter(item.height)}`;
          },
          filterByFormatted: true,
          formatter: (value, key, item) => {
            return `${this.heightFormatter(item.height)}`;
          },
        },
        {
          key: "instruction",
          label: "Special instructions",
        },
        {
          key: "actions",
          class: "cell-action",
          sortable: false,
        },
      ],

      showModal: false,
      profile: null,
    };
  },
  computed: {
    ...mapGetters(["client"]),
    tableData() {
      // pagination filters ...
      return this.client.orderpreset || [];
    },
  },
  created() {
    this.loadData();
  },
  methods: {
    ...mapActions(["fetchClientOrderpreset"]),
    async loadData() {
      this.loading = true;

      try {
        await this.loadTableData();
      } catch (error) {
        console.log("loadData Error: ", error);
      } finally {
        this.loading = false;
      }
    },
    async loadTableData() {
      this.reqError = false;

      try {
        await this.fetchClientOrderpreset();
        this.totalRows = this.client.orderpreset.length;
      } catch (error) {
        console.log("loadTableData, error: ", error);
        this.reqError = true;
        if (error.response?.data?.message) {
          this.reqError = `<b>[ERROR: ${error.response.status}]</b> ${error.response?.data?.message}`;
        }
      }
    },
    confirmDelete(profile) {
      this.$bvModal
        .msgBoxConfirm(
          `Do you want to delete ride profile: ${profile.title} ?`,
          {
            title: "Deletion confirmation",
            size: "md",
            buttonSize: "md",
            okVariant: "danger",
            okTitle: "Yes",
            cancelTitle: "Cancel",
            footerClass: "p-2",
            hideHeaderClose: false,
            centered: true,
          }
        )
        .then((sure) => {
          if (sure) {
            this.deleteProfile(profile.id);
          }
        })
        .catch((err) => {
          // An error occurred
        });
    },
    deleteProfile(id) {
      // console.log("deleteProfile, id: ", id);
      axios({
        method: "delete",
        url: this.$urls.URL_CLIENT_ORDER_PRESET,
        data: { id },
      })
        .then(() => {
          this.loadTableData();
        })
        .catch(function (error) {
          console.log(error.response);
        });
    },
    editProfile(profile) {
      this.profile = { ...profile };
      this.showModal = true;
    },

    addProfile() {
      this.profile = null;
      this.showModal = true;
    },
    submitForm() {
      this.loadTableData();
      this.showModal = false;
    },
    onFiltered(filteredItems) {
      this.totalRows = filteredItems.length;
      this.currentPage = 1;
    },
    carTypesLabel(id) {
      return this.carTypes.find((t) => t.id === id).label;
    },
    escortLabel(escort) {
      if (!escort) {
        return "---";
      }
      return this.escortTypes.find((e) => Number(e.id) === Number(escort))
        .label;
    },
    // formatted from ft => ft, inch
    heightFormatter(h) {
      const ft = parseInt(h);
      const inch = Math.round((h - parseInt(h)) * 12);

      return ft + "' " + inch + "''";
    },
  },
};
</script>
