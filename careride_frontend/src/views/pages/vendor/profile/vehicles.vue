<template>
  <Layout>
    <div class="row align-items-center text-center page-headline mb-3 mx-w">
      <div class="col-md-6 text-md-left">
        <h1 class="display-3">Vehicles</h1>
      </div>

      <div class="col-md-6 text-md-right">
        <button v-if="user.status === 1 && tableData.length" class="btn btn-primary" @click.prevent="addCar">
          <span class="material-symbols-rounded mr-2"> add </span>Add new car
        </button>
      </div>
    </div>

    <!-- NOT attached stripe acc -->
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
                      <template #cell(cartype)="data">
                        {{ carTypesLabel(data.item.cartype) }}
                      </template>
                      <template #cell(busy)="data">
                        {{ data.item.busy ? `#${data.item.busy}` : ` - ` }}
                      </template>
                      <template #cell(actions)="data">
                        <a href="#" @click.prevent="editCar(data.item)" class="action-edit" title="Edit"><span
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
                <img :src="require('@/assets/images/cars-empty.svg')" alt="no cars yet" class="img-fluid" />
              </div>
              <div class="empty-card-msg">You haven't added any cars yet</div>
              <div class="my-3">
                <button v-if="user.status === 1" class="btn btn-primary" @click.prevent="addCar">
                  <span class="material-symbols-rounded mr-2"> add </span>Add
                  new car
                </button>
              </div>
            </div>
          </template>
        </template>
      </template>
    </template>

    <b-modal v-model="showModal" size="lg" hide-header hide-footer centered>
      <formCar :car="car" @onSubmit="submitForm" @onClose="showModal = false" />
    </b-modal>

    <Debuginfo class="static">
      <div>
        <pre>tableData: {{ tableData }}</pre>
      </div>
    </Debuginfo>

    <!-- <pre>user: {{ user }}</pre> -->
  </Layout>
</template>

<script>
import axios from "axios";
import { carTypes } from "@/components/data";
import { mapGetters } from "vuex";
import Layout from "@/views/layouts/main";
import formCar from "@/components/vendor/form-car";
import notAttachStripeMsg from "@/components/vendor/not-attach-stripe-msg";
import waitCard from "@/components/vendor/wait-card";
import declinedCard from "@/components/vendor/declined-card";

export default {
  metaInfo() {
    return {
      title: this.$appConfig.title + " | Vendor | Cars",
    };
  },
  components: {
    Layout,
    formCar,
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
          key: "model",
          label: "Car model",
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
      car: "",
      carTypes: [...carTypes],
    };
  },
  created() {
    this.loadData();
  },
  computed: {
    ...mapGetters(["user"]),
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
        vendor_id: this.user.id,
        page: this.currentPage - 1,
        onpage: this.perPage,
      };

      try {
        const response = await axios.post(
          this.$urls.URL_VENDOR_CAR_LIST,
          param
        );
        console.log("Vendor cars, response: ", response);
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
    confirmDelete(car) {
      this.$bvModal
        .msgBoxConfirm(`Do you want to delete car: ${car.model} ?`, {
          title: "Deletion confirmation",
          size: "md",
          buttonSize: "md",
          okVariant: "danger",
          okTitle: "Yes",
          cancelTitle: "Cancel",
          footerClass: "p-2",
          hideHeaderClose: false,
          centered: true,
        })
        .then((sure) => {
          if (sure) {
            this.deleteCar(car.id);
          }
        })
        .catch((err) => {
          // An error occurred
        });
    },
    deleteCar(id) {
      console.log("deleteCar, id: ", id);
      axios({
        method: "delete",
        url: this.$urls.URL_VENDOR_CAR,
        data: { id },
      })
        .then(() => {
          this.loadTableData();
        })
        .catch(function (error) {
          console.log(error.response);
        });
    },
    editCar(car) {
      this.car = { ...car };
      this.showModal = true;
    },
    addCar() {
      this.car = {
        vendor_id: this.user.id,
      };
      this.showModal = true;
    },
    carTypesLabel(id) {
      return this.carTypes.find((t) => t.id === id).label;
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
