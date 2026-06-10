<template>
  <Layout>
    <div class="row align-items-center text-center page-headline mb-4">
      <div class="col-12 col-md-auto text-md-left">
        <h1 class="display-3">Personal info</h1>
      </div>
      <div class="col-12 col-md-auto text-md-right ml-md-auto">
        <!-- edit -->
        <button
          v-if="!isEdit"
          class="btn btn-primary btn-ico ml-2"
          @click.prevent="
            isEdit = true;
            msg.has = false;
          "
          title="Edit"
        >
          <span class="material-symbols-rounded"> edit </span>
        </button>

        <!-- save -->
        <button
          v-if="isEdit"
          class="btn btn-primary btn-ico ml-2"
          @click.prevent="saveChanges"
          title="Save changes"
          :disabled="trySubmit"
        >
          <span class="material-symbols-rounded"> done </span>
        </button>

        <!-- cancel -->
        <button
          v-if="isEdit"
          class="btn btn-outline-primary btn-ico ml-2"
          @click.prevent="cancelChanges"
          title="Cancel"
        >
          <span class="material-symbols-rounded"> close </span>
        </button>
      </div>
    </div>

    <b-alert
      :variant="msg.type"
      dismissible
      class="mt-3 col-lg-6 mx-lg-auto"
      v-model="msg.has"
      :show="msg.text"
      >{{ msg.text }}</b-alert
    >

    <div class="row">
      <div class="col-md-6 col-xl-4 mb-3 mb-md-0">
        <div class="card card h-100 mb-0">
          <div class="card-body">
            <div class="form-group mb-2">
              <label>Phone Number</label>
              <div class="input-group input-group-merge">
                <input
                  :value="user.login"
                  v-mask="'+1 ##########'"
                  placeholder="+1 ##########"
                  type="text"
                  readonly
                  class="form-control"
                />
              </div>
            </div>

            <!-- datebirth (19901010 = Y-M-D) -->
            <div class="form-group mb-2">
              <label>Birth</label>
              <div class="input-group input-group-merge">
                <date-picker
                  v-model="form.datebirth"
                  :disabled="!isEdit"
                  :lang="datepickerConfig"
                  value-type="YYYYMMDD"
                  default-value="1990-01-01"
                  format="MM-DD-YYYY"
                  placeholder="MM-DD-YYYY"
                  input-class="form-control"
                />
              </div>
            </div>

            <!-- gender -->
            <div class="form-group mb-2">
              <label>Gender</label>
              <div class="input-group input-group-merge">
                <multiselect
                  v-model="form.gender"
                  :options="genderTypes"
                  track-by="key"
                  label="label"
                  :multiple="false"
                  :allow-empty="false"
                  :maxHeight="240"
                  placeholder="Select Gender"
                  class="w-100"
                  :class="{ readonly: !isEdit }"
                />
              </div>
            </div>

            <!-- facility_name -->
            <div class="form-group mb-0">
              <label for="user-facility_name"
                >Facility Name
                <span class="text-muted">(if applicable)</span></label
              >
              <div class="input-group input-group-merge">
                <input
                  v-model="form.facility_name"
                  id="user-facility_name"
                  class="form-control"
                  placeholder="Enter Facility Name"
                  :readonly="!isEdit"
                  :class="{
                    'is-invalid': submitted && $v.form.facility_name.$error,
                  }"
                />
                <div
                  v-if="submitted && $v.form.facility_name.$error"
                  class="invalid-feedback"
                >
                  <div v-if="!$v.form.facility_name.maxLength">
                    Facility Name max 30
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div class="col-md-6 col-xl-8 mb-3 mb-md-0">
        <div class="card card h-100 mb-0">
          <div class="card-body">
            <div class="row">
              <div class="col-md-12 col-xl-6">
                <!-- first_name -->
                <div class="form-group mb-2">
                  <label for="user-first_name">First Name</label>
                  <div class="input-group input-group-merge">
                    <input
                      v-model="form.first_name"
                      id="user-first_name"
                      class="form-control"
                      placeholder="Enter First Name"
                      :readonly="!isEdit"
                      :class="{
                        'is-invalid': submitted && $v.form.first_name.$error,
                      }"
                    />
                    <div
                      v-if="submitted && $v.form.first_name.$error"
                      class="invalid-feedback"
                    >
                      <div v-if="!$v.form.first_name.maxLength">
                        First Name max 30
                      </div>
                    </div>
                  </div>
                </div>

                <!-- second_name -->
                <div class="form-group mb-2">
                  <label for="user-second_name">Middle Name</label>
                  <div class="input-group input-group-merge">
                    <input
                      v-model="form.second_name"
                      id="user-second_name"
                      class="form-control"
                      placeholder="Enter middle name"
                      :readonly="!isEdit"
                      :class="{
                        'is-invalid': submitted && $v.form.second_name.$error,
                      }"
                    />
                    <div
                      v-if="submitted && $v.form.second_name.$error"
                      class="invalid-feedback"
                    >
                      <div v-if="!$v.form.second_name.maxLength">
                        Middle Name max 30
                      </div>
                    </div>
                  </div>
                </div>

                <!-- last_name -->
                <div class="form-group mb-2">
                  <label for="user-last_name">Last Name</label>
                  <div class="input-group input-group-merge">
                    <input
                      v-model="form.last_name"
                      id="user-last_name"
                      class="form-control"
                      placeholder="Enter last name"
                      :readonly="!isEdit"
                      :class="{
                        'is-invalid': submitted && $v.form.last_name.$error,
                      }"
                    />
                    <div
                      v-if="submitted && $v.form.last_name.$error"
                      class="invalid-feedback"
                    >
                      <div v-if="!$v.form.last_name.maxLength">
                        Last Name max 30
                      </div>
                    </div>
                  </div>
                </div>

                <div class="form-group mb-0">
                  <label for="user-email">Email</label>
                  <input
                    class="form-control"
                    v-model="form.email"
                    type="email"
                    placeholder="Enter email"
                    id="user-email"
                    :readonly="!isEdit"
                    :class="{ 'is-invalid': submitted && $v.form.email.$error }"
                  />
                  <div
                    v-if="submitted && $v.form.email.$error"
                    class="invalid-feedback"
                  >
                    <span v-if="!$v.form.email.email">Email is invalid</span>
                  </div>
                </div>
              </div>
              <div class="col-md-12 col-xl-6">
                <!-- address -->
                <div class="form-group mb-2">
                  <label for="user-address">Address</label>
                  <div class="input-group input-group-merge">
                    <input
                      v-model="form.address"
                      id="user-address"
                      class="form-control"
                      placeholder="Enter Address"
                      :readonly="!isEdit"
                      :class="{
                        'is-invalid': submitted && $v.form.address.$error,
                      }"
                    />
                    <div
                      v-if="submitted && $v.form.address.$error"
                      class="invalid-feedback"
                    >
                      <div v-if="!$v.form.address.maxLength">
                        Address max 30
                      </div>
                    </div>
                  </div>
                </div>

                <div class="form-group mb-2">
                  <label>City</label>
                  <div
                    class="input-group input-group-merge input-with-control-ico"
                    :class="{ readonly: !isEdit }"
                  >
                    <GmapAutocomplete
                      @place_changed="addPlace"
                      :componentRestrictions="componentRestrictions"
                      :selectFirstOnEnter="true"
                      :types="['(cities)']"
                      :setFieldsTo="['address_components']"
                      :value="form.city"
                      ref="user-city"
                      placeholder="Enter City"
                      class="form-control form-autocomplete-place"
                      :disabled="!isEdit"
                    />
                    <span
                      v-if="isEdit && (place || form.city)"
                      @click="resetPlace"
                      class="material-symbols-rounded input-with-control-ico-btn"
                    >
                      close
                    </span>
                  </div>
                </div>

                <div class="form-group mb-2">
                  <label for="user-state">State</label>
                  <div class="input-group input-group-merge">
                    <input
                      v-model="form.state"
                      id="user-state"
                      class="form-control"
                      placeholder="Enter state"
                      readonly
                    />
                  </div>
                </div>

                <div class="form-group mb-0">
                  <label for="user-zipcode">Zip Code</label>
                  <div class="input-group input-group-merge">
                    <input
                      v-model.number="form.zipcode"
                      v-mask="'#####'"
                      placeholder="12345"
                      type="text"
                      id="user-zipcode"
                      class="form-control"
                      :readonly="!isEdit"
                      :class="{
                        'is-invalid': submitted && $v.form.zipcode.$error,
                      }"
                    />
                    <!-- <div class="text-muted w-100">e.g "15112"</div> -->
                    <div
                      v-if="submitted && $v.form.zipcode.$error"
                      class="invalid-feedback"
                    >
                      Zip Code must be equal 5 digit
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- <pre>genderTypes: {{ genderTypes }}</pre> -->
    <!-- <pre>user.login: {{ user.login }}</pre> -->
    <!-- <pre>initForm: {{ initForm }}</pre> -->
    <!-- <pre>form: {{ form }}</pre> -->
  </Layout>
</template>

<script>
import Layout from "@/views/layouts/main";
import { mapGetters } from "vuex";
import { genderTypes } from "@/components/data";
import axios from "axios";
import urls from "@/urls";
import {
  required,
  minLength,
  maxLength,
  email,
} from "vuelidate/lib/validators";
import Multiselect from "vue-multiselect";
import DatePicker from "vue2-datepicker";
import { getCity } from "@/helpers";

export default {
  metaInfo() {
    return {
      title: this.$appConfig.title + " | Personal info",
    };
  },
  components: {
    Layout,
    Multiselect,
    DatePicker,
  },
  data() {
    return {
      msg: {
        has: false,
        type: "",
        text: "",
      },

      componentRestrictions: { country: "us" },

      isEdit: false,
      genderTypes: genderTypes,

      place: "",

      initForm: "",
      form: {
        datebirth: "", // 19901010 = Y-M-D
        gender: "",
        facility_name: "",

        first_name: "",
        second_name: "",
        last_name: "",
        email: "",

        address: "",
        city: "",
        state: "",
        zipcode: "",
      },

      submitted: false,
      trySubmit: false,

      datepickerConfig: {
        formatLocale: {
          firstDayOfWeek: 1,
        },
        monthBeforeYear: false,
      },
    };
  },
  validations() {
    return {
      form: this.formRules,
    };
  },
  computed: {
    ...mapGetters(["user"]),
    formRules() {
      let rules = {};

      rules.facility_name = {
        maxLength: maxLength(30),
      };

      rules.first_name = {
        maxLength: maxLength(30),
      };

      rules.second_name = {
        maxLength: maxLength(30),
      };

      rules.last_name = {
        maxLength: maxLength(30),
      };

      rules.email = {
        email,
      };

      rules.address = {
        maxLength: maxLength(30),
      };

      rules.zipcode = {
        minLength: minLength(5),
        maxLength: maxLength(5),
      };

      return rules;
    },
  },
  created() {
    this.loadUser();
  },
  methods: {
    async loadUser() {
      try {
        const response = await axios({
          method: "get",
          url: urls.URL_USER_PROFILE,
        });
        // console.log("loadUser, response: ", response);

        this.initForm = response.data.user;
        this.setInitForm();
      } catch (error) {
        // console.log("Error: ", error);
        this.msg.has = true;
        this.msg.type = "danger";
        this.msg.text = "loadUser error...";

        if (error.response?.data?.error && error.response?.status) {
          this.msg.text = `Error: ${error.response.status} ${error.response.data.error}`;
        } else if (error.response?.status || error.response?.statusText) {
          this.msg.text = `Error: ${error.response.status} ${error.response.statusText}`;
        }
      }
    },
    setInitForm(user = this.initForm) {
      this.form = {
        datebirth: String(user.datebirth), // 19901010 = Y-M-D
        gender:
          this.genderTypes.find((g) => g.key === user.gender) ||
          this.genderTypes[0],
        facility_name: user.facility_name,
        first_name: user.first_name,
        second_name: user.second_name,
        last_name: user.last_name,
        email: user.email,
        address: user.address,
        city: user.city,
        state: user.state,
        zipcode: user.zipcode || "",
      };
    },
    async saveChanges() {
      this.submitted = true;
      this.msg = {
        has: false,
        type: "",
        text: "",
      };

      this.$v.$touch();

      if (this.$v.$invalid) {
        return;
      } else {
        this.trySubmit = true;

        const formData = {
          datebirth: Number(this.form.datebirth), // 19901010 = Y-M-D
          gender: this.form.gender.key,
          facility_name: this.form.facility_name,
          first_name: this.form.first_name,
          second_name: this.form.second_name,
          last_name: this.form.last_name,
          email: this.form.email,
          address: this.form.address,
          city: this.form.city,
          state: this.form.state,
          zipcode: this.form.zipcode || 0,
        };

        try {
          const response = await axios({
            method: "post",
            url: urls.URL_USER_PROFILE,
            data: { ...formData },
          });
          // console.log("saveChanges, response: ", response);

          this.initForm = response.data.user;

          this.msg.has = true;
          this.msg.type = "success";
          this.msg.text = "Changes save successfully!";
        } catch (error) {
          // console.log("saveChanges, Error: ", error);
          this.msg.has = true;
          this.msg.type = "danger";
          this.msg.text = "Save changes error...";

          if (error.response?.data?.error && error.response?.status) {
            this.msg.text = `Error: ${error.response.status} ${error.response.data.error}`;
          } else if (error.response?.status || error.response?.statusText) {
            this.msg.text = `Error: ${error.response.status} ${error.response.statusText}`;
          }
        } finally {
          this.isEdit = false;
          this.trySubmit = false;
        }
      }
    },
    cancelChanges() {
      this.isEdit = false;
      this.setInitForm();
    },
    addPlace(place) {
      this.place = place;
    },
    resetPlace() {
      this.place = null;
      this.$refs["user-city"].$refs.input.value = "";
    },
  },
  watch: {
    place: {
      handler: function () {
        // get city id - "Bossier City, LA"
        if (this.place) {
          const city = getCity(this.place);

          if (city.name.length) {
            this.form.state = city.name[1];
            this.form.city = city.name.join(", ");
          }
        } else {
          this.form.state = "";
          this.form.city = "";
        }
      },
      deep: true,
    },
  },
};
</script>
