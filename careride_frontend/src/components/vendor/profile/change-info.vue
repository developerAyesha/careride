<template>
  <div>
    <h3 class="section-title my-3">
      The changes you make and save in that block will be sent to the
      administrator for review. This may take some time before they are applied.
    </h3>

    <b-alert
      :variant="msg.type"
      dismissible
      class="mt-3"
      v-model="msg.has"
      :show="msg.text"
      >{{ msg.text }}</b-alert
    >

    <form action="#" @submit.prevent="submitForm" novalidate>
      <div class="row mb-3">
        <div class="col-md-6 col-xl-4 mb-3 mb-md-0">
          <div class="card">
            <div class="card-body">
              <!-- Vendor info fields -->
              <div class="form-group mb-2">
                <label for="vendor-profile-login"
                  >Phone Number</label
                >
                <div class="input-group input-group-merge">
                  <input
                    v-model="form.login"
                    readonly
                    type="text"
                    id="vendor-profile-login"
                    class="form-control"
                  />
                </div>
              </div>

              <div class="form-group mb-2">
                <label for="vendor-profile-email">Email</label>
                <input
                  class="form-control"
                  v-model="form.email"
                  :readonly="!isEdit"
                  type="email"
                  placeholder="Enter email"
                  id="vendor-profile-email"
                  :class="{
                    'is-invalid': submitted && $v.form.email.$error,
                  }"
                />
                <div
                  v-if="submitted && $v.form.email.$error"
                  class="invalid-feedback"
                >
                  <span v-if="!$v.form.email.required"
                    >Email is required field</span
                  >
                  <span v-if="!$v.form.email.email">Email is invalid</span>
                </div>
              </div>
            </div>
          </div>

          <h3 class="header-title">License</h3>
          <div class="card mb-0">
            <div class="card-body">
              <div class="form-group mb-1">
                <div v-if="loadingFile" class="loader-box loader-box-files">
                  <b-spinner variant="primary" />
                </div>
                <template v-else>
                  <div class="text-muted">
                    Please, upload Business license and Insurance<br />
                    Format: jpeg, png, pdf. Size limit: 2MB. MAX 5 files
                  </div>

                  <div
                    v-for="file of license_files"
                    :key="file.id"
                    class="input-group input-group-merge custom-input-file mt-1"
                  >
                    <div class="custom-input-file-text">
                      <a
                        :href="file.name"
                        @click.prevent="getFile(file)"
                        target="_blank"
                        ><span
                          class="material-symbols-rounded custom-input-file-text-ico"
                        >
                          description </span
                        >{{ file.name }}</a
                      >
                      <span
                        v-if="isEdit && license_files.length > 1"
                        @click="deleteFile(file.id)"
                        class="material-symbols-rounded custom-input-file-reset"
                        title="Delete file"
                      >
                        cancel
                      </span>
                    </div>
                  </div>

                  <div
                    v-if="isEdit && maxFiles - license_files.length"
                    class="input-group input-group-merge custom-input-file"
                  >
                    <input
                      type="file"
                      multiple
                      id="vendor-profile-file"
                      class="form-control custom-input-file-input"
                      ref="uploaded_files"
                      @change="fileChanged"
                      accept="image/jpeg, image/png, application/pdf"
                    />
                    <label
                      class="custom-input-file-label"
                      for="vendor-profile-file"
                      >Upload
                      <span
                        class="material-symbols-rounded custom-input-file-label-ico"
                      >
                        upload
                      </span></label
                    >
                  </div>
                </template>

                <b-alert
                  :show="Boolean(fileAlert)"
                  variant="danger"
                  class="mt-1 mb-0"
                >
                  {{ fileAlert }}
                </b-alert>
              </div>
            </div>
          </div>
        </div>

        <div class="col-md-6 col-xl-8 mb-3 mb-md-0">
          <div class="card mb-0">
            <div class="card-body">
              <div class="row">
                <div class="col-md-12 col-xl-6">
                  <!-- Company info fields -->
                  <div class="form-group mb-2">
                    <label for="vendor-profile-company_name"
                      >Company Name</label
                    >
                    <div class="input-group input-group-merge">
                      <input
                        v-model="form.company_name"
                        :readonly="!isEdit"
                        id="vendor-profile-company_name"
                        class="form-control"
                        placeholder="Company Name"
                        :class="{
                          'is-invalid':
                            submitted && $v.form.company_name.$error,
                        }"
                      />
                      <div
                        v-if="submitted && $v.form.company_name.$error"
                        class="invalid-feedback"
                      >
                        <div v-if="!$v.form.company_name.required">
                          Company Name is required
                        </div>
                        <div v-if="!$v.form.company_name.minLength">
                          Company Name min 1
                        </div>
                        <div v-if="!$v.form.company_name.maxLength">
                          Company Name max 30
                        </div>
                      </div>
                    </div>
                  </div>

                  <div class="form-group mb-2">
                    <label for="vendor-profile-first_name"
                      >First Name</label
                    >
                    <div class="input-group input-group-merge">
                      <input
                        v-model="form.first_name"
                        :readonly="!isEdit"
                        id="vendor-profile-first_name"
                        class="form-control"
                        placeholder="First Name"
                        :class="{
                          'is-invalid': submitted && $v.form.first_name.$error,
                        }"
                      />
                      <div
                        v-if="submitted && $v.form.first_name.$error"
                        class="invalid-feedback"
                      >
                        <div v-if="!$v.form.first_name.required">
                          First Name is required
                        </div>
                        <div v-if="!$v.form.first_name.minLength">
                          First Name min 1
                        </div>
                        <div v-if="!$v.form.first_name.maxLength">
                          First Name max 20
                        </div>
                      </div>
                    </div>
                  </div>

                  <div class="form-group mb-2">
                    <label for="vendor-profile-second_name"
                      >Middle Name</label
                    >
                    <div class="input-group input-group-merge">
                      <input
                        v-model="form.second_name"
                        :readonly="!isEdit"
                        id="vendor-profile-second_name"
                        class="form-control"
                        placeholder="Middle Name"
                      />
                    </div>
                  </div>

                  <div class="form-group mb-2 mb-xl-0">
                    <label for="vendor-profile-last_name"
                      >Last Name</label
                    >
                    <div class="input-group input-group-merge">
                      <input
                        v-model="form.last_name"
                        :readonly="!isEdit"
                        id="vendor-profile-last_name"
                        class="form-control"
                        placeholder="Last Name"
                        :class="{
                          'is-invalid': submitted && $v.form.last_name.$error,
                        }"
                      />
                      <div
                        v-if="submitted && $v.form.last_name.$error"
                        class="invalid-feedback"
                      >
                        <div v-if="!$v.form.last_name.required">
                          Last Name is required
                        </div>
                        <div v-if="!$v.form.last_name.minLength">
                          Last Name min 1
                        </div>
                        <div v-if="!$v.form.last_name.maxLength">
                          Last Name max 20
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                <div class="col-md-12 col-xl-6">
                  <!-- Address fields  -->
                  <div class="form-group mb-2">
                    <label for="vendor-profile-address">Address</label>
                    <div class="input-group input-group-merge">
                      <input
                        v-model="form.address"
                        :readonly="!isEdit"
                        id="vendor-profile-address"
                        class="form-control"
                        placeholder="Address"
                        :class="{
                          'is-invalid': submitted && $v.form.address.$error,
                        }"
                      />
                      <div
                        v-if="submitted && $v.form.address.$error"
                        class="invalid-feedback"
                      >
                        <div v-if="!$v.form.address.required">
                          Address is required
                        </div>
                        <div v-if="!$v.form.address.minLength">
                          Address min 1
                        </div>
                        <div v-if="!$v.form.address.maxLength">
                          Address max 32
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
                        :value="form.city"
                        :disabled="!isEdit"
                        :componentRestrictions="componentRestrictions"
                        :selectFirstOnEnter="true"
                        :types="['(cities)']"
                        :setFieldsTo="['address_components']"
                        ref="vendor-profile-city"
                        placeholder="Enter city"
                        class="form-control form-autocomplete-place"
                        :class="{
                          'is-invalid': submitted && $v.form.city.$error,
                        }"
                      />
                      <span
                        v-if="place"
                        @click="resetPlace"
                        class="material-symbols-rounded input-with-control-ico-btn"
                      >
                        close
                      </span>
                    </div>
                    <div
                      v-if="submitted && $v.form.city.$error"
                      class="invalid-feedback"
                      :class="{
                        'd-block': submitted && $v.form.city.$error,
                      }"
                    >
                      <div v-if="!$v.form.city.required">City is required</div>
                    </div>
                  </div>

                  <div class="form-group mb-2">
                    <label for="vendor-profile-state">State</label>
                    <div class="input-group input-group-merge">
                      <input
                        v-model="form.state"
                        id="vendor-profile-state"
                        class="form-control"
                        placeholder="Enter state"
                        readonly
                      />
                    </div>
                  </div>

                  <div class="form-group mb-0">
                    <label for="vendor-profile-zipcode">Zip Code</label>
                    <div class="input-group input-group-merge">
                      <input
                        v-model="form.zipcode"
                        :readonly="!isEdit"
                        v-mask="'#####'"
                        placeholder="12345"
                        type="text"
                        id="vendor-profile-zipcode"
                        class="form-control"
                        :class="{
                          'is-invalid': submitted && $v.form.zipcode.$error,
                        }"
                      />
                      <!-- <div class="text-muted w-100">e.g "15112"</div> -->
                      <div
                        v-if="submitted && $v.form.zipcode.$error"
                        class="invalid-feedback"
                      >
                        <div v-if="!$v.form.zipcode.required">
                          Zip Code is required, 5 digit
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </form>

    <!-- <pre>uploaded_files: {{ uploaded_files }}</pre> -->
    <!-- <pre>license_files: {{ license_files }}</pre> -->
    <!-- <pre>isEdit: {{ isEdit }}</pre> -->
    <!-- <pre>vendor: {{ vendor }}</pre> -->
  </div>
</template>

<script>
import axios from "axios";
import urls from "@/urls";
import {
  required,
  minLength,
  maxLength,
  sameAs,
  email,
} from "vuelidate/lib/validators";
import { mapState, mapGetters, mapActions } from "vuex";
import { getCity } from "@/helpers";
import createNumberMask from "text-mask-addons/dist/createNumberMask";

export default {
  props: {
    vendor: {
      type: Object,
      default: () => {},
    },
    isEdit: {
      type: Boolean,
      default: false,
    },
  },
  components: {},
  data() {
    return {
      msg: {
        has: false,
        type: "",
        text: "",
      },

      form: {
        login: "",
        email: "",
        company_name: "",
        first_name: "",
        second_name: "", // opt
        last_name: "",
        address: "",
        city: "",
        state: "", // opt
        zipcode: "",
      },

      license_files: [],
      uploaded_files: [],

      componentRestrictions: { country: "us" },

      currencyMask: createNumberMask({
        prefix: "$ ",
        allowDecimal: true,
        includeThousandsSeparator: false,
        allowNegative: false,
      }),

      place: "",

      maxFiles: 5,
      fileAlert: "",
      loadingFile: false,

      submitted: false,
      trySubmit: false,
    };
  },
  validations() {
    return {
      form: {
        email: {
          required,
          email,
        },
        company_name: {
          required,
          minLength: minLength(1),
          maxLength: maxLength(30),
        },
        first_name: {
          required,
          minLength: minLength(1),
          maxLength: maxLength(20),
        },
        last_name: {
          required,
          minLength: minLength(1),
          maxLength: maxLength(20),
        },
        address: {
          required,
          minLength: minLength(1),
          maxLength: maxLength(32),
        },
        city: {
          required,
        },
        zipcode: {
          required,
          minLength: minLength(5),
          maxLength: maxLength(5),
        },
      },
    };
  },
  created() {
    this.initForm();
  },
  computed: {},
  methods: {
    ...mapActions(["getFile"]),
    initForm(user = this.vendor) {
      if (user) {
        this.form = {
          login: String(user.login).replace(/^\D+/g, ""),
          email: user.email,
          company_name: user.company_name,
          first_name: user.first_name,
          second_name: user.second_name,
          last_name: user.last_name,
          address: user.address,
          city: user.city,
          state: user.state,
          zipcode: user.zipcode || "",
        };

        this.license_files = user.license_files;
      }
    },
    addPlace(place) {
      this.place = place;
    },
    resetPlace() {
      this.place = null;
      this.$refs["vendor-profile-city"].$refs.input.value = "";
    },
    fileChanged(e) {
      if (!e.target.files) {
        return;
      }

      this.uploaded_files = Array.from(e.target.files);

      // console.log(e.target.files);
      // 1 check count, max 5
      if (e.target.files.length + this.license_files.length > 5) {
        this.fileAlert = "Max 5 files";
        this.$refs.uploaded_files.value = null;
        this.uploaded_files = [];
        return;
      } else {
        this.fileAlert = "";
      }

      // 2 check size, set to step1.file
      const max = this.fileSizeMaxMb * 1048576; // 1MB = 1048576 Bytes

      let size = 0;
      this.license_files.map((f) => (size += f.size));
      // console.log("size: ", size);

      if (size > max) {
        this.fileAlert = `File size too big, limit: ${this.fileSizeMaxMb}Mb`;
        this.$refs.uploaded_files.value = null;
        this.uploaded_files = [];
      } else {
        this.fileAlert = "";
        this.uploadFiles();
      }
    },
    async deleteFile(id) {
      // console.log("remove file, id: ", id);
      this.loadingFile = true;
      this.fileAlert = "";

      const formData = new FormData();
      formData.append("todelete", id);

      try {
        await axios({
          method: "post",
          url: urls.URL_VENDOR_LICENSE_FILE,
          data: formData,
          headers: {
            "content-type": "multipart/form-data",
          },
        });
      } catch (error) {
        console.log("Error: ", error);
        this.fileAlert = "Delete file error ...";

        if (error.response?.status) {
          if (error.response.statusText) {
            this.fileAlert = `Error: ${error.response.status} ${error.response.statusText}`;
          } else if (error.response.data?.detail) {
            this.fileAlert = `Error: ${error.response.status} ${error.response.data.detail}`;
          } else if (error.response.data?.error) {
            this.fileAlert = `Error: ${error.response.status} ${error.response.data.error}`;
          }
        }
      } finally {
        this.loadingFile = false;
        this.fileAlert = "";
        this.$emit("updated", "files");
      }
    },
    async uploadFiles() {
      // console.log("remove file, id: ", id);
      this.loadingFile = true;
      this.fileAlert = "";

      const formData = new FormData();
      this.uploaded_files.map((file) => {
        formData.append("filelicense", file);
      });

      try {
        await axios({
          method: "post",
          url: urls.URL_VENDOR_LICENSE_FILE,
          data: formData,
          headers: {
            "content-type": "multipart/form-data",
          },
        });
      } catch (error) {
        console.log("Error: ", error);
        this.fileAlert = "Upload files error ...";

        if (error.response?.status) {
          if (error.response.statusText) {
            this.fileAlert = `Error: ${error.response.status} ${error.response.statusText}`;
          } else if (error.response.data?.detail) {
            this.fileAlert = `Error: ${error.response.status} ${error.response.data.detail}`;
          } else if (error.response.data?.error) {
            this.fileAlert = `Error: ${error.response.status} ${error.response.data.error}`;
          }
        }
      } finally {
        this.loadingFile = false;
        this.fileAlert = "";
        this.uploaded_files = [];
        this.$emit("updated", "files");
      }
    },
    async submitForm() {
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
          id: this.vendor.id,
          email: this.form.email,
          company_name: this.form.company_name,
          first_name: this.form.first_name,
          second_name: this.form.second_name,
          last_name: this.form.last_name,
          address: this.form.address,
          city: this.form.city,
          state: this.form.state,
          zipcode: this.form.zipcode || 0,
        };
        // console.log("child, send req and emmit response, formData: ", formData);

        try {
          await axios({
            method: "post",
            url: urls.URL_VENDOR_PROFILE,
            data: formData,
          });

          // this.msg.has = true;
          // this.msg.type = "success";
          // this.msg.text = "Info changes saved ...";
          this.$emit("updated");
        } catch (error) {
          console.log("Error: ", error);

          this.msg.has = true;
          this.msg.type = "danger";
          this.msg.text = "Info changes saved error ...";

          if (error.response?.status) {
            if (error.response.statusText) {
              this.msg.text = `Error: ${error.response.status} ${error.response.statusText}`;
            } else if (error.response.data?.detail) {
              this.msg.text = `Error: ${error.response.status} ${error.response.data.detail}`;
            } else if (error.response.data?.error) {
              this.msg.text = `Error: ${error.response.status} ${error.response.data.error}`;
            }
          }
        } finally {
          this.trySubmit = false;
        }
      }
    },
  },
  watch: {
    vendor: {
      handler: function () {
        this.initForm();
      },
      deep: true,
    },
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
<style lang="scss" scoped>
.loader-box-files {
  height: 64px;
}
</style>
