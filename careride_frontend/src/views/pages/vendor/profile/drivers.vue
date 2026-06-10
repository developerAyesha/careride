<template>
  <Layout>
    <div class="row align-items-center text-center page-headline mb-3 mx-w">
      <div class="col-md-6 text-md-left">
        <h1 class="display-3">Drivers</h1>
      </div>

      <div class="col-md-6 text-md-right">
        <button v-if="user.status === 1 && tableData.length" class="btn btn-primary" @click.prevent="addDriver">
          <span class="material-symbols-rounded mr-2"> add </span>Add new driver
        </button>
      </div>
    </div>

    <!--STATUS 999: NOT attached stripe acc -->
    <notAttachStripeMsg v-if="!user.stripe_acc_complete" />

    <template v-else>
      <!--STATUS 0: New / Waiting approved changes -->
      <waitCard v-if="user.status === 0" />

      <!--STATUS 2: Declined -->
      <declinedCard v-if="user.status === 2" />

      <!--STATUS 1: Approved -->
      <template v-if="user.status === 1">
        <div v-if="loading">
          <div class="text-center">
            <b-spinner variant="primary" />
          </div>
        </div>
        <template v-else>
          <b-alert v-if="reqError" variant="danger" class="my-0" show v-html="reqError" />
          <template v-else>
            <template v-if="tableData.length">
              <div class="card mx-w">
                <div class="card-body">
                  <div class="table-responsive mb-0">
                    <b-table :items="tableData" :fields="tableFields" responsive="sm" :per-page="perPage"
                      :sort-by.sync="sortBy" :sort-desc.sync="sortDesc" :filter="filter"
                      :filter-included-fields="filterOn">
                      <template #cell(full_name)="data">
                        {{ data.item.first_name }} {{ data.item.second_name }}
                        {{ data.item.last_name }}
                      </template>
                      <template #cell(license_files)="data">
                        <a v-for="file in data.item.license_files" :key="file.id" :href="file.name"
                          @click.prevent="getFile(file)" target="_blank"><span
                            class="material-symbols-rounded fz-18 v-middle">
                            description </span>{{ file.name }}</a>
                      </template>
                      <template #cell(busy)="data">
                        {{ data.item.busy ? `#${data.item.busy}` : ` - ` }}
                      </template>
                      <template #cell(actions)="data">
                        <a href="#" @click.prevent="editDriver(data.item)" class="action-edit" title="Edit"><span
                            class="material-symbols-rounded fz-24 v-middle mx-1">
                            edit
                          </span></a>
                        <a href="#" @click.prevent="confirmDelete(data.item)" class="action-remove" title="Delete"><span
                            class="material-symbols-rounded fz-28 v-middle mx-1">
                            delete
                          </span></a>
                      </template>
                    </b-table>
                  </div>
                </div>
              </div>
              <div class="row mb-3">
                <div class="col-12">
                  <div class="dataTables_paginate paging_simple_numbers">
                    <ul class="pagination mb-0">
                      <b-pagination v-model="currentPage" :total-rows="totalRows" :per-page="perPage"></b-pagination>
                    </ul>
                  </div>
                </div>
              </div>
            </template>
            <div v-else class="empty-card">
              <div class="empty-card-img">
                <img :src="require('@/assets/images/drivers-empty.svg')" alt="no drivers yet" class="img-fluid" />
              </div>
              <div class="empty-card-msg">
                You haven't added any drivers yet
              </div>
              <div class="my-3">
                <button v-if="user.status === 1" class="btn btn-primary" @click.prevent="addDriver">
                  <span class="material-symbols-rounded mr-2"> add </span>Add
                  new driver
                </button>
              </div>
            </div>
          </template>
        </template>
      </template>
    </template>

    <b-modal v-model="showModal" size="lg" hide-header hide-footer centered>
      <formDriver :driver="driver" @onSubmit="submitForm" @onClose="showModal = false" />
    </b-modal>

    <!-- <pre>tableData: {{ tableData }}</pre> -->
    <!-- <pre>user: {{ user }}</pre> -->

    <Debuginfo class="static">
      <div>
        <pre>tableData: {{ tableData }}</pre>
      </div>
    </Debuginfo>

  </Layout>
</template>

<script>
import axios from "axios";
import { mapGetters, mapActions } from "vuex";
import Layout from "@/views/layouts/main";
import formDriver from "@/components/vendor/form-driver";
import notAttachStripeMsg from "@/components/vendor/not-attach-stripe-msg";
import waitCard from "@/components/vendor/wait-card";
import declinedCard from "@/components/vendor/declined-card";

export default {
  metaInfo() {
    return {
      title: this.$appConfig.title + " | Vendor | Drivers",
    };
  },
  components: {
    Layout,
    formDriver,
    notAttachStripeMsg,
    waitCard,
    declinedCard,
  },
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
        {
          key: "busy",
          label: "Busy",
          class: "text-center",
          sortable: true,
        },
        {
          key: "actions",
          class: "cell-action",
        },
      ],

      showModal: false,
      driver: "",
    };
  },
  created() {
    this.loadData();
  },
  computed: {
    ...mapGetters(["user"]),
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
        vendor_id: this.user.id,
        page: this.currentPage - 1,
        onpage: this.perPage,
      };

      try {
        const response = await axios.post(
          this.$urls.URL_VENDOR_DRIVER_LIST,
          param
        );
        console.log("Vendor drivers, response: ", response);
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
    confirmDelete(driver) {
      this.$bvModal
        .msgBoxConfirm(
          `Do you want to delete driver: ${driver.first_name} ${driver.second_name} ${driver.last_name} ?`,
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
            this.deleteDriver(driver.id);
          }
        })
        .catch((err) => {
          // An error occurred
        });
    },
    deleteDriver(id) {
      console.log("deleteDriver, id: ", id);
      axios({
        method: "delete",
        url: this.$urls.URL_VENDOR_DRIVER,
        data: { id },
      })
        .then(() => {
          this.loadTableData();
        })
        .catch(function (error) {
          console.log(error.response);
        });
    },
    editDriver(driver) {
      this.driver = { ...driver };
      this.showModal = true;
    },
    addDriver() {
      this.driver = {
        vendor_id: this.user.id,
      };
      this.showModal = true;
    },
    submitForm() {
      this.loadTableData();
      this.showModal = false;
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
<style scoped lang="scss"></style>
