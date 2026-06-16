<template>
  <BookingLayout>
    <BkSteps :current="3" />

    <!-- Two-column grid: price card left, map right -->
    <div class="s3-grid">
      <!-- Left: price card -->
      <div class="s3-price-card">
        <h5 class="s3-card-title">Review Pricing :</h5>

        <div class="s3-price-body">
          <!-- Loading -->
          <div v-if="loading" class="s3-loading">
            <div class="s3-spinner" />
            <p>Searching for available providers...</p>
          </div>

          <!-- Prices loaded or estimated -->
          <template v-else>
            <div class="s3-price-icon">
              <span class="material-symbols-rounded">attach_money</span>
            </div>
            <p class="s3-price-label">Your estimated ride price</p>
            <div class="s3-price-range">
              ${{ priceMin }} – ${{ priceMax }}
            </div>
            <div class="s3-price-note">
              <span class="material-symbols-rounded s3-info-ico">info</span>
              Your final price may vary based on availability, traffic, and selected assistance needs.
            </div>
          </template>
        </div>
      </div>

      <!-- Right: Map -->
      <div class="s3-map-card">
        <GmapMap
          :center="center"
          :zoom="mapZoom"
          map-type-id="terrain"
          style="width:100%;height:100%;min-height:400px;"
        >
          <template v-if="waypoints.length < 2">
            <GmapMarker v-for="w in waypoints" :key="w.id" :position="w.position" />
          </template>
          <DirectionsRenderer
            v-if="waypoints.length >= 2"
            :locations="waypoints"
            travelMode="DRIVING"
          />
        </GmapMap>
      </div>
    </div>

    <!-- Ride information card — full width below grid -->
    <div class="s3-info-card" v-if="info">
      <h6 class="s3-info-title">Your ride information</h6>
      <div class="s3-info-grid">
        <div class="s3-info-item" v-if="info.pfrom_addr">
          <span class="s3-info-label">Pickup location :</span>
          <span class="s3-info-val">{{ info.pfrom_addr }}</span>
        </div>
        <div class="s3-info-item" v-if="info.orderAt">
          <span class="s3-info-label">Pickup date :</span>
          <span class="s3-info-val">{{ formatDate(info.orderAt) }}</span>
        </div>
        <div class="s3-info-item" v-if="info.orderAt">
          <span class="s3-info-label">Pickup time :</span>
          <span class="s3-info-val">{{ formatTime(info.orderAt) }}</span>
        </div>
        <div class="s3-info-item" v-if="info.distance">
          <span class="s3-info-label">Distance :</span>
          <span class="s3-info-val">{{ info.distance }} miles</span>
        </div>
        <div class="s3-info-item" v-if="info.instruction">
          <span class="s3-info-label">Special Instruction :</span>
          <span class="s3-info-val">{{ info.instruction }}</span>
        </div>
        <div class="s3-info-item s3-row2-start" v-if="info.pto_addr">
          <span class="s3-info-label">Dropoff location :</span>
          <span class="s3-info-val">{{ info.pto_addr }}</span>
        </div>
        <div class="s3-info-item" v-if="info.roundtrip !== undefined">
          <span class="s3-info-label">Trip type :</span>
          <span class="s3-info-val">{{ info.roundtrip ? 'Round Trip' : 'One way' }}</span>
        </div>
        <div class="s3-info-item" v-if="info.cartype">
          <span class="s3-info-label">Car type :</span>
          <span class="s3-info-val">{{ carTypeLabel(info.cartype) }}</span>
        </div>
        <div class="s3-info-item" v-if="additionalServices">
          <span class="s3-info-label">Additional service :</span>
          <span class="s3-info-val">{{ additionalServices }}</span>
        </div>
      </div>
    </div>

    <div class="s3-err" v-if="msg.has">{{ msg.text }}</div>

    <!-- Login required modal -->
    <b-modal
      v-model="showLoginModal"
      title="Login Required"
      centered
      hide-footer
      no-close-on-backdrop
    >
      <div class="s3-login-modal">
        <div class="s3-login-icon">
          <span class="material-symbols-rounded">lock</span>
        </div>
        <p class="s3-login-msg">You need to be logged in to submit a ride request.</p>
        <div class="s3-login-actions">
          <button class="s3-login-btn-primary" @click="goToLogin">Log In</button>
          <button class="s3-login-btn-secondary" @click="showLoginModal = false">Cancel</button>
        </div>
      </div>
    </b-modal>

    <div class="bk-step-actions">
      <button type="button" class="bk-btn-back" @click.prevent="$router.push('/ride/step-2')">
        <span class="material-symbols-rounded">arrow_back</span> Back
      </button>
      <button
        type="button"
        class="bk-btn-next"
        :disabled="wait || loading"
        @click.prevent="handleSubmit"
      >
        <span v-if="wait" class="s3-spinner-sm" />
        Submit Ride Request <span class="material-symbols-rounded">arrow_forward</span>
      </button>
    </div>

  </BookingLayout>
</template>

<script>
import BookingLayout from "@/views/layouts/booking";
import BkSteps from "@/components/booking/BkSteps";
import DirectionsRenderer from "@/components/DirectionsRenderer";
import { mapGetters } from "vuex";
import { carTypes } from "@/components/data";
import axios from "axios";
import urls from "@/urls";

// Last-resort fallback only if both API calls fail completely
const RATE = { 1: { base: 80, mile: 5.5 }, 2: { base: 100, mile: 6.5 } };

export default {
  metaInfo() { return { title: this.$appConfig.title + " | Book a Ride – Review Pricing" }; },
  components: { BookingLayout, BkSteps, DirectionsRenderer },
  data() {
    return {
      loading: true,
      wait: false,
      isEstimate: false,
      vendorlist: [],
      msg: { has: false, type: "", text: "" },
      estimatedMin: 0,
      estimatedMax: 0,
      showLoginModal: false,
    };
  },
  created() {
    if (!this.routeData) {
      this.$router.push("/ride/step-1").catch(() => {});
      return;
    }
    this.searchVendors();
  },
  computed: {
    ...mapGetters(["routeData", "authorized"]),
    info() {
      if (!this.routeData) return null;
      return { ...this.routeData.formData, ...this.routeData.addData };
    },
    waypoints() {
      return this.routeData?.addData?.p_dat?.ets || [];
    },
    center() {
      if (this.waypoints.length) return this.waypoints[0].position;
      return { lat: 40.1966701, lng: -100.6248741 };
    },
    mapZoom() {
      return this.waypoints.length >= 2 ? 6 : 5;
    },
    priceMin() {
      if (this.vendorlist.length) {
        const prices = this.vendorlist.map(v => Number(v.order?.price || 0));
        return Math.min(...prices).toFixed(0);
      }
      return this.estimatedMin.toFixed(0);
    },
    priceMax() {
      if (this.vendorlist.length) {
        const prices = this.vendorlist.map(v => Number(v.order?.price || 0));
        return Math.max(...prices).toFixed(0);
      }
      return this.estimatedMax.toFixed(0);
    },
    additionalServices() {
      const svcs = this.info?.services;
      if (!svcs) return "";
      return Object.keys(svcs).filter(k => svcs[k]).map(k =>
        k.charAt(0) + k.slice(1).toLowerCase()
      ).join(", ");
    },
  },
  methods: {
    carTypeLabel(id) {
      return carTypes.find(t => t.id === id)?.label || id;
    },
    formatDate(iso) {
      if (!iso) return "";
      return new Date(iso).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" });
    },
    formatTime(iso) {
      if (!iso) return "";
      return new Date(iso).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" });
    },
    async calcEstimate() {
      const dist = Number(this.info?.distance) || 0;
      const cartypeId = Number(this.info?.cartype) || 1;
      try {
        const resp = await axios.get(
          `${urls.URL_VENDOR_PRICE_RANGE}?cartype=${cartypeId}&distance=${dist}`
        );
        if (resp.data?.min != null && resp.data?.max != null) {
          this.estimatedMin = resp.data.min;
          this.estimatedMax = resp.data.max;
          this.isEstimate = true;
          return;
        }
      } catch { /* fall through to hardcoded */ }
      // Last resort if DB call also fails
      const r = RATE[cartypeId] || RATE[1];
      const raw = r.base + r.mile * dist;
      this.estimatedMin = Math.round(raw);
      this.estimatedMax = Math.round(raw * 1.12);
      this.isEstimate = true;
    },
    async searchVendors() {
      this.loading = true;
      try {
        const resp = await axios.post(urls.URL_ORDER_VENDOR_SEARCH, { ...this.routeData.formData });
        this.vendorlist = resp.data.vendorlist?.items || [];
        if (!this.vendorlist.length) await this.calcEstimate();
      } catch {
        await this.calcEstimate();
      } finally {
        this.loading = false;
      }
    },
    goToLogin() {
      this.showLoginModal = false;
      this.$router.push({ path: "/login", query: { redirect: "/ride/step-3", tab: "user" } });
    },
    async handleSubmit() {
      if (!this.authorized) {
        this.showLoginModal = true;
        return;
      }
      this.wait = true;
      this.msg = { has: false, type: "", text: "" };

      try {
        const payload = {
          ...this.routeData.addData,
          ...this.routeData.formData,
        };
        if (this.vendorlist.length) {
          payload.vendor_ids = this.vendorlist.map(v => v.id);
        }

        // Backend expects flat strings; contact/phone max 16 chars (digits only)
        const normalizePhone = (v) => {
          let digits = String(v || '').replace(/[^0-9]/g, '');
          if (digits.length > 16) digits = digits.slice(-16);
          return digits;
        };
        if (payload.contact && typeof payload.contact === 'object') {
          payload.contact_first = payload.contact.first || '';
          payload.contact_last  = payload.contact.last  || '';
          const phone = normalizePhone(payload.contact.phone);
          payload.contact_phone = phone;
          payload.contact       = phone;
        } else if (typeof payload.contact === 'string') {
          payload.contact = normalizePhone(payload.contact);
        }
        if (payload.contact_phone) {
          payload.contact_phone = normalizePhone(payload.contact_phone);
        }
        delete payload.patient;

        const resp = await axios.post(urls.URL_ORDER_CREATE, payload);

        const orderId = resp.data.order?.id;
        if (!orderId) throw new Error("Order ID missing from response");

        await this.$store.dispatch("fetchClientOrderlist");
        this.$store.commit("setRouteData", null);
        this.$router.push(`/ride/step-4?id=${orderId}`);
      } catch (err) {
        const status = err.response?.status;
        const detail = err.response?.data?.detail || err.response?.data?.error || err.message;
        this.msg = { has: true, type: "danger", text: `Error${status ? ` ${status}` : ""}: ${detail || "Could not submit request."}` };
      } finally {
        this.wait = false;
      }
    },
  },
};
</script>

<style lang="scss" scoped>
$teal: #199f97;
$teal-lt: #e8f5f4;
$red: #e84040;
$border: #e8ecec;
$text-dark: #202020;
$text-muted: #747574;

/* ── Two-column grid ── */
.s3-grid {
  display: grid;
  grid-template-columns: 1.6fr 1fr;
  gap: 24px;
  align-items: stretch;

  @media (max-width: 900px) {
    grid-template-columns: 1fr;
  }
}

/* ── Price card ── */
.s3-price-card {
  background: #fff;
  border-radius: 24px;
  padding: 28px 24px;
  display: flex;
  flex-direction: column;
  box-shadow: 0 20px 60px rgba(0,43,43,.08);
  border: 1px solid rgba(232,236,236,.9);

  @media (max-width: 480px) { padding: 20px 16px; border-radius: 18px; }
}

.s3-card-title {
  font-size: 20px;
  font-weight: 700;
  color: $text-dark;
  margin: 0 0 20px;
  font-family: 'Montserrat', sans-serif;
}

.s3-price-body {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  padding: 20px 0;
}

.s3-price-icon {
  width: 72px;
  height: 72px;
  border-radius: 50%;
  background: #199F97;
  border: 2px solid rgba(25,159,151,.2);
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 18px;

  .material-symbols-rounded {
    font-size: 50px;
    font-weight: 900;
    color: white;
    font-variation-settings: 'FILL' 1;
  }
}

.s3-price-label {
  font-size: 12px;
  color: $text-muted;
  margin: 0 0 10px;
  font-family: 'Inter', 'Montserrat', sans-serif;
}

.s3-price-range {
  font-size: 24px;
  font-weight: 700;
  color: $text-dark;
  font-family: 'Montserrat', sans-serif;
  margin: 0 0 18px;
}

.s3-price-note {
  display: flex;
  align-items: flex-start;
  gap: 6px;
  font-size: 12px;
  color: #6b7c7b;
  background: #f7fdfb;
  border: 1px solid $border;
  border-radius: 10px;
  padding: 10px 14px;
  text-align: left;
  line-height: 1.5;
  margin-bottom: 20px;
}

.s3-info-ico {
  font-size: 20px;
  color: #6b7c7b;
  flex-shrink: 0;
  margin-top: 1px;
  font-variation-settings: 'FILL' 0;
}


/* ── Map card ── */
.s3-map-card {
 border-radius: 28px;
  overflow: hidden;
  min-height: 460px;
  align-self: stretch;
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
    min-height: 280px;
    height: 280px;
    border-radius: 16px;
    align-self: auto;
    ::v-deep .vue-map-container,
    ::v-deep .vue-map { min-height: 280px; }
  }
}

/* ── Ride info card ── */
.s3-info-card {
  background: #fff;
  border-radius: 20px;
  padding: 22px 24px;
  margin-top: 20px;
  box-shadow: 0 8px 32px rgba(0,43,43,.07);
  border: 1px solid rgba(232,236,236,.9);

  @media (max-width: 480px) { padding: 16px; border-radius: 14px; }
}

.s3-info-title {
  font-size: 15px;
  font-weight: 700;
  color: $text-dark;
  margin: 0 0 16px;
  font-family: 'Montserrat', sans-serif;
}

.s3-info-grid {
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: 14px 10px;

  @media (max-width: 900px) { grid-template-columns: repeat(3, 1fr); }
  @media (max-width: 600px) { grid-template-columns: repeat(2, 1fr); }
  @media (max-width: 380px) { grid-template-columns: 1fr; }
}

.s3-info-item {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.s3-row2-start {
  grid-column: 1;
}

.s3-info-label {
  font-size: 11px;
  color: $text-muted;
  font-weight: 500;
  font-family: 'Montserrat', sans-serif;
}

.s3-info-val {
  font-size: 16px;
  color: $text-dark;
  font-weight: 600;
  font-family: 'Inter', 'Montserrat', sans-serif;
  word-break: break-word;
}

/* ── Error ── */
.s3-err {
  font-size: 13px;
  color: $red;
  margin-top: 12px;
  text-align: center;
  font-family: 'Montserrat', sans-serif;
}

/* ── Loading ── */
.s3-loading {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 14px;
  padding: 30px 0;

  p { font-size: 13px; color: $text-muted; margin: 0; }
}

.s3-spinner {
  width: 34px;
  height: 34px;
  border: 3px solid $teal-lt;
  border-top-color: $teal;
  border-radius: 50%;
  animation: spin .8s linear infinite;
}

.s3-spinner-sm {
  display: inline-block;
  width: 16px;
  height: 16px;
  border: 2px solid rgba(255,255,255,.4);
  border-top-color: #fff;
  border-radius: 50%;
  animation: spin .8s linear infinite;
  margin-right: 6px;
}

@keyframes spin { to { transform: rotate(360deg); } }

/* ── Login modal ── */
.s3-login-modal {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 12px 0 8px;
  text-align: center;
}

.s3-login-icon {
  width: 56px;
  height: 56px;
  border-radius: 50%;
  background: #e8f5f4;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 16px;

  .material-symbols-rounded {
    font-size: 28px;
    color: $teal;
  }
}

.s3-login-msg {
  font-size: 15px;
  color: #3a4a49;
  font-family: 'Inter', 'Montserrat', sans-serif;
  margin-bottom: 24px;
  line-height: 1.5;
}

.s3-login-actions {
  display: flex;
  gap: 12px;
  width: 100%;
  justify-content: center;
}

.s3-login-btn-primary {
  background: $teal;
  color: #fff;
  border: none;
  border-radius: 24px;
  padding: 10px 32px;
  font-size: 14px;
  font-weight: 600;
  font-family: 'Montserrat', sans-serif;
  cursor: pointer;
  transition: background .15s;
  &:hover { background: darken(#199f97, 8%); }
}

.s3-login-btn-secondary {
  background: #f4f4f4;
  color: #505655;
  border: none;
  border-radius: 24px;
  padding: 10px 32px;
  font-size: 14px;
  font-weight: 500;
  font-family: 'Montserrat', sans-serif;
  cursor: pointer;
  transition: background .15s;
  &:hover { background: #e8ecec; }
}
</style>