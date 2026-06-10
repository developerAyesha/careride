<template>
  <div>
    <div class="common-modal-headline">
      <h4 class="common-modal-title">
        {{ isNew ? "Add new car" : "Edit car" }}
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
      <div class="col-lg-6">
        <div class="form-group mb-3">
          <label for="car-model" class="required">Model</label>
          <div class="input-group input-group-merge">
            <input
              v-model="form.model"
              id="car-model"
              class="form-control"
              placeholder="Enter car model"
              :class="{
                'is-invalid': submitted && $v.form.model.$error,
              }"
            />
            <div
              v-if="submitted && $v.form.model.$error"
              class="invalid-feedback"
            >
              <div v-if="!$v.form.model.required">Model is required</div>
              <div v-if="!$v.form.model.minLength">Model min 1</div>
              <div v-if="!$v.form.model.maxLength">Model max 20</div>
            </div>
          </div>
        </div>

        <div class="form-group mb-3">
          <label for="car-plate" class="required">License Plate</label>
          <div class="input-group input-group-merge">
            <input
              v-model="form.plate"
              id="car-plate"
              class="form-control"
              placeholder="Enter License Plate"
              :class="{
                'is-invalid': submitted && $v.form.plate.$error,
              }"
            />
            <div
              v-if="submitted && $v.form.plate.$error"
              class="invalid-feedback"
            >
              <div v-if="!$v.form.plate.required">
                License Plate is required
              </div>
              <div v-if="!$v.form.plate.minLength">License Plate min 1</div>
              <div v-if="!$v.form.plate.maxLength">License Plate max 20</div>
            </div>
          </div>
        </div>

        <div class="form-group mb-3">
          <label for="car-color" class="required">Color</label>
          <div class="input-group input-group-merge">
            <input
              v-model="form.color"
              id="car-color"
              class="form-control"
              placeholder="Enter Color"
              :class="{
                'is-invalid': submitted && $v.form.color.$error,
              }"
            />
            <div
              v-if="submitted && $v.form.color.$error"
              class="invalid-feedback"
            >
              <div v-if="!$v.form.color.required">Color is required</div>
              <div v-if="!$v.form.color.minLength">Color min 1</div>
              <div v-if="!$v.form.color.maxLength">Color max 20</div>
            </div>
          </div>
        </div>

        <div class="form-group mb-2">
          <label for="car-cartype" class="required">Car Type</label>
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
      </div>
      <div class="col-lg-6 d-flex flex-column">
        <h4 class="my-0 mx-0 mb-2">Add additional cities of service</h4>
        <div class="form-group mb-3">
          <div class="row no-gutters">
            <div class="col">
              <label class="required">City</label>
              <div class="input-group input-group-merge">
                <GmapAutocomplete
                  @place_changed="addPlace"
                  :componentRestrictions="componentRestrictions"
                  :selectFirstOnEnter="true"
                  :types="['(cities)']"
                  :setFieldsTo="['address_components', 'geometry']"
                  :value="form.city"
                  ref="city"
                  placeholder=""
                  class="form-control form-autocomplete-place"
                  :class="{
                    'is-invalid': submitted && $v.form.city.$error,
                  }"
                />

                <div
                  v-if="submitted && $v.form.city.$error"
                  class="invalid-feedback"
                >
                  <div v-if="!$v.form.city.required">City is required</div>
                </div>
                <span
                  v-if="place || form.city"
                  @click="resetPlace"
                  class="material-symbols-rounded input-with-control-ico-btn"
                >
                  close
                </span>
              </div>
            </div>
            <div class="col-2 ml-2">
              <label for="car-model-city-radius" class="text-nowrap"
                >Radius, mi</label
              >
              <div class="input-group">
                <input
                  v-model.number="form.cityRadius"
                  v-mask="'#?#?#'"
                  id="car-model-city-radius"
                  class="form-control text-center"
                  minlength="1"
                  maxlength="3"
                />
                <!-- <div
                  v-if="submitted && $v.form.cityRadius.$error"
                  class="invalid-feedback"
                >
                  <div v-if="!$v.form.cityRadius.required">Car model is required</div>
                  <div v-if="!$v.form.cityRadius.minLength">Company name min 1</div>
                  <div v-if="!$v.form.cityRadius.maxLength">Company name max 20</div>
                </div> -->
              </div>
            </div>
            <div class="col-auto ml-2">
              <label>&nbsp;</label>
              <div class="input-group">
                <button
                  class="btn btn-outline-primary"
                  @click.prevent="getCities"
                  title="Get cities list"
                  :disabled="!place"
                >
                  Get
                </button>
              </div>
            </div>
          </div>
        </div>

        <div class="form-group mb-2">
          <label v-if="!newSearch">Attached cities:</label>
          <label v-else-if="form.city && form.cityRadius">
            Nearby {{ form.city }} cities in radius {{ form.cityRadius }} mi
          </label>
          <div class="input-group">
            <template v-if="form.cityNearby && form.cityNearby.length">
              <b-table
                small
                :items="tableData"
                :fields="tableFields"
                :tbody-tr-class="rowClass"
                :sort-by.sync="sortBy"
                :sort-desc.sync="sortDesc"
                :filter="filter"
                :filter-included-fields="filterOn"
                sticky-header="376px"
                class="table-city-nearby mb-2"
                ref="table-city-nearby"
                :style="tableData.length > 10 ? { minHeight: '376px' } : null"
              >
                <template #head(title)>
                  <input
                    type="search"
                    v-model="filter"
                    class="form-control"
                    placeholder="Filter"
                  />
                </template>

                <template #head(selected)>
                  <b-form-checkbox
                    v-model="selectedAll"
                    v-b-tooltip.hover
                    title="Select / Unselect All"
                  />
                </template>

                <template #cell(title)="data">
                  <label
                    class="city-label"
                    :for="`city-${data.item.city_id}`"
                    >{{ data.item.title }}</label
                  >
                </template>

                <template #cell(selected)="data">
                  <b-form-checkbox
                    v-model="data.item.selected"
                    :id="`city-${data.item.city_id}`"
                  />
                </template>
              </b-table>

              <div class="row selected-cities mt-1 mb-0">
                <div class="col-6">
                  Total: <b>{{ form.cityNearby.length }}</b>
                </div>
                <div class="col-6 text-right">
                  Selected: <b>{{ selected }}</b>
                </div>
              </div>
            </template>
          </div>
        </div>

        <div class="form-group mb-2 mt-auto">
          <div class="row no-gutters">
            <div class="col">
              <label
                >Add extra city
                <!-- <span
                  class="mark-row-extra-city"
                  v-b-tooltip.hover
                  title="Bg marking added extra city"
                ></span> -->
              </label>
              <div class="input-group input-group-merge">
                <GmapAutocomplete
                  @place_changed="findCityExtra"
                  :componentRestrictions="componentRestrictions"
                  :selectFirstOnEnter="true"
                  :types="['(cities)']"
                  :setFieldsTo="['address_components', 'geometry']"
                  :value="cityExtra"
                  ref="cityExtra"
                  placeholder=""
                  class="form-control form-autocomplete-place"
                />

                <span
                  v-if="cityExtra"
                  @click="resetCityExtra"
                  class="material-symbols-rounded input-with-control-ico-btn"
                >
                  close
                </span>
              </div>
            </div>
            <div class="col-auto ml-2">
              <label>&nbsp;</label>
              <div class="input-group">
                <button
                  class="btn btn-outline-primary"
                  @click.prevent="addCityExtra"
                  title="Get cities list"
                >
                  Add
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <hr class="mt-2 mb-1" />

    <div class="mt-3 text-center text-md-left">
      <button
        class="btn btn-primary"
        @click.prevent="handleSubmit"
        :disabled="trySubmit"
      >
        {{ isNew ? "Add car" : "Save changes" }}
      </button>
    </div>

    <!-- <pre>place: {{ place }}</pre> -->
    <!-- <pre>newSearch: {{ newSearch }}</pre> -->
    <!-- <pre>form.cityNearby: {{ form.cityNearby }}</pre> -->
    <!-- <pre>form: {{ form }}</pre> -->
    <!-- <pre>car: {{ car }}</pre> -->
    <!-- <pre>car.cities: {{ car.cities }}</pre> -->
  </div>
</template>

<script>
import { carTypes } from "@/components/data";
import axios from "axios";
import urls from "@/urls";
import {
  required,
  minLength,
  maxLength,
  sameAs,
  requiredIf,
} from "vuelidate/lib/validators";
import { getCity } from "@/helpers";
import Multiselect from "vue-multiselect";
import { Country, State, City } from "country-state-city";
import { isPointWithinRadius } from "geolib";
import exceptionCities from "@/components/data/exception-cities";

export default {
  props: {
    car: {
      type: Object,
      default: () => {},
    },
  },
  components: {
    Multiselect,
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

      place: "",
      state: "",

      placeExtra: "",
      cityExtra: "",

      form: {
        model: "",
        plate: "",
        color: "",
        cartype: carTypes[0],
        city: "",
        cityRadius: 10,
        cityNearby: null,
      },

      tableFields: [
        {
          key: "title",
          // sortable: true,
        },
        {
          key: "selected",
          // sortable: true,
          class: "cell-id",
        },
      ],

      selectedAll: true,

      filter: null,
      filterOn: [],
      sortBy: "title",
      sortDesc: false,

      fileAlert: false,

      showPassw: false,
      showRepassw: false,

      submitted: false,
      trySubmit: false,

      newSearch: false,

      exCities: exceptionCities,
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
      return !this.car?.id;
    },
    formRules() {
      let rules = {};

      rules.model = {
        required,
        minLength: minLength(1),
        maxLength: maxLength(20),
      };

      rules.plate = {
        required,
        minLength: minLength(1),
        maxLength: maxLength(20),
      };

      rules.color = {
        required,
        minLength: minLength(1),
        maxLength: maxLength(20),
      };

      rules.cartype = {
        required,
      };

      rules.city = {
        required,
      };

      return rules;
    },
    tableData() {
      return this.form.cityNearby;
    },
    totalRows() {
      return this.tableData?.length || 0;
    },
    selected() {
      return this.form.cityNearby.filter((c) => c.selected)?.length || 0;
    },
  },
  methods: {
    initForm() {
      if (!this.isNew) {
        const cities = this.car.cities.map((c) => {
          return {
            ...c,
            selected: true,
          };
        });

        this.form = {
          model: this.car.model,
          plate: this.car.plate,
          color: this.car.color,
          cartype: this.carTypes.find((t) => t.id === this.car.cartype),
          city: this.car.city,
          cityRadius: this.car.city_radius,
          cityNearby: cities,
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

        // get arr of selected cities names
        const cities = [];
        this.form.cityNearby.map((c) => {
          if (c.selected) {
            cities.push(c.title);
          }
        });
        // console.log("cities: ", cities);

        // common fields
        const formData = {
          model: this.form.model,
          plate: this.form.plate,
          color: this.form.color,
          cartype: this.form.cartype.id,
          city: this.form.city,
          city_radius: this.form.cityRadius,
          cities,
        };

        let method = "post";
        let defaultErr = "Error on adding car ...";
        let defaultMsg = "Car successfully added";

        if (this.isNew) {
          // Add new car
          formData.vendor_id = this.car.vendor_id;
        } else {
          // Edit driver
          formData.id = this.car.id;

          method = "put";
          defaultErr = "Error on editing car ...";
          defaultMsg = "Car successfully edited";
        }
        // console.log("formData: ", formData);

        try {
          await axios({
            method: method,
            url: urls.URL_VENDOR_CAR,
            data: formData,
          });

          this.msg.has = true;
          this.msg.type = "success";
          this.msg.text = defaultMsg;

          this.inprogress = false;

          this.$emit("onSubmit");
        } catch (error) {
          // console.log("Error: ", error);

          this.msg.has = true;
          this.msg.type = "danger";
          this.msg.text = defaultErr;

          if (error.response?.data?.error && error.response?.status) {
            this.msg.text = `Error: ${error.response.status} ${error.response.data.error}`;
          } else if (error.response?.status || error.response?.statusText) {
            this.msg.text = `Error: ${error.response.status} ${error.response.statusText}`;
          }

          this.inprogress = false;
        } finally {
          this.trySubmit = false;
        }
      }
    },
    addPlace(place) {
      this.place = place;
    },
    resetPlace() {
      this.place = null;
      this.$refs.city.$refs.input.value = "";
    },
    async getCities() {
      // console.log("this.place: ", this.state);

      // let cities = [];
      this.form.cityNearby = [];

      if (this.state) {
        const citiesOfCountry = City.getCitiesOfCountry("US");

        // miles to meters, 1 mi = 1609.344 m
        // console.log("radius: ", this.form.cityRadius);
        const r = this.form.cityRadius * 1609.34; // meters
        const center = {
          latitude: this.place.geometry.location.lat(),
          longitude: this.place.geometry.location.lng(),
        };

        citiesOfCountry.map((city, i) => {
          const point = { latitude: city.latitude, longitude: city.longitude };
          if (isPointWithinRadius(point, center, r)) {
            this.form.cityNearby.push({
              city_id: `city-${i}`,
              title: `${this.fixDiffCityName(city.name)}, ${city.stateCode}`,
              selected: true,
            });

            this.newSearch = true;
          }
        });
      }

      // console.log(
      //   "getCities list, this.form.cityNearby: ",
      //   this.form.cityNearby
      // );
    },
    findCityExtra(place) {
      this.placeExtra = place;
    },
    resetCityExtra() {
      this.placeExtra = null;
      this.$refs.cityExtra.$refs.input.value = "";
    },
    addCityExtra() {
      // console.log("addCityExtra, store and clean up ... ");

      // get city from place data (this.placeExtra)
      let city = "";
      const cityData = getCity(this.placeExtra);

      if (cityData.name.length) {
        city = cityData.name.join(", ");
      } else {
        return;
      }

      if (city) {
        // console.log("city: ", city);

        // check if not in the list, then add
        const existed = this.form.cityNearby.filter(
          (c) => c.title === city
        ).length;
        // console.log("existed: ", existed);

        if (!existed) {
          // push city (this.cityExtra) to cities list ...
          this.form.cityNearby.push({
            city_id: `city-${Date.now() + Math.random()}`,
            title: city,
            selected: true,
            // class: "row-extra-city",
          });
        }
      }

      // Get row index and scroll to it
      // let rowIndex = 0;
      // this.form.cityNearby.map((c, i) => {
      //   if (c.title === city) {
      //     rowIndex = i;
      //   }
      // });

      // console.log("rowIndex: ", rowIndex);
      // this.scrollToRow(rowIndex + 1);

      // clear cityExtra
      this.resetCityExtra();
    },
    rowClass(item, type) {
      if (!item || type !== "row") return;
      // if (item.selected) {
      //   return `${item.class} row-selected`;
      // } else {
      //   return `${item.class}`;
      // }
      if (item.selected) return "row-selected";
    },
    // scrollToRow(index) {
    //   const tbody = this.$refs["table-city-nearby"].$el.querySelector("tbody");
    //   const row = tbody.querySelectorAll("tr")[index];
    //   row.scrollIntoView({
    //     behavior: "smooth",
    //   });
    // },

    // Fix Google API and lib diff city name cases
    fixDiffCityName(name) {
      // console.log("city, name: ", name);
      let fixName = name;

      // if in list exception cities, fix name to alias [this.exCities (title, alias)]
      this.exCities.map(({ title, alias }) => {
        if (title === name) {
          fixName = alias;
        }
      });

      return fixName;
    },
  },
  watch: {
    place: {
      handler: function () {
        // get city id - "Bossier City, LA"
        if (this.place) {
          const city = getCity(this.place);

          if (city.name.length) {
            this.state = city.name[1];
            this.form.city = city.name.join(", ");
          }
        } else {
          this.state = "";
          this.form.city = "";
        }
      },
      deep: true,
    },
    selectedAll(checked) {
      // console.log("selectedAll: ", checked);
      this.form.cityNearby.map((c) => (c.selected = checked));
    },
  },
};
</script>

<style scoped lang="scss">
.care-ride .table-city-nearby {
  width: 100%;
  border-top: 1px solid #edeff1;
  border-bottom: 1px solid #edeff1;
}

// .care-ride .mark-row-extra-city {
//   display: inline-block;
//   width: 14px;
//   height: 14px;
//   vertical-align: middle;
//   background-color: rgba(#199f97, 0.2);
//   margin: 0 0 0 2px;
// }

.care-ride .table-city-nearby :deep {
  thead th,
  tbody td {
    border-width: 1px;
    padding: 4px 8px;
  }
  tbody .row-selected .city-label {
    color: #199f97;
  }
  // tbody .row-extra-city {
  //   background-color: rgba(#199f97, 0.1);
  // }

  tbody tr:last-child td {
    border-bottom: none;
  }

  thead th {
    border-width: 0;
  }

  thead th .form-control {
    height: 38px;
  }

  tbody td .city-label {
    display: block;
    font-weight: 400;
    font-size: 15px;
    margin: 0;
    cursor: pointer;
  }
}

.selected-cities {
  padding: 0 0 0 8px;
  white-space: nowrap;
  width: 100%;

  b {
    font-weight: 600;
  }
}
</style>
