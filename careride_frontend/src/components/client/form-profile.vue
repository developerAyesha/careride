<template>
  <form action="#" @submit.prevent="handleSubmit">
    <div class="common-modal-headline">
      <h4 class="common-modal-title">
        {{ isNew ? "Add new profile" : "Edit profile" }}
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

    <div class="form-group mb-2">
      <label for="profile-title">Title</label>
      <div class="input-group input-group-merge">
        <input
          v-model="form.title"
          type="text"
          id="profile-title"
          class="form-control"
          placeholder="Enter ride profile title"
          :class="{
            'is-invalid': submitted && $v.form.title.$error,
          }"
        />
        <!-- <div class="text-muted w-100">e.g "+1 343 554 45 24"</div> -->
        <div v-if="submitted && $v.form.title.$error" class="invalid-feedback">
          <div v-if="!$v.form.title.required">Title is required</div>
          <div v-if="!$v.form.title.minLength">Title min 1</div>
          <div v-if="!$v.form.title.maxLength">Title max 30</div>
        </div>
      </div>
    </div>

    <div class="row">
      <div class="col-lg-6">
        <div class="form-group mb-2 form-group-radios">
          <label>Who will be riding</label>
          <div class="input-group mt-2">
            <b-form-radio
              v-model="form.whoride"
              name="whoride-radios"
              :value="1"
              class="mr-3"
              >Me</b-form-radio
            >
            <b-form-radio
              v-model="form.whoride"
              name="whoride-radios"
              :value="2"
              >Someone else</b-form-radio
            >
          </div>
        </div>

        <div class="form-group mb-2">
          <label for="profile-cartype">Car Type</label>
          <div class="input-group input-group-merge">
            <multiselect
              v-model="form.cartype"
              :options="carTypes"
              track-by="id"
              label="label"
              :multiple="false"
              :allow-empty="false"
              :maxHeight="240"
              tag-placeholder=""
              placeholder=""
              class="w-100"
              :class="{
                'is-invalid': submitted && $v.form.cartype.$error,
              }"
            />
            <div
              v-if="submitted && $v.form.cartype.$error"
              class="invalid-feedback"
            >
              <div v-if="!$v.form.cartype.required">Car Type is required</div>
            </div>
          </div>
        </div>

        <div class="form-group mb-2">
          <label for="profile-escort">Accompanied By (optional)</label>
          <div class="input-group input-group-merge">
            <multiselect
              v-model="form.escort"
              :options="escortTypes"
              track-by="id"
              label="label"
              :multiple="false"
              :allow-empty="false"
              :maxHeight="240"
              tag-placeholder=""
              placeholder=""
              class="w-100"
            />
          </div>
        </div>
      </div>
      <div class="col-lg-6">
        <div class="form-group mb-2">
          <label for="profile-contact">Contact Number (optional)</label>
          <input
            class="form-control"
            v-model="form.contact"
            v-mask="'+1 ##########'"
            placeholder="+1 ##########"
            id="profile-contact"
            :class="{ 'is-invalid': submitted && $v.form.contact.$error }"
          />
          <div
            v-if="submitted && $v.form.contact.$error"
            class="invalid-feedback"
          >
            Contact Number not valid
          </div>
        </div>

        <div class="row">
          <div class="col-6">
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
                  placeholder="Select gender"
                  class="w-100"
                />
              </div>
            </div>
          </div>
          <div class="col-6">
            <div class="form-group mb-2">
              <label>Date of birth</label>
              <div class="input-group input-group-merge">
                <date-picker
                  v-model="form.datebirth"
                  :lang="datepickerConfig"
                  value-type="YYYYMMDD"
                  default-value="1990-01-01"
                  format="MM-DD-YYYY"
                  placeholder="MM-DD-YYYY"
                  input-class="form-control"
                />
              </div>
            </div>
          </div>
        </div>

        <div class="row">
          <div class="col-6">
            <div class="form-group mb-2">
              <label for="profile-weight">Weight (lb)</label>
              <div class="input-group input-group-merge">
                <input
                  v-model.number="form.weight"
                  v-mask="wMask"
                  placeholder="Enter weight"
                  type="text"
                  id="profile-weight"
                  class="form-control"
                  :class="{ 'is-invalid': submitted && $v.form.weight.$error }"
                />
                <div
                  v-if="submitted && $v.form.weight.$error"
                  class="invalid-feedback"
                >
                  Weight is required, between 1 - 1500 lb
                </div>
              </div>
            </div>
          </div>
          <div class="col-6">
            <div class="row no-gutters">
              <div class="col-6">
                <div class="form-group mb-2 mr-1">
                  <label for="profile-height_f">Height, ft</label>
                  <div class="input-group input-group-merge">
                    <input
                      v-model.number="form.height_f"
                      v-mask="'#'"
                      placeholder=""
                      type="text"
                      id="profile-height_f"
                      class="form-control"
                      :class="{
                        'is-invalid': submitted && $v.form.height_f.$error,
                      }"
                    />
                    <div
                      v-if="submitted && $v.form.height_f.$error"
                      class="invalid-feedback"
                    >
                      Height is required, between 1 - 9 ft
                    </div>
                  </div>
                </div>
              </div>
              <div class="col-6">
                <div class="form-group mb-2 ml-1">
                  <label for="profile-height_i">inches</label>
                  <div class="input-group input-group-merge">
                    <input
                      v-model.number="form.height_i"
                      v-mask="'##'"
                      placeholder=""
                      type="text"
                      id="profile-height_i"
                      class="form-control"
                      :class="{
                        'is-invalid': submitted && $v.form.height_i.$error,
                      }"
                    />
                    <div
                      v-if="submitted && $v.form.height_i.$error"
                      class="invalid-feedback"
                    >
                      Height between 0 - 11 inches
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div class="form-group mb-2">
          <label for="profile-instruction">Special Instructions</label>
          <div class="input-group input-group-merge">
            <input
              v-model="form.instruction"
              id="profile-instruction"
              class="form-control"
              placeholder="Preferred pickup time"
              maxlength="60"
              :class="{
                'is-invalid': submitted && $v.form.instruction.$error,
              }"
            />
            <div
              v-if="submitted && $v.form.instruction.$error"
              class="invalid-feedback"
            >
              <div v-if="!$v.form.instruction.required">
                Special instructions is required
              </div>
              <div v-if="!$v.form.instruction.maxLength">
                Special Instructions max 60 symbols
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <hr class="mt-2 mb-1" />

    <div class="mt-3 text-center text-md-left">
      <button class="btn btn-primary" type="submit" :disabled="trySubmit">
        {{ isNew ? "Add profile" : "Save changes" }}
      </button>
    </div>

    <!-- <pre>profile: {{ profile }}</pre> -->
    <!-- <pre>form: {{ form }}</pre> -->
  </form>
</template>

<script>
import {
  genderTypes,
  escortTypes,
  carTypes,
  mapFields,
} from "@/components/data";
import Multiselect from "vue-multiselect";
import DatePicker from "vue2-datepicker";
import axios from "axios";
import urls from "@/urls";
import {
  required,
  minLength,
  maxLength,
  between,
} from "vuelidate/lib/validators";
import createNumberMask from "text-mask-addons/dist/createNumberMask";

export default {
  props: {
    profile: {
      type: Object,
      default: () => {},
    },
  },
  components: {
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

      datepickerConfig: {
        formatLocale: {
          firstDayOfWeek: 1,
        },
        monthBeforeYear: false,
      },

      genderTypes: genderTypes,
      escortTypes: escortTypes,
      carTypes: carTypes,

      form: {
        title: "",
        whoride: 1,
        cartype: carTypes[0],
        weight: "",
        height_f: "",
        height_i: "",
        gender: genderTypes[0],
        datebirth: "",
        escort: escortTypes[0], // opt
        contact: "", // opt
        instruction: "", // opt
      },

      wMask: createNumberMask({
        prefix: "",
        allowDecimal: true,
        includeThousandsSeparator: false,
        allowNegative: false,
      }),

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
    // optServices() {
    //   const services = this.opt?.VENDOR_SERVICES || [];
    //   return services.filter((s) => s.g !== 2);
    // },
    isNew() {
      return !this.profile?.id;
    },
    formRules() {
      let rules = {};

      rules.title = {
        required,
        minLength: minLength(1),
        maxLength: maxLength(30),
      };

      rules.cartype = {
        required,
      };

      rules.weight = {
        required,
        between: between(1, 1500),
      };

      rules.height_f = {
        required,
        between: between(1, 9),
      };

      rules.height_i = {
        between: between(0, 11),
      };

      rules.instruction = {
        required,
        maxLength: maxLength(60),
      };

      rules.contact = {
        minLength: minLength(13),
        maxLength: maxLength(13),
      };

      return rules;
    },
  },
  methods: {
    initForm() {
      if (!this.isNew) {
        this.form = {
          title: this.profile.title,
          whoride: this.profile.whoride,
          gender:
            this.genderTypes.find((g) => g.key === this.profile.gender) ||
            this.genderTypes[0],
          datebirth: String(this.profile.datebirth), // 19901010 = Y-M-D
          cartype:
            this.carTypes.find(
              (c) => Number(c.id) === Number(this.profile.cartype)
            ) || this.carTypes[0],
          escort:
            this.escortTypes.find(
              (e) => Number(e.id) === Number(this.profile.escort)
            ) || this.escortTypes[0],
          contact: String(this.profile.contact).substring(2), // remove 2 char (+1) - fix for v-mask...
          weight: this.profile.weight,
          height: this.profile.height,
          height_f: parseInt(this.profile.height),
          height_i: Math.round(
            (this.profile.height - parseInt(this.profile.height)) * 12
          ),
          instruction: this.profile.instruction,
        };
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

      if (this.$v.$invalid) {
        return;
      } else {
        this.trySubmit = true;
        this.errorMsg = null;

        let method = "post";
        let defaultErr = "Error on adding ride profile ...";
        let defaultMsg = "Ride profile successfully added";

        const formData = {
          title: this.form.title,
          whoride: this.form.whoride,
          cartype: this.form.cartype.id,
          weight: this.form.weight ? Number(this.form.weight) : 0,
          height:
            Number(this.form.height_f) + Number(this.form.height_i * 0.0833333),
          gender: this.form.gender.key,
          datebirth: Number(this.form.datebirth), // 19901010 = Y-M-D
          escort: this.form.escort.id,
          contact: this.form.contact,
          instruction: this.form.instruction,
        };

        if (!this.isNew) {
          // Edit ride profile
          formData.id = this.profile.id;

          method = "put";
          defaultErr = "Error on editing ride profile ...";
          defaultMsg = "Ride profile successfully edited";
        }

        // console.log("submit profile-form, formData: ", formData);

        try {
          await axios({
            method: method,
            url: urls.URL_CLIENT_ORDER_PRESET,
            data: formData,
          });

          this.msg.has = true;
          this.msg.type = "success";
          this.msg.text = defaultMsg;

          this.$emit("onSubmit");
        } catch (error) {
          console.log("Error: ", error);

          this.msg.has = true;
          this.msg.type = "danger";
          this.msg.text =
            error.message && error.response?.data?.error
              ? `${error.message}: ${error.response.data.error}`
              : defaultErr;
        } finally {
          this.trySubmit = false;
        }
      }
    },
  },
  watch: {},
};
</script>
<style scoped lang="scss">
.form-group-radios {
  min-height: 77px;
}
</style>
