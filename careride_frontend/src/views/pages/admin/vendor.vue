<template>
  <Layout>
    <div class="row align-items-center text-center page-headline mb-4">
      <div class="col-auto text-md-left">
        <h1 class="display-3">
          <router-link to="/admin/vendors" class="mr-2">Vendors</router-link>
          <span class="material-symbols-rounded fz-28"> chevron_right </span>
          {{ vendor.company_name }}
        </h1>
      </div>
      <div class="col-auto text-md-right ml-md-auto">
        <div
          v-if="vendor.block"
          class="box-vendor-status box-vendor-status-block"
        >
          Blocked
        </div>
        <div
          v-else
          class="box-vendor-status"
          :class="`box-vendor-status-${vendor.status}`"
        >
          {{ statusLabel(vendor.status) }}
        </div>
      </div>
    </div>

    <div v-if="loading" class="loader-box">
      <b-spinner variant="primary" />
    </div>
    <div v-else class="row mb-2">
      <div class="col-12">
        <div class="card">
          <div class="card-body pb-0">
            <div class="row">
              <div class="col-12 col-md-6 col-xl-3 mb-3 mb-md-0">
                <div class="vendor-info">
                  <div class="vendor-info-label">Vendor name</div>
                  <div class="vendor-info-text">
                    {{ vendor.company_name }}
                  </div>
                </div>
                <div class="vendor-info">
                  <div class="vendor-info-label">Phone number</div>
                  <div class="vendor-info-text">{{ vendor.login }}</div>
                </div>
                <div class="vendor-info">
                  <div class="vendor-info-label">Email</div>
                  <div class="vendor-info-text">
                    {{ vendor.email || " --- " }}
                  </div>
                </div>
              </div>

              <div class="col-12 col-md-6 col-xl-3 mb-3 mb-md-0">
                <div class="vendor-info">
                  <div class="vendor-info-label">Full Name</div>
                  <div class="vendor-info-text">
                    {{ vendor.first_name }} {{ vendor.second_name }}
                    {{ vendor.last_name }}
                  </div>
                </div>
                <div class="vendor-info">
                  <div class="vendor-info-label">Address</div>
                  <div class="vendor-info-text">
                    {{ vendor.address }}, {{ vendor.city }}, {{ vendor.state }},
                    {{ vendor.zipcode }}
                  </div>
                </div>
                <div class="vendor-info">
                  <div class="vendor-info-label">Car types</div>
                  <div class="vendor-info-text">
                    <div v-if="vendor.costmt1">
                      {{
                        `${carTypesLabelByKey("costmt1")} &ndash; $ ${
                          vendor.costmt1
                        },`
                      }}
                      <template v-if="vendor.baseprice1">
                        <br />
                        Base price &ndash; $ {{ vendor.baseprice1 }},
                      </template>
                    </div>
                    <div v-if="vendor.costmt2">
                      {{
                        `${carTypesLabelByKey("costmt2")} &ndash; $ ${
                          vendor.costmt2
                        },`
                      }}
                      <template v-if="vendor.baseprice2">
                        <br />
                        Base price &ndash; $ {{ vendor.baseprice2 }}
                      </template>
                    </div>
                  </div>
                </div>
              </div>

              <div class="col-12 col-md-6 col-xl-3 mb-3 mb-md-0">
                <div class="vendor-info">
                  <div class="vendor-info-label">
                    After hours additional cost
                  </div>
                  <div class="vendor-info-text">
                    <template
                      v-if="vendor.overtimes && vendor.overtimes.length"
                    >
                      <div
                        v-for="overtime of vendor.overtimes"
                        :key="overtime.id"
                      >
                        {{
                          getOverflowDiapasonTime(
                            overtime.timefrom,
                            overtime.timeto
                          )
                        }}
                        &ndash; $ {{ overtime.price }}
                        <!-- {{
                          `${overtime.timefrom_h} - ${overtime.timeto_h} &ndash; $ ${overtime.price}`
                        }} -->
                      </div>
                    </template>
                    <template v-else> --- </template>
                  </div>
                </div>
                <div class="vendor-info">
                  <div class="vendor-info-label">Additional services</div>
                  <div class="vendor-info-text">
                    <template
                      v-if="
                        vendor.services &&
                        filterServices(vendor.services).length
                      "
                    >
                      <div
                        v-for="service of filterServices(vendor.services)"
                        :key="service.id"
                      >
                        {{ `${service.t} &ndash; $ ${service.price}` }}
                      </div>
                    </template>
                    <template v-else> --- </template>
                  </div>
                </div>
              </div>

              <div class="col-12 col-md-6 col-xl-3 mb-3 mb-md-0">
                <div class="vendor-info">
                  <div class="vendor-info-label">License</div>
                  <div class="vendor-info-text">
                    <div v-for="file in vendor.license_files" :key="file.id">
                      <a
                        :href="file.name"
                        @click.prevent="getFile(file)"
                        target="_blank"
                        class="link-license"
                        ><span
                          class="material-symbols-rounded fz-18 doc-ico mr-1"
                        >
                          description </span
                        ><span class="mr-2">{{ file.name }}</span></a
                      >
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Check vendor attached stripe acc  -->
      <div v-if="!vendor.stripe_acc_complete" class="col-12">
        <b-alert show variant="warning" class="text-center">
          <h3>
            Waiting for vendor attached stripe acc. <br />
            After that can: Approve / Decline / Block vendor.
          </h3>
        </b-alert>
      </div>
      <div v-else class="col-12 action-btns text-center text-sm-left">
        <button
          v-if="vendor.status !== 1"
          @click="approve"
          :disabled="wait"
          class="btn btn-primary mx-auto mr-sm-3 mb-3"
        >
          <span class="material-symbols-rounded fz-28 mr-2"> done </span>Approve
        </button>
        <button
          v-if="vendor.status !== 1"
          @click="decline"
          :disabled="wait"
          class="btn btn-outline-primary mx-auto mr-sm-3 mb-3"
        >
          <span class="material-symbols-rounded fz-28 mr-2"> close </span
          >Decline
        </button>
        <button
          v-if="!vendor.block"
          @click="block"
          class="btn btn-outline-secondary mx-auto mr-sm-3 mb-3"
        >
          <span class="material-symbols-rounded fz-28 mr-2"> block </span>Block
        </button>
        <button
          v-else
          @click="unblock"
          class="btn btn-primary mx-auto mr-sm-3 mb-3"
        >
          Unblock
        </button>
      </div>
    </div>

    <div class="row">
      <div class="col-xl-7">
        <h3 class="header-title">Cars</h3>
        <tableCars :id="Number(id)" />
      </div>
      <div class="col-xl-5">
        <h3 class="header-title">Drivers</h3>
        <tableDrivers :id="Number(id)" />
      </div>
    </div>

    <!-- <pre>vendor.license_files: {{ vendor.license_files }}</pre> -->
    <!-- <pre>vendorStatuses: {{ vendorStatuses }}</pre> -->
    <!-- <pre>sliderSteps: {{ sliderSteps }}</pre> -->
    <!-- <pre>vendor: {{ vendor }}</pre> -->
  </Layout>
</template>

<script>
import axios from "axios";
import Layout from "@/views/layouts/main";
import { vendorStatuses, carTypes, timeline } from "@/components/data";
import tableCars from "@/components/admin/vendor/table-cars";
import tableDrivers from "@/components/admin/vendor/table-drivers";
import { mapActions } from "vuex";

export default {
  metaInfo() {
    return {
      title: this.$appConfig.title + " | Vendor detail",
    };
  },
  components: {
    Layout,
    tableCars,
    tableDrivers,
  },
  data() {
    return {
      loading: false,
      reqError: false,

      carTypes: [...carTypes],
      vendorStatuses: [...vendorStatuses],
      status: "",

      vendor: "",
      wait: false,

      sliderSteps: timeline,
    };
  },
  created() {
    this.loadVendor(1);
  },
  computed: {
    id() {
      return Number(this.$route.params.id);
    },
  },
  methods: {
    ...mapActions(["getFile"]),
    async loadVendor(loader = false) {
      if (loader) {
        this.loading = true;
      }
      this.reqError = false;

      try {
        const response = await axios.post(this.$urls.URL_VENDOR_INFO, {
          id: this.id,
        });
        console.log("loadVendor, response: ", response);
        this.vendor = response.data.user;
      } catch (error) {
        console.log("loadVendor, error: ", error);
        this.reqError = true;
        if (error.response?.data?.message) {
          this.reqError = `<b>[ERROR: ${error.response.status}]</b> ${error.response?.data?.message}`;
        }
      } finally {
        if (loader) {
          this.loading = false;
        }
      }
    },
    statusLabel(id) {
      return this.vendorStatuses.find((v) => v.id === id)?.label;
    },
    async approve() {
      this.wait = true;

      try {
        const response = await axios.post(this.$urls.URL_VENDOR_APPROVE, {
          id: this.vendor.id,
          approve: 1,
        });

        this.vendor = response.data.vendor;
      } catch (error) {
        console.log("approve, error: ", error);
      } finally {
        this.wait = false;
      }
    },
    async decline() {
      this.wait = true;

      try {
        const response = await axios.post(this.$urls.URL_VENDOR_APPROVE, {
          id: this.vendor.id,
          approve: 2,
        });

        this.vendor = response.data.vendor;
      } catch (error) {
        console.log("decline, error: ", error);
      } finally {
        this.wait = false;
      }
    },
    async block() {
      this.wait = true;

      try {
        const response = await axios.post(this.$urls.URL_VENDOR_PROFILE, {
          id: this.vendor.id,
          block: 1,
          company_name: this.vendor.company_name,
          first_name: this.vendor.first_name,
        });
        // console.log("block, response: ", response);
        this.vendor = response.data.vendor;
      } catch (error) {
        console.log("block, error: ", error);
      } finally {
        this.wait = false;
      }
    },
    async unblock() {
      this.wait = true;

      try {
        const response = await axios.post(this.$urls.URL_VENDOR_PROFILE, {
          id: this.vendor.id,
          block: 0,
          company_name: this.vendor.company_name,
          first_name: this.vendor.first_name,
        });
        // console.log("unblock, response: ", response);
        this.vendor = response.data.vendor;
      } catch (error) {
        console.log("unblock, error: ", error);
      } finally {
        this.wait = false;
      }
    },
    carTypesLabelByKey(key) {
      return this.carTypes.find((t) => t.key === key).label;
    },
    filterServices(services) {
      if (!services || !services.length) {
        return [];
      }

      return services.filter((s) => s.price);
    },
    getOverflowDiapasonTime(from, to) {
      let f = this.sliderSteps.find((step) => Number(step.f) === from).id;
      let t = this.sliderSteps.find((step) => Number(step.f) === to).id;
      // console.log("getOverflowDiapasonTime, from: ", f);
      // console.log("getOverflowDiapasonTime, to: ", t);

      // fix id's
      if ((f > t && t === 1) || (f == 1 && t === 1)) {
        t = 25;
      }

      // get by id formatted time and return
      f = this.sliderSteps.find((step) => Number(step.id) === f).name;
      t = this.sliderSteps.find((step) => Number(step.id) === t).name;

      return `${f} - ${t}`;
    },
  },
  watch: {},
};
</script>
<style scoped lang="scss">
.vendor-info {
  margin-bottom: 14px;

  &-label {
    font-size: 14px;
    font-weight: 400;
    color: #505655;
  }

  &-text {
    font-family: "Montserrat", sans-serif;
    font-weight: 600;
    font-size: 18px;
    color: #293331;
  }

  &-text .doc-ico {
    vertical-align: middle;
    position: relative;
    top: -2px;
  }

  &-text .link {
    color: #ff8528;
  }
}

.action-btns .btn {
  width: 284px;
}

.action-btns .btn .material-symbols-rounded {
  position: relative;
  top: -2px;
}

.link-license {
  color: #293331;
  text-decoration: none;
}

.link-license:hover {
  color: #293331;
  text-decoration: underline;
}
</style>
