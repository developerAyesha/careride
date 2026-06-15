<template>
  <form action="#" @submit.prevent="handleSubmit">
    <div class="common-modal-headline">
      <h4 class="common-modal-title">
        {{ isNew ? "Add new driver" : "Edit driver" }}
      </h4>
      <span
        class="material-symbols-rounded common-modal-close"
        @click="$emit('onClose')"
      >
        close
      </span>
    </div>

    <hr class="my-3" />

    <b-alert
      :variant="msg.type"
      dismissible
      class="mt-3"
      v-model="msg.has"
      :show="msg.text"
      >{{ msg.text }}</b-alert
    >

    <div class="row">
      <!-- left col -->
      <div class="col-md-6">
        <!-- Phone number fields -->
        <div class="form-group mb-3">
          <label for="driver-login" class="required">Phone Number</label>
          <div class="input-group input-group-merge">
            <input
              v-model="form.login"
              v-mask="'+1 ##########'"
              placeholder="+1 ##########"
              type="text"
              id="driver-login"
              class="form-control"
              @paste="onPhonePaste"
              :readonly="!isNew"
              :class="{
                'is-invalid': submitted && $v.form.login.$error,
              }"
            />
            <!-- <div class="text-muted w-100">e.g "+1 343 554 45 24"</div> -->
            <div
              v-if="submitted && $v.form.login.$error"
              class="invalid-feedback"
            >
              <div
                v-if="
                  !$v.form.login.required ||
                  !$v.form.login.minLength ||
                  !$v.form.login.maxLength
                "
              >
                Phone Number is required
              </div>
            </div>
          </div>
        </div>

        <div class="form-group mb-3">
          <label for="driver-passw" :class="{ required: isNew }"
            >Password</label
          >
          <div class="input-group input-group-merge">
            <input
              v-model="form.passw"
              :type="showPassw ? 'text' : 'password'"
              id="driver-passw"
              class="form-control"
              placeholder="Enter your password"
              :class="{
                'is-invalid': submitted && $v.form.passw.$error,
              }"
            />
            <div
              class="input-group-append"
              @click="showPassw = !showPassw"
              role="button"
            >
              <div class="input-group-text">
                <span v-if="showPassw" class="material-symbols-rounded fz-18"
                  >visibility</span
                >
                <span v-else class="material-symbols-rounded fz-18"
                  >visibility_off</span
                >
              </div>
            </div>
            <div
              v-if="submitted && $v.form.passw.$error"
              class="invalid-feedback"
            >
              <div v-if="isNew && !$v.form.passw.required">
                Password is required
              </div>
              <div v-if="!$v.form.passw.minLength">Passwords min 8</div>
              <div v-if="!$v.form.passw.maxLength">Passwords max 16</div>
              <div v-if="!$v.form.passw.valid">
                Passwords is not valid, must include: A-Z, a-z, 0-9, #?!@$%^&*-
              </div>
            </div>
          </div>
        </div>

        <div class="form-group mb-3">
          <label for="driver-repassw" :class="{ required: isNew }"
            >Confirm Password</label
          >
          <div class="input-group input-group-merge">
            <input
              v-model="form.repassw"
              :type="showRepassw ? 'text' : 'password'"
              id="driver-repassw"
              class="form-control"
              placeholder="Confirm your password"
              :class="{
                'is-invalid': submitted && $v.form.repassw.$error,
              }"
            />
            <div
              class="input-group-append"
              @click="showRepassw = !showRepassw"
              role="button"
            >
              <div class="input-group-text">
                <span v-if="showRepassw" class="material-symbols-rounded fz-18"
                  >visibility</span
                >
                <span v-else class="material-symbols-rounded fz-18"
                  >visibility_off</span
                >
              </div>
            </div>
            <div
              v-if="submitted && $v.form.repassw.$error"
              class="invalid-feedback"
            >
              <div v-if="isNew && !$v.form.repassw.required">
                Confirm Password is required
              </div>
              <div v-if="!$v.form.repassw.sameAsPassword">
                Passwords are not matched
              </div>
            </div>
          </div>
        </div>

        <div class="form-group mb-0">
          <label :class="{ required: isNew }"
            >Driver License
            <span class="text-muted"
              >(jpeg, png, pdf; size limit: {{ fileSizeMaxMb }}MB)</span
            ></label
          >

          <div
            class="input-group input-group-merge custom-input-file"
            :class="{
              'is-invalid': isNew && submitted && $v.form.file.$error,
            }"
          >
            <input
              id="driver-file"
              ref="file"
              type="file"
              class="form-control custom-input-file-input"
              @change="fileChanged"
              accept="image/jpeg, image/png, application/pdf"
            />
            <div
              v-if="form.file && form.file.length"
              class="custom-input-file-text"
            >
              <template v-if="!form.file[0].path">
                <span
                  class="material-symbols-rounded custom-input-file-text-ico mr-1"
                >
                  picture_as_pdf </span
                >{{ form.file[0].name }}
              </template>
              <a
                v-else
                :href="form.file[0].name"
                @click.prevent="getFile(form.file[0])"
              >
                <span
                  class="material-symbols-rounded custom-input-file-text-ico mr-1"
                >
                  picture_as_pdf </span
                >{{ form.file[0].name }}
              </a>

              <span
                @click="resetFile"
                class="material-symbols-rounded custom-input-file-reset"
                title="Reset file"
              >
                cancel
              </span>
            </div>
            <label v-else class="custom-input-file-label" for="driver-file"
              >Upload
              <span
                class="material-symbols-rounded custom-input-file-label-ico"
              >
                upload
              </span></label
            >
          </div>

          <div
            v-if="isNew && submitted && $v.form.file.$error"
            class="invalid-feedback"
          >
            <div v-if="!$v.form.file.required">Driver License is required</div>
          </div>

          <b-alert v-model="fileAlert" variant="danger" class="mt-1 mb-0">
            File size too big, limit: {{ fileSizeMaxMb }}MB
          </b-alert>
        </div>
      </div>
      <!-- right col -->
      <div class="col-md-6">
        <div class="form-group mb-3">
          <label for="driver-first_name" class="required">First Name</label>
          <div class="input-group input-group-merge">
            <input
              v-model="form.first_name"
              id="driver-first_name"
              class="form-control"
              placeholder="Enter First Name"
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
              <div v-if="!$v.form.first_name.minLength">First name min 1</div>
              <div v-if="!$v.form.first_name.maxLength">First name max 30</div>
            </div>
          </div>
        </div>

        <div class="form-group mb-3">
          <label for="driver-second_name">Middle Name</label>
          <div class="input-group input-group-merge">
            <input
              v-model="form.second_name"
              id="driver-second_name"
              class="form-control"
              placeholder="Enter Middle Name"
              :class="{
                'is-invalid': submitted && $v.form.second_name.$error,
              }"
            />
            <div
              v-if="submitted && $v.form.second_name.$error"
              class="invalid-feedback"
            >
              Middle Name max 30
            </div>
          </div>
        </div>

        <div class="form-group mb-3">
          <label for="driver-last_name">Last Name</label>
          <div class="input-group input-group-merge">
            <input
              v-model="form.last_name"
              id="driver-last_name"
              class="form-control"
              placeholder="Enter Last Name"
              :class="{
                'is-invalid': submitted && $v.form.last_name.$error,
              }"
            />
            <div
              v-if="submitted && $v.form.last_name.$error"
              class="invalid-feedback"
            >
              Last Name max 30
            </div>
          </div>
        </div>
      </div>
    </div>

    <hr class="mt-2 mb-1" />

    <div class="mt-3 text-center text-md-left">
      <button class="btn btn-primary" type="submit" :disabled="trySubmit">
        {{ isNew ? "Add driver" : "Save changes" }}
      </button>
    </div>

    <!-- <pre>driver: {{ driver }}</pre> -->
    <!-- <pre>form: {{ form }}</pre> -->
  </form>
</template>

<script>
import axios from "axios";
import urls from "@/urls";
import {
  required,
  minLength,
  maxLength,
  sameAs,
  requiredIf,
} from "vuelidate/lib/validators";
import { mapActions } from "vuex";
import { pasteAsLoginDisplay } from "@/helpers/phone";

export default {
  props: {
    driver: {
      type: Object,
      default: () => {},
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
        passw: "", // not req if !isNew
        repassw: "", // not req if !isNew
        first_name: "",
        second_name: "", // opt
        last_name: "", // opt
        file: "", // opt
      },

      fileAlert: false,

      showPassw: false,
      showRepassw: false,

      submitted: false,
      trySubmit: false,
    };
  },
  validations() {
    return {
      form: this.formRules,
    };
  },
  created() {
    this.initForm();
  },
  computed: {
    isNew() {
      return !this.driver?.id;
    },
    fileSizeMaxMb() {
      return process.env.VUE_APP_FILE_DRIVER_LICENSE_MAX_SIZE;
    },
    formRules() {
      let rules = {};

      rules.login = {
        required,
        minLength: minLength(13),
        maxLength: maxLength(13),
      };

      rules.first_name = {
        required,
        minLength: minLength(1),
        maxLength: maxLength(30),
      };

      rules.second_name = {
        maxLength: maxLength(30),
      };

      rules.last_name = {
        maxLength: maxLength(30),
      };

      if (this.isNew) {
        rules.passw = {
          required,
          valid: function (value) {
            const containsUppercase = /[A-Z]/.test(value);
            const containsLowercase = /[a-z]/.test(value);
            const containsNumber = /[0-9]/.test(value);
            const containsSpecial = /[#?!@$%^&*-]/.test(value);
            return (
              containsUppercase &&
              containsLowercase &&
              containsNumber &&
              containsSpecial
            );
          },
          minLength: minLength(8),
          maxLength: maxLength(16),
        };

        rules.repassw = {
          required,
          sameAsPassword: sameAs("passw"),
        };

        rules.file = {
          required,
        };
      } else {
        rules.passw = {
          minLength: minLength(8),
          maxLength: maxLength(16),
        };

        rules.repassw = {
          sameAsPassword: sameAs("passw"),
        };
      }

      return rules;
    },
  },
  methods: {
    ...mapActions(["getFile"]),
    onPhonePaste(evt) {
      const formatted = pasteAsLoginDisplay(evt);
      if (formatted) this.form.login = formatted;
    },
    initForm() {
      if (!this.isNew) {
        this.form = {
          login: String(this.driver.login).replace(/^\D+/g, ""),
          first_name: this.driver.first_name,
          second_name: this.driver.second_name,
          last_name: this.driver.last_name,
          file: this.driver.license_files,
        };
      }
    },
    resetFile(e) {
      this.$refs.file.value = null;
      this.form.file = e.target.files;
    },
    fileChanged(e) {
      // check size, set to form.file
      const max = this.fileSizeMaxMb * 1048576; // 1MB = 1048576 Bytes

      if (e.target.files[0]?.size > max) {
        this.fileAlert = true;
        this.form.file = "";
      } else {
        this.fileAlert = false;
        this.form.file = e.target.files;
      }
    },
    async handleSubmit() {
      this.submitted = true;
      this.msg = {
        has: false,
        type: "",
        text: "",
      };

      this.$v.$touch();

      if (this.isNew && this.fileAlert) {
        return;
      }

      if (this.$v.$invalid) {
        return;
      } else {
        this.trySubmit = true;
        this.errorMsg = null;

        const formData = new FormData();

        // common fields
        formData.append("first_name", this.form.first_name);
        if (this.form.second_name) {
          formData.append("second_name", this.form.second_name);
        }
        if (this.form.last_name) {
          formData.append("last_name", this.form.last_name);
        }
        if (this.form.file) {
          // formData.append("filelicense", this.form.file);
          // only one file
          formData.append("filelicense", this.form.file[0]);
        }
        if (this.form.passw) {
          formData.append("passw", this.form.passw);
        }

        let method = "post";
        let defaultErr = "Error on adding driver ...";
        let defaultMsg = "Driver successfully added";

        if (this.isNew) {
          // Add new driver
          formData.append("login", this.form.login);
          formData.append("vendor_id", this.driver.vendor_id);
        } else {
          // Edit driver
          formData.append("id", this.driver.id);

          method = "put";
          defaultErr = "Error on editing driver ...";
          defaultMsg = "Driver successfully edited";
        }

        // Display the key/value pairs ###debug
        // for (var pair of formData.entries()) {
        //   console.log(pair[0] + " :", pair[1]);
        // }

        try {
          await axios({
            method: method,
            url: urls.URL_VENDOR_DRIVER,
            data: formData,
            headers: {
              "content-type": "multipart/form-data",
            },
          });

          this.msg.has = true;
          this.msg.type = "success";
          this.msg.text = defaultMsg;

          this.inprogress = false;

          this.$emit("onSubmit");
        } catch (error) {
          console.log("Error: ", error);

          this.msg.has = true;
          this.msg.type = "danger";
          this.msg.text =
            error.message && error.response?.data?.error
              ? `${error.message}: ${error.response.data.error}`
              : defaultErr;

          this.inprogress = false;
        } finally {
          this.trySubmit = false;
        }
      }
    },
  },
  watch: {},
};
</script>
