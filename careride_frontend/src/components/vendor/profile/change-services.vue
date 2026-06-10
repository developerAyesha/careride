<template>
  <div>
    <!-- <pre>form: {{ form }}</pre> -->
    <!-- <pre>vendor: {{ vendor }}</pre> -->
    <!-- <pre>vendor: {{ vendor.overtimes }}</pre> -->
    <!-- <pre>sliderSteps: {{ sliderSteps }}</pre> -->
    <!-- <pre>this.carTypes: {{ carTypes }}</pre> -->
    <!-- <pre>form.cartypes: {{ form.cartypes }}</pre> -->

    <h3 class="section-title my-3">
      The changes you make in that block don't need to be reviewed. Changes will
      be applied immediately.
    </h3>

    <b-alert class="info-alert" variant="info" show>
      <div class="info-alert__title">
        <span class="material-symbols-rounded"> info </span>
        Price Calculations
      </div>

      <ul>
        <li>
          <b>One-Way Trip:</b>
          Base price + $/Mile + Additional Services + Overtime - Service Fee
        </li>
        <li>
          <b>Round-Trip:</b>
          Base price + ($/Mile x 2) + Additional Services + Overtime - Service
          Fee
        </li>
      </ul>
    </b-alert>

    <b-alert
      :variant="msg.type"
      dismissible
      class="mt-3"
      v-model="msg.has"
      :show="msg.text"
      >{{ msg.text }}</b-alert
    >

    <div class="row">
      <div class="col-md-6 col-xl-5 mb-3 mb-md-0 h-100">
        <h3 class="header-title">Car types</h3>
        <div class="card h-100 mb-0">
          <div class="card-body">
            <div class="row">
              <div
                v-for="(cartype, i) of form.cartypes"
                :key="cartype.key"
                class="col-12 col-xl-6"
                :class="{ 'mb-2 mb-xl-0': i !== form.cartypes.length - 1 }"
              >
                <div class="form-group mb-2">
                  <div class="input-group">
                    <b-form-checkbox
                      v-model="cartype.checked"
                      :value="true"
                      :unchecked-value="false"
                      @change="
                        cartype.checked
                          ? (cartype.value = '')
                          : (cartype.value = 0)
                      "
                      @input="moveToNextField($event, `cartype-${cartype.key}`)"
                    >
                      {{ cartype.label }}
                    </b-form-checkbox>
                  </div>
                </div>
                <div class="form-group my-2">
                  <label :for="`cartype-${cartype.key}`">Price per mile</label>
                  <div class="input-group input-group-merge">
                    <input
                      v-model.number="cartype.value"
                      v-mask="currencyMask"
                      placeholder="$"
                      type="text"
                      :id="`cartype-${cartype.key}`"
                      :ref="`cartype-${cartype.key}`"
                      :disabled="!cartype.checked"
                      class="form-control"
                      :class="{
                        'is-invalid':
                          submitted && $v.form.cartypes.$each[i].value.$error,
                      }"
                    />
                  </div>
                </div>
                <div class="form-group my-0">
                  <label :for="`cartype-baseprice-${cartype.key}`"
                    >Base price</label
                  >
                  <div class="input-group input-group-merge">
                    <input
                      v-model.number="cartype.baseprice"
                      v-mask="currencyMask"
                      placeholder="$"
                      type="text"
                      :id="`cartype-baseprice-${cartype.key}`"
                      :ref="`cartype-baseprice-${cartype.key}`"
                      :disabled="!cartype.checked"
                      class="form-control"
                      :class="{
                        'is-invalid':
                          submitted &&
                          $v.form.cartypes.$each[i].baseprice.$error,
                      }"
                    />
                    <div
                      v-if="
                        submitted && $v.form.cartypes.$each[i].baseprice.$error
                      "
                      class="invalid-feedback"
                    >
                      Min 0.5 or off (unchecked)
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div class="col-md-6 col-xl-7 mb-3 mb-md-0 h-100">
        <h3 class="header-title">Additional services</h3>
        <div class="card h-100 mb-0">
          <div class="card-body">
            <div class="row">
              <div
                v-for="(service, i) of form.services"
                :key="service.c"
                class="col-12 col-xl-4"
                :class="{ 'mb-2 mb-xl-0': i !== form.services.length - 1 }"
              >
                <div class="form-group mb-2">
                  <div class="input-group">
                    <b-form-checkbox
                      v-model="service.checked"
                      :value="true"
                      :unchecked-value="false"
                      @change="
                        service.checked
                          ? (service.value = '')
                          : (service.value = null)
                      "
                      @input="moveToNextField($event, `service-${service.c}`)"
                    >
                      {{ service.t }}
                    </b-form-checkbox>
                  </div>
                </div>
                <div class="form-group my-0">
                  <label :for="`service-${service.c}`">Price</label>
                  <div class="input-group input-group-merge">
                    <input
                      v-model.number="service.value"
                      v-mask="currencyMask"
                      placeholder="$"
                      type="text"
                      :id="`service-${service.c}`"
                      :ref="`service-${service.c}`"
                      :disabled="!service.checked"
                      class="form-control"
                      :class="{
                        'is-invalid':
                          submitted && $v.form.services.$each[i].value.$error,
                      }"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div class="row my-0 mt-md-3">
      <div class="col-12">
        <h3 class="header-title">After hours additional cost (optional)</h3>
        <div class="card mb-0">
          <div class="card-body">
            <div v-if="!form.overtimes.length" class="text-center">
              <a
                class="btn btn-outline-primary mx-auto"
                @click.prevent="addOvertime"
                title="Add overtime"
                href="#"
              >
                <span class="material-symbols-rounded"> add_location </span>
                Add overtime
              </a>
            </div>
            <div v-else class="overtime-slider">
              <div
                v-for="(overtime, i) in form.overtimes"
                :key="overtime.id"
                class="row"
                :class="{ 'mb-3': i < form.overtimes.length - 1 }"
              >
                <div class="col-12 col-xl-9">
                  <div class="row">
                    <div class="col-auto">
                      <label>
                        Period start
                        <!-- {{ overtime.id }} -->
                      </label>
                    </div>
                    <div class="col-auto ml-auto text-center">
                      <div
                        class="invalid-feedback text-center"
                        :class="{
                          'is-invalid slider-diapason-msg d-block':
                            $v.form.overtimes.$each[i].slider.$error,
                        }"
                      >
                        Overtime diapason
                        <b
                          >[{{ getOverflowTime(overtime.slider[0])?.name }} -
                          {{ getOverflowTime(overtime.slider[1])?.name }}]</b
                        >
                        has collision
                      </div>
                    </div>
                    <div class="col-auto ml-auto">
                      <label>Period end</label>
                    </div>
                  </div>
                  <vue-slider
                    v-model="overtime.slider"
                    :data="sliderSteps"
                    :data-value="'id'"
                    :data-label="'name'"
                    :min-range="1"
                    :max-range="25"
                    :class="{
                      'is-invalid': $v.form.overtimes.$each[i].slider.$error,
                    }"
                  >
                    <template v-slot:step="{ label, active }">
                      <div :class="['custom-step', { active }]"></div>
                    </template>
                  </vue-slider>
                </div>
                <div class="col-auto mx-auto col-xl-3">
                  <div class="form-group mb-0">
                    <label>Price</label>
                    <div
                      class="input-group input-group-merge input-with-control-ico"
                    >
                      <div class="position-relative w-100">
                        <input
                          v-model.number="overtime.price"
                          v-mask="currencyMask"
                          placeholder="$"
                          type="text"
                          class="form-control"
                          :class="{
                            'is-invalid':
                              submitted &&
                              $v.form.overtimes.$each[i].price.$error,
                          }"
                        />
                      </div>
                      <a
                        class="btn btn-outline-primary btn-ico ml-2"
                        v-if="form.overtimes.length < sliderSteps.length - 1"
                        @click.prevent="addOvertime"
                        title="Add overtime"
                        href="#"
                      >
                        <span class="material-symbols-rounded">
                          add_location
                        </span>
                      </a>
                      <a
                        class="btn btn-transparent btn-ico btn-ico-remove ml-1"
                        @click.prevent="removeOvertime(overtime.id)"
                        title="Remove location"
                        href="#"
                      >
                        <span class="material-symbols-rounded"> cancel </span>
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div class="text-center text-md-right my-3">
      <button
        class="btn btn-outline-secondary mr-2"
        @click.prevent="handleReset"
        :disabled="trySubmit"
      >
        Reset
      </button>
      <button
        class="btn btn-outline-primary mw-230"
        @click.prevent="handleSubmit"
        :disabled="trySubmit"
      >
        Save changes
      </button>
    </div>
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
} from "vuelidate/lib/validators";
import { mapState, mapGetters } from "vuex";
import { carTypes, timeline } from "@/components/data";
import createNumberMask from "text-mask-addons/dist/createNumberMask";
import VueSlider from "vue-slider-component";
import "vue-slider-component/theme/default.css";

export default {
  props: {
    vendor: {
      type: Object,
      default: () => {},
    },
  },
  components: {
    VueSlider,
  },
  data() {
    return {
      msg: {
        has: false,
        type: "",
        text: "",
      },

      componentRestrictions: { country: "us" },

      carTypes: carTypes,

      form: {
        cartypes: [],
        services: [],
        overtimes: [],
      },

      currencyMask: createNumberMask({
        prefix: "$ ",
        allowDecimal: true,
        includeThousandsSeparator: false,
        allowNegative: false,
      }),

      sliderSteps: timeline,

      submitted: false,
      trySubmit: false,
    };
  },
  validations() {
    return {
      // dynamic required validation field if field.checked: true else optional (field.checked: false - disabled)
      form: {
        cartypes: {
          $each: {
            value: {
              requiredIfChecked: function (value, cartype) {
                return !cartype.checked || value;
              },
            },
            baseprice: {
              requiredIfChecked: function (value, cartype) {
                return (
                  !cartype.checked ||
                  (cartype.checked && this.getPrice(value) >= 0.5)
                );
              },
            },
          },
        },
        services: {
          $each: {
            value: {
              requiredIfChecked: function (value, service) {
                return !service.checked || value;
              },
            },
          },
        },
        overtimes: {
          $each: {
            price: {
              required: function (value) {
                return value;
              },
            },
            slider: {
              collision: function (value, slide) {
                let valid = true;

                // if one - no collision
                if (this.form.overtimes.length === 1) {
                  return true;
                }

                // check collision
                const reverseOvertimes = [...this.form.overtimes];
                reverseOvertimes.reverse().map((overtime) => {
                  if (overtime.id !== slide.id) {
                    const start = overtime.slider[0];
                    const end = overtime.slider[1];

                    if (value[0] >= start && value[0] < end) {
                      valid = false;
                    }

                    if (value[1] > start && value[1] <= end) {
                      valid = false;
                    }
                  }
                });

                return valid;
              },
            },
          },
        },
      },
    };
  },
  created() {
    this.prepareData();
  },
  computed: {
    ...mapGetters(["opt"]),
  },
  methods: {
    prepareData() {
      // cartypes, add checkbox and value = ""
      // set init state from vendor
      this.form.cartypes = this.carTypes.map((t) => ({
        ...t,
        value:
          this.vendor && Number(this.vendor[t.key]) ? this.vendor[t.key] : 0,
        checked: this.vendor && Number(this.vendor[t.key]) ? true : false,
        baseprice:
          this.vendor && Number(this.vendor[t.basepricekey])
            ? this.vendor[t.basepricekey]
            : "",
      }));

      // services, add checkbox and value = ""
      // set init state from vendor
      this.form.services = this.opt?.VENDOR_SERVICES.map((s) => ({
        ...s,
        value:
          this.vendor?.services?.length &&
          this.vendor.services.find((vs) => vs.id === s.id)?.price !== null
            ? this.vendor.services.find((vs) => vs.id === s.id)?.price
            : "",
        checked:
          this.vendor?.services?.length &&
          this.vendor.services.find((vs) => vs.id === s.id)?.price !== null
            ? true
            : false,
      }));

      // overtimes - init
      this.vendor?.overtimes?.map((overtime) => {
        this.form.overtimes.push({
          id: overtime.id,
          price: overtime.price,
          slider: this.getOverflowDiapason(overtime.timefrom, overtime.timeto),
        });
      });
    },
    addPlace(place) {
      this.place = place;
    },
    resetPlace() {
      this.place = null;
      this.$refs.city.$refs.input.value = "";
    },
    moveToNextField(e, ref) {
      this.$nextTick(() => {
        this.$refs[ref][0].focus();
      });
    },
    addOvertime() {
      // set next diapason, calc from arr
      let start = 1;
      this.form.overtimes.map((overtime) => {
        if (
          start < overtime.slider[1] &&
          overtime.slider[1] < this.sliderSteps.length
        ) {
          start = overtime.slider[1];
        }
      });

      const overtime = {
        id: "id-" + new Date().getTime(),
        slider: [start, start + 1],
        price: "",
      };

      this.form.overtimes.push(overtime);
    },
    removeOvertime(id) {
      // console.log("removeOvertime, id: ", id);
      this.form.overtimes = this.form.overtimes.filter(
        (overtime) => overtime.id !== id
      );
    },
    getPrice(str) {
      return parseFloat(String(str).match(/(\d+)(\.\d+)?/g));
    },
    getOverflowTime(timeid) {
      return this.sliderSteps.find((step) => step.id === timeid);
    },
    getOverflowDiapason(from, to) {
      const f = this.sliderSteps.find((step) => Number(step.f) === from).id;
      let t = this.sliderSteps.find((step) => Number(step.f) === to).id;
      // console.log("getOverflowDiapason, from: ", f);
      // console.log("getOverflowDiapason, to: ", t);

      if ((f > t && t === 1) || (f == 1 && t === 1)) {
        t = 25;
      }

      return [f, t];
    },
    handleReset() {
      this.$emit("reset");
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

        const formData = {
          id: this.vendor.id,
        };

        // services
        // "services": {
        //   "OXYGEN": 15.5,
        //   "STAIRS": 3.3
        // },

        formData.services = {};
        this.form.services.map((service) => {
          if (service.checked) {
            formData.services[service.c] = this.getPrice(service.value);
          } else {
            formData.services[service.c] = null;
          }
        });

        // "costmt1": 2.2,
        // "costmt2": 0,
        // "baseprice1": 0.5, // min 0.5
        // "baseprice2": 1.5,
        this.form.cartypes.map((cartype) => {
          if (cartype.checked) {
            formData[cartype.key] = this.getPrice(cartype.value);
            formData[cartype.basepricekey] = this.getPrice(cartype.baseprice);
          } else {
            formData[cartype.key] = 0;
          }
        });

        // "overtimes": [
        //   {
        //     "timefrom": "19:00",
        //     "timeto": "06:00",
        //     "price": 15.5
        //   },
        // ]
        formData.overtimes = this.form.overtimes.map((overtime, i) => {
          return {
            timefrom: this.getOverflowTime(overtime.slider[0]).time,
            timeto: this.getOverflowTime(overtime.slider[1]).time,
            price: this.getPrice(overtime.price),
          };
        });
        // console.log("formData: ", formData);

        try {
          await axios({
            method: "post",
            url: urls.URL_VENDOR_PROFILE,
            data: formData,
          });

          this.msg.has = true;
          this.msg.type = "success";
          this.msg.text = "Changes saved ...";
        } catch (error) {
          console.log("Error: ", error);

          this.msg.has = true;
          this.msg.type = "danger";
          this.msg.text = "Changes saved error ...";

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
        this.prepareData();
      },
      deep: true,
    },
  },
};
</script>
<style lang="scss" scoped>
.btn-ico-remove {
  color: #505655 !important;

  .material-symbols-rounded {
    font-size: 20px;
  }
}

// Theming slider

.custom-step {
  width: 3px;
  height: 14px;
  border-radius: 3px;
  box-shadow: none;
  background-color: #d1d6d9;
  margin-top: -5px;
}
.custom-step.active {
  box-shadow: none;
  background-color: #199f97;

  .is-invalid & {
    background-color: #f1556c;
  }
}

.info-alert {
  display: inline-block;
  margin-bottom: 25px;

  &__title {
    display: flex;
    align-items: center;
    font-weight: 500;
    font-size: 18px;
    padding-bottom: 10px;
    margin-bottom: 10px;
    border-bottom: 1px dashed rgba(29, 106, 120, 0.4);

    span {
      margin-right: 8px;
    }
  }

  ul {
    padding-left: 0px;
    margin: 0;

    li {
      font-size: 16px;
      list-style: none;
      margin-top: 5px;
    }
  }
}
</style>
