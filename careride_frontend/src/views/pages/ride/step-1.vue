<template>
  <BookingLayout>
    <BkSteps :current="1" />

    <div class="s1-grid">
      <!-- Form card -->
      <div class="s1-form-card">
        <h5 class="s1-card-title">Trip information :</h5>

        <!-- Pickup -->
        <div class="s1-loc-box" :class="{ 's1-loc-box--focus': focuses.pickup }">
          <PickupIcon class="s1-pin" :width="24" :height="24" />
          <div class="s1-loc-input">
            <GmapAutocomplete
              :componentRestrictions="componentRestrictions"
              :selectFirstOnEnter="true"
              :setFieldsTo="mapFields"
              :ref="`transitPoint-${waypointFields[0].id}`"
              placeholder="Pickup location"
              @place_changed="setPlace($event, waypointFields[0].id)"
              @focus.native="onLocationFocus('pickup', waypointFields[0].id)"
              @blur.native="onLocationBlur('pickup')"
            />
          </div>
          <button v-if="waypointFields[0].point" class="s1-clear" @click="resetPlace(waypointFields[0].id)" type="button">
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <path d="M1 1l12 12M13 1L1 13" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/>
            </svg>
          </button>
        </div>

        <!-- Connector dots -->
        <div class="s1-connector"><span /><span /><span /></div>

        <!-- Drop -->
        <div class="s1-drop-row">
          <div class="s1-loc-box" :class="{ 's1-loc-box--focus': focuses.drop }">
            <DropIcon class="s1-pin" :width="24" :height="24" />
            <div class="s1-loc-input">
              <GmapAutocomplete
                :componentRestrictions="componentRestrictions"
                :selectFirstOnEnter="true"
                :setFieldsTo="mapFields"
                :ref="`transitPoint-${waypointFields[1].id}`"
                placeholder="Drop location"
                @place_changed="setPlace($event, waypointFields[1].id)"
                @focus.native="onLocationFocus('drop', waypointFields[1].id)"
                @blur.native="onLocationBlur('drop')"
              />
            </div>
          </div>
          <button class="s1-loc-btn" @click="useGpsLocation" type="button" title="Use current location" :disabled="gpsLoading">
           <LocationIcon class="s1-pin" :width="24" :height="24" />
          </button>
        </div>

        <!-- Date & Time -->
        <div class="s1-row2 s1-row2--dt mt-16">
          <div class="s1-dt-field">
            <date-picker
              v-model="form.pickup_date"
              :open.sync="pickupDateOpen"
              :lang="dpConfig"
              append-to-body
              placeholder="Pickup date"
              format="MM-DD-YYYY"
              input-class="s1-dt-input"
              :input-props="{ readonly: true }"
              :disabled-date="disabledDate"
              @open="onDatePickerOpen"
              @close="onDatePickerClose"
            />
            <span class="s1-dt-ico" aria-hidden="true" @click="pickupDateOpen = true">
              <span class="material-symbols-rounded">calendar_month</span>
            </span>
          </div>
          <div class="s1-dt-field">
            <date-picker
              v-model="form.pickup_time"
              :open.sync="pickupTimeOpen"
              :lang="dpConfig"
              type="time"
              append-to-body
              :minute-step="15"
              format="hh:mm a"
              placeholder="Pickup time"
              use12h
              input-class="s1-dt-input"
              :input-props="{ readonly: true }"
              :disabled="!form.pickup_date"
              :disabled-time="disabledTime"
              @open="onTimePickerOpen"
            />
            <span class="s1-dt-ico" aria-hidden="true" @click="openTimePicker">
              <span class="material-symbols-rounded">schedule</span>
            </span>
          </div>
        </div>
        <div class="s1-row2 s1-row2-errs">
          <div class="s1-err" v-if="submitted && $v.form.pickup_date.$error">Required</div>
          <div v-else />
          <div class="s1-err" v-if="submitted && $v.form.pickup_time.$error">Required</div>
        </div>



        <!-- Trip type + Car type -->
        <div class="s1-row2 mt-16">
          <div class="s1-field">
            <label class="s1-label">Trip type <span class="s1-req">*</span></label>
            <div class="s1-toggles">
              <button
                class="s1-tog"
                :class="{ on: Number(form.roundtrip) === 0 }"
                type="button"
                @click="form.roundtrip = 0"
              >
                <span class="s1-tog-icon" :class="{ on: Number(form.roundtrip) === 0 }">
                  <OneWayIcon :width="20" :height="20" />
                </span>
                One way
              </button>
              <button
                class="s1-tog"
                :class="{ on: Number(form.roundtrip) === 1 }"
                type="button"
                @click="form.roundtrip = 1"
              >
                <span class="s1-tog-icon" :class="{ on: Number(form.roundtrip) === 1 }">
                  <RoundTripIcon :width="20" :height="20" />
                </span>
                Round trip
              </button>
            </div>
          </div>

          <div class="s1-field">
            <label class="s1-label">Car type <span class="s1-req">*</span></label>
            <div class="s1-toggles">
              <button
                v-for="car in carTypes"
                :key="car.id"
                class="s1-tog"
                :class="{ on: form.cartype && form.cartype.id === car.id }"
                type="button"
                @click="form.cartype = car"
              >
                <span class="s1-tog-icon" :class="{ on: form.cartype && form.cartype.id === car.id }">
                  <WheelChairIcon v-if="car.id === 1" :width="20" :height="20" />
                  <GurneyIcon     v-else   :width="20" :height="20" />
                </span>
                {{ car.label === 'Gurney/Stretcher' ? 'Gurney' : car.label }}
              </button>
            </div>
            <div class="s1-err" v-if="submitted && $v.form.cartype.$error">Required</div>
          </div>
        </div>

        <!-- Special Instructions + Additional Services -->
        <div class="s1-row2 mt-16">
          <div class="s1-field">
            <label class="s2-label">Special Instructions <span class="s1-opt">(Optional)</span></label>
            <textarea
              v-model="form.instruction"
              class="s1-inp--text"
              :placeholder="instructionPlaceholder"
              maxlength="500"
              @focus="onIosFieldFocus"
              @blur="onIosFieldBlur"
            />
          </div>
          <div class="s1-field" v-if="optServices.length">
            <label class="s2-label">Additional Service <span class="s1-opt">(Optional)</span></label>
            <div class="s1-toggles">
              <button
                v-for="s in optServices"
                :key="s.c"
                class="s1-tog"
                :class="{ on: form.services.includes(s.c) }"
                type="button"
                @click="toggleService(s.c)"
              >
                <span class="s1-tog-icon" :class="{ on: form.services.includes(s.c) }">
                  <OxygenIcon    v-if="s.c === 'OXYGEN'"          :width="20" :height="20" />
                  <StairIcon     v-else-if="s.c === 'STAIRS'"      :width="20" :height="20" />
                </span>
                {{ s.t }}
              </button>
            </div>
          </div>
        </div>

        <div class="s1-err mt-8" v-if="msg.has">{{ msg.text }}</div>
      </div>

      <!-- Map card -->
      <div class="s1-map-card" :class="{ 'bk-map-collapsed': collapseMapOnIos }">
        <GmapMap
          :center="center"
          :zoom="5"
          map-type-id="terrain"
          style="width:100%;height:100%;min-height:460px;border-radius:28px;"
        >
          <template v-if="waypointsLocation.length < 2">
            <GmapMarker v-for="w in waypointsLocation" :key="w.id" :position="w.position" />
          </template>
          <DirectionsRenderer v-if="showRoutes" :locations="waypointsLocation" travelMode="DRIVING" @update="updateRoute" />
        </GmapMap>
      </div>
    </div>

    <div class="bk-step-actions">
      <button type="button" class="bk-btn-back" @click.prevent="$router.push('/')">
        <span class="material-symbols-rounded">arrow_back</span> Back
      </button>
      <button type="button" class="bk-btn-next" :disabled="!canSubmit" @click.prevent="handleSubmit">
        Next Step
        <span class="material-symbols-rounded">arrow_forward</span>
      </button>
    </div>
  </BookingLayout>
</template>

<script>
import BookingLayout from "@/views/layouts/booking";
import BkSteps from "@/components/booking/BkSteps";
import { mapGetters } from "vuex";
import DirectionsRenderer from "@/components/DirectionsRenderer";
import { getCity, getCityLabel } from "@/helpers";
import { iosFormMixin } from "@/helpers/ios-form";
import { carTypes, mapFields } from "@/components/data";
import DatePicker from "vue2-datepicker";
import { required } from "vuelidate/lib/validators";
import createNumberMask from "text-mask-addons/dist/createNumberMask";
import {
  PickupIcon,
  DropIcon,
  OneWayIcon,
  RoundTripIcon,
  WheelChairIcon,
  GurneyIcon,
  OxygenIcon,
  StairIcon,
  LocationIcon,
} from "@/assets/icons";

export default {
  metaInfo() { return { title: this.$appConfig.title + " | Book a Ride" }; },
  mixins: [iosFormMixin],
  components: {
    BookingLayout, BkSteps, DirectionsRenderer, DatePicker,
    PickupIcon, DropIcon, OneWayIcon, RoundTripIcon,
    WheelChairIcon, GurneyIcon, OxygenIcon, StairIcon, LocationIcon,
  },
  data() {
    return {
      focuses: { pickup: false, drop: false },
      componentRestrictions: { country: "us" },
      mapFields,
      waypointsLocation: [],
      waypointFields: [{ id: "id-1", point: null }, { id: "id-2", point: null }],
      center: { lat: 40.1966701, lng: -100.6248741 },
      route: "",
      showRoutes: true,
      wait: false,
      gpsLoading: false,
      carTypes,
      msg: { has: false, type: "", text: "" },
      submitted: false,
      dpConfig: { formatLocale: { firstDayOfWeek: 1 }, monthBeforeYear: false },
      pickupDateOpen: false,
      pickupTimeOpen: false,
      dateBounds: null,
      minPickupTimeMs: null,
      form: {
        pickup_date: null,
        pickup_time: null,
        roundtrip: 0,
        cartype: carTypes[0],
        instruction: "",
        services: [],
      },
      instructionSuggestions: [
        "Do you need a wheelchair?",
        "Need door-to-door assistance?",
        "How many people will be riding?",
      ],
      wMask: createNumberMask({ prefix: "", allowDecimal: true, includeThousandsSeparator: false, allowNegative: false }),
    };
  },
  validations() {
    return {
      form: {
        pickup_date: { required },
        pickup_time: { required },
        cartype: { required },
      },
    };
  },
  created() {
    if (this.$route.params.msg) this.msg = this.$route.params.msg;
    this.refreshDateBounds();
    this.initForm();
  },
  computed: {
    ...mapGetters(["authorized", "user", "opt", "routeData", "client"]),
    instructionPlaceholder() {
      return this.instructionSuggestions.join('\n');
    },
    optServices() {
      return (this.opt?.VENDOR_SERVICES || []).filter(s => s.g !== 2);
    },
    canSubmit() {
      return this.waypointsLocation.length >= 2;
    },
    collapseMapOnIos() {
      if (!this.isTouchMobile()) return false;
      return (
        this._iosFieldFocused ||
        this.focuses.pickup ||
        this.focuses.drop ||
        this.pickupDateOpen ||
        this.pickupTimeOpen
      );
    },
  },
  methods: {
    onLocationFocus(which, id) {
      this.focuses[which] = true;
      this._iosFieldFocused = true;
      this.$nextTick(() => this.scrollFieldIntoView(this.getAutocompleteInput(id)));
    },
    onLocationBlur(which) {
      this.focuses[which] = false;
      this.onIosFieldBlur();
    },
    onDatePickerOpen() {
      this.pickupTimeOpen = false;
      this.refreshDateBounds();
    },
    onDatePickerClose() {
      this.refreshMinPickupTime();
    },
    onTimePickerOpen() {
      this.pickupDateOpen = false;
      this.refreshMinPickupTime();
      this.$nextTick(() => {
        setTimeout(() => this.fixIosTimePickerCells(), 0);
      });
    },
    fixIosTimePickerCells() {
      if (!/iPad|iPhone|iPod/.test(navigator.userAgent)) return;
      document.querySelectorAll(".mx-datepicker-popup .mx-time-column .mx-time-item").forEach((el) => {
        if (el._iosTouchFixed) return;
        el._iosTouchFixed = true;
        el.addEventListener("touchend", this._onIosTimeItemTouchEnd, { passive: false });
      });
    },
    _onIosTimeItemTouchEnd(e) {
      e.preventDefault();
      if (e.currentTarget) e.currentTarget.click();
    },
    openTimePicker() {
      if (!this.form.pickup_date) return;
      this.pickupTimeOpen = true;
    },
    refreshDateBounds() {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const max = new Date(today.getTime() + 5 * 86400000);
      max.setHours(0, 0, 0, 0);
      this.dateBounds = { todayMs: today.getTime(), maxMs: max.getTime() };
    },
    refreshMinPickupTime() {
      const pd = this.form.pickup_date;
      if (!pd) {
        this.minPickupTimeMs = null;
        return;
      }
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const target = new Date(pd);
      target.setHours(0, 0, 0, 0);
      if (today.getTime() !== target.getTime()) {
        this.minPickupTimeMs = null;
        return;
      }
      const min = new Date();
      min.setSeconds(0, 0);
      min.setMilliseconds(0);
      min.setHours(min.getHours() + 1);
      this.minPickupTimeMs = min.getTime();
    },
    toggleService(c) {
      const i = this.form.services.indexOf(c);
      i === -1 ? this.form.services.push(c) : this.form.services.splice(i, 1);
    },
    disabledDate(date) {
      if (!this.dateBounds) this.refreshDateBounds();
      const d = new Date(date);
      d.setHours(0, 0, 0, 0);
      const ms = d.getTime();
      return ms < this.dateBounds.todayMs || ms > this.dateBounds.maxMs;
    },
    disabledTime(date) {
      if (this.minPickupTimeMs == null) return false;
      const d = new Date(date);
      d.setSeconds(0, 0);
      d.setMilliseconds(0);
      return d.getTime() < this.minPickupTimeMs;
    },
    getAutocompleteComponent(id) {
      const ref = this.$refs[`transitPoint-${id}`];
      return Array.isArray(ref) ? ref[0] : ref;
    },
    getAutocompleteInput(id) {
      const comp = this.getAutocompleteComponent(id);
      return comp?.$refs?.input || null;
    },
    setAutocompleteValue(id, value) {
      this.$nextTick(() => {
        const input = this.getAutocompleteInput(id);
        if (input) input.value = value || "";
      });
    },
    getPlaceLatLng(place) {
      const loc = place?.geometry?.location;
      if (!loc) return null;
      const lat = typeof loc.lat === "function" ? loc.lat() : loc.lat;
      const lng = typeof loc.lng === "function" ? loc.lng() : loc.lng;
      if (lat == null || lng == null || Number.isNaN(Number(lat)) || Number.isNaN(Number(lng))) return null;
      return { lat: Number(lat), lng: Number(lng) };
    },
    normalizePlace(place) {
      const latLng = this.getPlaceLatLng(place);
      if (!latLng) return null;
      return {
        ...place,
        formatted_address: place.formatted_address || "",
        address_components: place.address_components || [],
        geometry: {
          location: {
            lat: () => latLng.lat,
            lng: () => latLng.lng,
          },
        },
      };
    },
    setPlace(place, id) {
      const normalized = this.normalizePlace(place);
      if (!normalized) return;
      const w = this.waypointFields.find(w => w.id === id);
      if (!w) return;
      this.$set(w, "point", normalized);
      const latLng = this.getPlaceLatLng(normalized);
      this.center = { lat: latLng.lat, lng: latLng.lng };
      if (normalized.formatted_address) {
        this.setAutocompleteValue(id, normalized.formatted_address);
      }
    },
    resetPlace(id) {
      const w = this.waypointFields.find(w => w.id === id);
      if (w) {
        this.$set(w, "point", null);
        this.setAutocompleteValue(id, "");
      }
    },
    focusLocation(id) {
      const input = this.getAutocompleteInput(id);
      if (input) input.focus();
    },
    updateRoute(route) { this.route = route; this.wait = false; clearTimeout(this._waitTimeout); },
    initForm() {
      if (this.$route.query.fresh === "1") {
        this.$store.commit("setRouteData", null);
        this.resetForm();
        this.$router.replace({ path: "/ride/step-1" }).catch(() => {});
        return;
      }
      this.restoreForm();
    },
    resetForm() {
      this.waypointsLocation = [];
      this.waypointFields = [{ id: "id-1", point: null }, { id: "id-2", point: null }];
      this.route = "";
      this.wait = false;
      this.gpsLoading = false;
      this.submitted = false;
      this.pickupDateOpen = false;
      this.pickupTimeOpen = false;
      this.minPickupTimeMs = null;
      this.msg = { has: false, type: "", text: "" };
      this.form = {
        pickup_date: null,
        pickup_time: null,
        roundtrip: 0,
        cartype: this.carTypes[0],
        instruction: "",
        services: [],
      };
      this.$nextTick(() => {
        this.setAutocompleteValue("id-1", "");
        this.setAutocompleteValue("id-2", "");
      });
      if (this.$v) this.$v.$reset();
    },
    restoreForm() {
      if (!this.routeData) return;
      const d = { ...this.routeData.formData, ...this.routeData.addData };
      if (d.cartype) this.form.cartype = this.carTypes.find(c => Number(c.id) === Number(d.cartype)) || this.carTypes[0];
      if (d.roundtrip !== undefined) this.form.roundtrip = d.roundtrip;
      if (d.instruction) this.form.instruction = d.instruction;
      if (d.services) this.form.services = Object.keys(d.services).filter(s => d.services[s]);

      if (d.orderAt) {
        const orderAt = new Date(d.orderAt);
        if (!Number.isNaN(orderAt.getTime())) {
          this.form.pickup_date = new Date(orderAt.getFullYear(), orderAt.getMonth(), orderAt.getDate());
          this.form.pickup_time = new Date(orderAt);
          this.refreshMinPickupTime();
        }
      }

      const ets = d.p_dat?.ets;
      if (ets && ets.length >= 2) {
        const makePoint = (et, fallbackCity = "") => ({
          _fallbackCity: et.city || fallbackCity || "",
          address_components: [],
          utc_offset_minutes: et.utc_offset_minutes || 0,
          formatted_address: et.location,
          geometry: { location: { lat: () => et.position.lat, lng: () => et.position.lng } },
        });
        this.waypointFields[0].point = makePoint(ets[0], d.pfrom_city);
        this.waypointFields[1].point = makePoint(ets[ets.length - 1], d.pto_city);
        this.center = { ...ets[0].position };
        this.$nextTick(() => {
          this.setAutocompleteValue(this.waypointFields[0].id, ets[0].location || "");
          this.setAutocompleteValue(this.waypointFields[1].id, ets[ets.length - 1].location || "");
        });
      }
    },
    useGpsLocation() {
      this.msg = { has: false, type: "", text: "" };

      if (!navigator.geolocation) {
        this.msg = { has: true, type: "danger", text: "Geolocation is not supported in this browser." };
        return;
      }
      if (!window.google?.maps?.Geocoder) {
        this.msg = { has: true, type: "danger", text: "Google Maps is still loading. Please try again in a moment." };
        return;
      }

      const requestId = (this._gpsRequestId = (this._gpsRequestId || 0) + 1);
      this.gpsLoading = true;

      const finish = () => {
        if (requestId !== this._gpsRequestId) return;
        this.gpsLoading = false;
      };

      const applyPosition = (pos) => {
        if (requestId !== this._gpsRequestId) return;
        this.msg = { has: false, type: "", text: "" };
        const { latitude: lat, longitude: lng } = pos.coords;
        const geocoder = new window.google.maps.Geocoder();
        geocoder.geocode({ location: { lat, lng } }, (results, status) => {
          finish();
          if (requestId !== this._gpsRequestId) return;
          if (status !== "OK" || !results?.[0]) {
            this.msg = { has: true, type: "danger", text: "Could not resolve your current address. Please enter it manually." };
            return;
          }
          const idx = this.waypointFields[0].point ? 1 : 0;
          this.setPlace(results[0], this.waypointFields[idx].id);
        });
      };

      const showGpsError = (err) => {
        if (requestId !== this._gpsRequestId) return;
        finish();
        const denied = err?.code === 1;
        this.msg = {
          has: true,
          type: "danger",
          text: denied
            ? "Location permission denied. Allow location access or enter the address manually."
            : "Could not get your current location. Please enter the address manually.",
        };
      };

      const tryGetPosition = (highAccuracy, isRetry = false) => {
        navigator.geolocation.getCurrentPosition(
          applyPosition,
          (err) => {
            if (requestId !== this._gpsRequestId) return;
            if (err?.code === 1) {
              showGpsError(err);
              return;
            }
            if (!isRetry) {
              tryGetPosition(!highAccuracy, true);
              return;
            }
            showGpsError(err);
          },
          {
            enableHighAccuracy: highAccuracy,
            timeout: highAccuracy ? 20000 : 12000,
            maximumAge: 120000,
          }
        );
      };

      const startLookup = () => {
        if (requestId !== this._gpsRequestId) return;
        tryGetPosition(false);
      };

      if (navigator.permissions?.query) {
        navigator.permissions.query({ name: "geolocation" }).then((result) => {
          if (requestId !== this._gpsRequestId) return;
          if (result.state === "denied") {
            finish();
            this.msg = {
              has: true,
              type: "danger",
              text: "Location permission denied. Allow location access or enter the address manually.",
            };
            return;
          }
          startLookup();
        }).catch(() => startLookup());
      } else {
        startLookup();
      }
    },
    buildWaypointLocation(w) {
      if (!w.point) return null;
      const latLng = this.getPlaceLatLng(w.point);
      if (!latLng) return null;
      const city = getCity(w.point);
      const cityLabel = getCityLabel(w.point);
      return {
        id: w.id,
        location: w.point.formatted_address,
        utc_offset_minutes: city.utc_offset_minutes,
        city: cityLabel,
        position: { lat: latLng.lat, lng: latLng.lng },
        stopover: false,
      };
    },
    handleSubmit() {
      this.submitted = true;
      this.$v.$touch();
      if (this.$v.$invalid) return;
      if (this.waypointsLocation.length < 2) {
        this.msg = { has: true, type: "danger", text: "Please enter pickup and drop locations." };
        return;
      }
      const pfrom = this.waypointsLocation[0];
      const pto   = this.waypointsLocation[this.waypointsLocation.length - 1];
      if (!pfrom.city || pfrom.city.trim().length < 2) {
        this.msg = {
          has: true,
          type: "danger",
          text: "Could not determine pickup city. Please re-select pickup from the address suggestions.",
        };
        return;
      }
      if (!pto.city || pto.city.trim().length < 2) {
        this.msg = {
          has: true,
          type: "danger",
          text: "Could not determine dropoff city. Please re-select dropoff from the address suggestions.",
        };
        return;
      }
      let distance = 0;
      if (this.route?.routes?.[0]?.legs) {
        this.route.routes[0].legs.forEach(l => distance += l.distance.value);
      }
      distance = Number(distance / 1609.34).toFixed(1);
      const services = {};
      this.optServices.forEach(s => { services[s.c] = this.form.services.includes(s.c) ? 1 : 0; });
      this.form.pickup_date.setHours(this.form.pickup_time.getHours(), this.form.pickup_time.getMinutes(), 0);
      const formData = {
        pfrom_city: pfrom.city, utc_offset: pfrom.utc_offset_minutes, pto_city: pto.city,
        distance: Number(distance), services, cartype: this.form.cartype.id,
        orderAt: this.form.pickup_date.toISOString(), roundtrip: this.form.roundtrip, weight: 0, height: 0,
      };
      const addData = {
        pfrom_addr: pfrom.location, pto_addr: pto.location,
        p_dat: { city: pfrom.city, ets: this.waypointsLocation },
        orderAt: this.form.pickup_date.toISOString(),
        roundtrip: this.form.roundtrip, instruction: this.form.instruction,
      };
      this.$store.commit("setRouteData", { formData, addData });
      this.$router.push("/ride/step-2");
    },
  },
  watch: {
    "form.pickup_date"(v) {
      if (!v) {
        this.pickupTimeOpen = false;
        this.form.pickup_time = null;
        this.minPickupTimeMs = null;
        return;
      }
      this.refreshMinPickupTime();
    },
    waypointFields: {
      deep: true,
      handler() {
        const locs = [];
        this.waypointFields.forEach(w => {
          const loc = this.buildWaypointLocation(w);
          if (loc) locs.push(loc);
        });
        if (JSON.stringify(this.waypointsLocation) !== JSON.stringify(locs)) {
          this.waypointsLocation = [...locs];
          if (locs.length >= 2) {
            this.wait = true;
            // Safety: reset if DirectionsRenderer never fires within 6 seconds
            clearTimeout(this._waitTimeout);
            this._waitTimeout = setTimeout(() => { this.wait = false; }, 6000);
          }
        }
      },
    },
    waypointsLocation(v) {
      if (v.length < 2) {
        this.showRoutes = false;
        this.$nextTick(() => this.showRoutes = true);
      }
    },
  },
};
</script>

<style lang="scss" scoped>
$teal:       #199F97;
$teal-bg:    #E8F6F5;
$teal-icon:  rgba(25, 159, 151, 0.2);
$red:        #e84040;
$green:      #3fc784;
$text-dark:  #1a2a2a;
$text-mid:   #3a4a49;
$text-muted: #b0bfbe;
$input-bg:   #F4F4F4;
$tog-off-bg: #F4F4F4;

/* ─── Main wrapper grid ─────────────────────────── */
.s1-grid {
  display: grid;
  grid-template-columns: minmax(0, 1.55fr) minmax(0, 1fr);
  gap: 26px;
  align-items: stretch;
  width: 100%;
  max-width: 100%;
  min-width: 0;
  box-sizing: border-box;

  @media (max-width: 900px) {
    grid-template-columns: minmax(0, 1fr);
    gap: 20px;
  }

  @media (max-width: 480px) {
    gap: 16px;
  }
}

/* ─── Form card ─────────────────────────────────── */
.s1-form-card {
  background: #fff;
  border: 1px solid rgba(232, 236, 236, 0.9);
  border-radius: 28px;
  padding: 28px 26px;
  display: flex;
  flex-direction: column;
  box-shadow: 0 28px 80px rgba(0, 43, 43, 0.08);
  min-width: 0;
  width: 100%;
  box-sizing: border-box;
  overflow: visible;

  @media (max-width: 480px) { padding: 20px 16px; border-radius: 20px; }
}

.s1-row2--dt {
  position: relative;
  z-index: 3;
}

.s1-card-title {
  font-size: 20px;
  font-weight: 700;
  color: $text-dark;
  margin: 0 0 20px;
  font-family: 'Montserrat', sans-serif;
}

/* ─── Location pill ─────────────────────────────── */
.s1-loc-box {
  display: flex;
  align-items: center;
  gap: 10px;
  background: $input-bg;
  border: 1.5px solid transparent;
  border-radius: 30px;
  padding: 10px 16px;
  min-height: 48px;
  transition: border-color .2s, box-shadow .2s, background .2s;

  &--focus {
    border-color: $teal;
    box-shadow: 0 0 0 3px rgba(25, 159, 151, .12);
    background: #fff;
  }

  ::v-deep input {
    flex: 1;
    border: none !important;
    background: transparent !important;
    outline: none !important;
    box-shadow: none !important;
    font-size: 14px;
    color: $text-dark;
    font-family: 'Inter', 'Montserrat', sans-serif;
    padding: 0 !important;
    min-width: 0;
    width: 100%;
    &::placeholder { color: $text-muted; }

    @media (max-width: 768px) {
      font-size: 16px;
    }
  }
}

.s1-loc-input { flex: 1; min-width: 0; }

.s1-pin {
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
}

.s1-clear {
  background: none;
  border: none;
  cursor: pointer;
  color: $text-muted;
  padding: 0;
  display: flex;
  align-items: center;
  flex-shrink: 0;
  &:hover { color: $red; }
}

/* ─── My-location teal circle btn ───────────────── */
.s1-loc-btn {
  background: $teal;
  border: none;
  border-radius: 50%;
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  box-shadow: 0 8px 18px rgba(25, 159, 151, 0.25);
  cursor: pointer;
  transition: transform .15s, background .15s;
  &:hover { background: darken($teal, 6%); transform: translateY(-1px); }
}

/* ─── Drop row ──────────────────────────────────── */
.s1-drop-row {
  display: flex;
  align-items: center;
  gap: 8px;
  .s1-loc-box { flex: 1; min-width: 0; }
}

/* ─── Connector dots ────────────────────────────── */
.s1-connector {
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 20px;
  margin: 2px 0 2px 14px;
  gap: 3px;
  span {
    display: block;
    width: 3px;
    height: 5px;
    background: #b0cece;
    border-radius: 2px;
  }
}

/* ─── Date / time (pill + white icon circle) ───── */
.s1-dt-field {
  position: relative;
  min-width: 0;

  ::v-deep .mx-datepicker {
    width: 100% !important;
    display: block !important;
    max-width: 100%;
  }

  ::v-deep .mx-input-wrapper {
    width: 100%;
    display: block;
  }

  ::v-deep .mx-input,
  ::v-deep input.s1-dt-input {
    display: block !important;
    width: 100% !important;
    height: 48px !important;
    min-height: 48px !important;
    padding: 0 54px 0 18px !important;
    font-size: 14px !important;
    font-family: 'Inter', 'Montserrat', sans-serif !important;
    color: $text-dark !important;
    background: $input-bg !important;
    border: none !important;
    border-radius: 30px !important;
    box-shadow: none !important;
    outline: none !important;
    cursor: pointer;
    line-height: 48px !important;
    transition: box-shadow 0.15s, background 0.15s !important;

    &:focus {
      box-shadow: 0 0 0 2px $teal !important;
      background: #fff !important;
    }

    &::placeholder {
      color: $text-muted !important;
    }

    &:disabled,
    &.disabled {
      opacity: 0.55 !important;
      cursor: not-allowed !important;
    }

    @media (max-width: 768px) {
      font-size: 16px !important;
    }
  }

  ::v-deep .mx-icon-calendar,
  ::v-deep .mx-icon-clear,
  ::v-deep .mx-icon-time {
    display: none !important;
  }

  ::v-deep .mx-time-column .mx-time-item {
    touch-action: manipulation;
    -webkit-tap-highlight-color: transparent;
  }
}

.s1-dt-ico {
  position: absolute;
  right: 8px;
  top: 50%;
  transform: translateY(-50%);
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  pointer-events: auto;
  cursor: pointer;
  z-index: 2;
  color: $text-dark;

  .material-symbols-rounded {
    font-size: 20px;
    line-height: 1;
  }
}

/* Special Instructions combined box */
.s1-instructions-box {
  background: $input-bg;
  border-radius: 10px;
  overflow: hidden;
}

.s1-instructions-textarea {
  width: 100%;
  border: none;
  border-radius: 10px;
  padding: 11px 14px;
  font-size: 14px;
  font-family: 'Inter', 'Montserrat', sans-serif;
  color: $text-dark;
  background: $input-bg;
  outline: none;
  resize: vertical;
  min-height: 72px;
  display: block;
  transition: background .15s, box-shadow .15s;
  box-sizing: border-box;

  &:focus { background: #fff; box-shadow: inset 0 0 0 2px $teal; }
  &::placeholder { color: $text-muted; }
}

.s1-suggestions-list {
  display: flex;
  flex-direction: column;
  gap: 6px;
  padding: 12px 14px;
}

.s1-suggestion-line {
  font-size: 13px;
  font-family: 'Inter', 'Montserrat', sans-serif;
  color: $text-muted;
  line-height: 1.5;
  display: block;
}

/* Special Instructions box */
.s1-inp--text {
  width: 100%;
  border: 1.5px solid transparent;
  border-radius: 16px;
  padding: 12px 16px;
  font-size: 13px;
  line-height: 1.8;
  font-family: 'Inter', 'Montserrat', sans-serif;
  color: $text-dark;
  background: $input-bg;
  outline: none;
  height: 96px;
  resize: none;
  box-sizing: border-box;
  display: block;
  transition: border-color .2s, box-shadow .2s, background .2s;
  &:focus {
    border-color: $teal;
    box-shadow: 0 0 0 3px rgba(25, 159, 151, .12);
    background: #fff;
  }
  &::placeholder { color: $text-muted; white-space: pre-line; }

  @media (max-width: 768px) {
    font-size: 16px;
  }
}

/* ─── 2-col row ─────────────────────────────────── */
.s1-row2 {
  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(0, 1fr);
  gap: 12px;
  align-items: start;
  min-width: 0;
  width: 100%;

  @media (max-width: 700px) { grid-template-columns: minmax(0, 1fr); }
}
.s1-row2-errs { margin-top: 3px; font-size: 12px; }

/* ─── Field ─────────────────────────────────────── */
.s1-field {
  display: flex;
  flex-direction: column;
  gap: 8px;
  min-width: 0;
}

.s1-label {
  font-size: 18px;
  font-weight: 600;
  color: $text-mid;
  font-family: 'Montserrat', sans-serif;
}
.s2-label {
  font-size: 16px;
  font-weight: 500;
  color: $text-mid;
  font-family: 'Montserrat', sans-serif;
}
.s1-req { color: $red; margin-left: 2px; }
.s1-opt { color: $text-muted; font-weight: 400; font-size: 11px; }

/* ─── Toggle group ──────────────────────────────── */
.s1-toggles {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  width: 100%;
  min-width: 0;
}

.s1-tog {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 8px 12px 8px 8px;
  border: 1px solid transparent;   
  border-radius: 10px;
  background: $tog-off-bg;            
  color: $text-dark;
  font-size: 12px;
  font-weight: 500;
  font-family: 'Montserrat', sans-serif;
  cursor: pointer;
  transition: all .15s;
  white-space: nowrap;
  flex: 1 1 calc(50% - 4px);
  min-width: min(100%, 120px);
  min-height: 44px;
  box-sizing: border-box;

  @media (max-width: 480px) {
    flex: 1 1 100%;
    white-space: normal;
  }

  &:hover:not(.on) {
    background: darken($tog-off-bg, 3%);
  }

  &.on {
    background: $teal-bg;           
    border-color: $teal;               
    color: $teal;
    font-weight: 600;
  }
}

/* Icon bubble — white when unselected, teal-20% when selected */
.s1-tog-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 38px;
  height: 38px;
  border-radius: 50%;
  flex-shrink: 0;
  background: #ffffff;              
  transition: background .15s;

  &.on {
    background: $teal-icon;         
  }
}

/* ─── Error ─────────────────────────────────────── */
.s1-err {
  font-size: 12px;
  color: $red;
  font-family: 'Montserrat', sans-serif;
  min-height: 16px;
}

/* ─── Map card ──────────────────────────────────── */
.s1-map-card {
  border-radius: 28px;
  overflow: hidden;
  min-height: 460px;
  align-self: stretch;
  min-width: 0;
  width: 100%;
  box-sizing: border-box;
  background: rgba(255, 255, 255, 0.5);
  border: 10px solid rgba(255, 255, 255, 0.35);
  box-shadow: 0px 4px 18px 0px #00000014;
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  ::v-deep .vue-map-container,
  ::v-deep .vue-map {
    height: 100% !important;
    min-height: 460px;
    border-radius: 28px;
  }

  @media (max-width: 900px) {
    min-height: 300px;
    height: 300px;
    border-radius: 16px;
    border-width: 6px;
    align-self: auto;

    ::v-deep .vue-map-container,
    ::v-deep .vue-map {
      min-height: 300px;
    }
  }

  @media (max-width: 480px) {
    min-height: 260px;
    height: 260px;
    border-width: 4px;

    ::v-deep .vue-map-container,
    ::v-deep .vue-map { min-height: 260px; }
  }
}

/* ─── Spacing helpers ───────────────────────────── */
.mt-16 { margin-top: 16px; }
.mt-8  { margin-top: 8px; }
</style>

<style lang="scss">
/* Time popup uses append-to-body — lives outside scoped component tree */
.mx-datepicker-popup .mx-time-column .mx-time-item {
  touch-action: manipulation;
  -webkit-tap-highlight-color: transparent;
}
</style>