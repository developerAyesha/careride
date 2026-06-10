<template>
  <BookingLayout>
    <BkSteps :current="5" />

    <!-- Loading -->
    <div v-if="loadingOrder" class="s5-loading">
      <div class="s5-spinner" />
      <p>Loading your ride details...</p>
    </div>

    <!-- Order not found -->
    <div v-else-if="!order" class="s5-not-found">
      <span class="material-symbols-rounded s5-err-ico">error</span>
      <h4>Order not found</h4>
      <p>Please go back and try again.</p>
      <button type="button" class="bk-btn-back" @click="$router.push('/ride/step-3')">
        <span class="material-symbols-rounded">arrow_back</span> Back
      </button>
    </div>

    <template v-else>

      <div class="s5-wrapper">

        <!-- ═══ HEADER ═══ -->
        <div class="s5-top">
          <div class="s5-illus-wrap">
            <img
              src="@/assets/images/bookride/simple_ambulance.png"
              class="s5-illus-img"
              alt="Ambulance"
            />
          </div>

          <h2 class="s5-title">Your Ride has been Matched!</h2>
          <p class="s5-sub">Your driver and vehicle have been assigned. Please complete payment to confirm your ride.</p>

          <div class="s5-booking-chip">
            Booking ID : {{ formatBookingId(order.id) }}
            <button class="s5-copy-btn" type="button" @click="copyId" title="Copy">
              <span class="material-symbols-rounded">content_copy</span>
            </button>
          </div>

          <div class="s5-pay-status-wrap" v-if="order.price">
            <div class="s5-pay-status-card">
              <span class="material-symbols-rounded s5-pay-status-ico">account_balance_wallet</span>
              <span class="s5-pay-status-label">Payment status:</span>
              <span class="s5-pay-amount-text">Amount to pay : <strong>$ {{ formatPrice(order.price) }}</strong></span>
              <span class="s5-pending-badge">Pending</span>
            </div>
          </div>
        </div>

      <!-- ═══ TWO-COLUMN GRID ═══ -->
      <div class="s5-grid">

        <!-- ── LEFT: Ride details ── -->
        <div class="s5-card">
          <h5 class="s5-card-title">Ride details</h5>

          <div class="s5-stats-row">

            <div class="s5-stat">
              <span class="s5-ico-circle">
                <span class="material-symbols-rounded s5-ico-circle-symbol">calendar_month</span>
              </span>
              <div class="s5-stat-body">
                <span class="s5-stat-label">Pickup date &amp; time :</span>
                <span class="s5-stat-val">{{ formatDateTime(order.orderAt) }}</span>
              </div>
            </div>

            <div class="s5-stat">
              <span class="s5-ico-circle">
                <OneWayIcon v-if="!order.roundtrip" :width="18" :height="18" />
                <RoundTripIcon v-else :width="18" :height="18" />
              </span>
              <div class="s5-stat-body">
                <span class="s5-stat-label">Trip type :</span>
                <span class="s5-stat-val">{{ order.roundtrip ? 'Round trip' : 'One way' }}</span>
              </div>
            </div>

            <div class="s5-stat">
              <span class="s5-ico-circle">
                <WheelChairIcon v-if="Number(order.cartype) === 1" :width="18" :height="18" />
                <GurneyIcon v-else :width="18" :height="18" />
              </span>
              <div class="s5-stat-body">
                <span class="s5-stat-label">Car type :</span>
                <span class="s5-stat-val">{{ carTypeLabel(order.cartype) }}</span>
              </div>
            </div>

          </div>

          <!-- Location rows -->
          <div class="s5-locs">

            <div class="s5-loc-row" v-if="order.pfrom_addr">
              <span class="s5-ico-circle s5-ico-circle--loc">
                <PickupIcon :width="20" :height="20" />
              </span>
              <div class="s5-loc-body">
                <span class="s5-loc-label">Pickup location</span>
                <span class="s5-loc-addr">{{ order.pfrom_addr }}</span>
              </div>
              <span class="s5-loc-time-pill">{{ formatTime(order.orderAt) }}</span>
            </div>

            <div class="s5-connector" aria-hidden="true"><span /><span /><span /></div>

            <div class="s5-loc-row" v-if="order.pto_addr">
              <span class="s5-ico-circle s5-ico-circle--loc">
                <DropIcon :width="20" :height="20" />
              </span>
              <div class="s5-loc-body">
                <span class="s5-loc-label">Dropoff location</span>
                <span class="s5-loc-addr">{{ order.pto_addr }}</span>
              </div>
              <span class="s5-loc-time-pill">{{ formatTime(order.orderAt) }}</span>
            </div>

          </div>

          <!-- Extra fields -->
          <div class="s5-extra-list">
            <div class="s5-extra-row" v-if="order.distance">
              <span class="s5-extra-label">Distance :</span>
              <span class="s5-extra-val">{{ order.distance }} miles</span>
            </div>

            <div class="s5-extra-row" v-if="additionalServices">
              <span class="s5-extra-label">Additional service :</span>
              <span class="s5-extra-val">{{ additionalServices }}</span>
            </div>

            <div class="s5-extra-row" v-if="order.instruction">
              <span class="s5-extra-label">Special instructions :</span>
              <span class="s5-extra-val">{{ order.instruction }}</span>
            </div>
          </div>
        </div>

        <!-- ── RIGHT: Payment ── -->
        <div class="s5-card">
          <h5 class="s5-card-title">Payment</h5>

          <!-- Alert -->
          <b-alert
            v-if="msg.has"
            :variant="msg.type"
            dismissible show
            class="s5-alert"
            @dismissed="msg.has = false"
          >{{ msg.text }}</b-alert>

          <!-- Stripe loading -->
          <div v-if="!loadedStripe && !stripeError" class="s5-stripe-loading">
            <div class="s5-spinner" />
            <p class="s5-stripe-loading-text">Setting up secure payment...</p>
          </div>

          <!-- Real Stripe Payment Element -->
          <div v-if="loadedStripe">
            <stripe-element-payment
              ref="paymentRef"
              :pk="pk"
              :elements-options="elementsOptions"
              v-bind="stripeAccount ? { 'stripe-account': stripeAccount } : {}"
              :confirm-params="confirmParams"
              locale="en"
              @error="handleStripeError"
              @element-ready="wait = false"
            />
          </div>

          <div v-if="stripeError" class="s5-err-text">{{ stripeError }}</div>

          <div class="s5-secure-badge">
            <span class="material-symbols-rounded s5-secure-ico">lock</span>
            Payments are processed securely via Stripe
          </div>
        </div>

      </div>

        <!-- ═══ NEED HELP BANNER ═══ -->
      <div class="s5-help-banner">
        <div class="s5-help-inner">
          <div class="s5-help-icon-wrap">
            <span class="material-symbols-rounded s5-help-ico">headset_mic</span>
          </div>
          <p class="mb-0">
            <strong>Need help?</strong>
            Call or text as at <a href="tel:9493450213" class="s5-help-link">949-345-0213</a>
          </p>
        </div>
      </div>

      </div>

      <div class="bk-step-actions">
        <button type="button" class="bk-btn-back" @click.prevent="confirmCancel(order)" :disabled="waitCancel">
          <span class="material-symbols-rounded">arrow_back</span> Back
        </button>
        <button type="button" class="bk-btn-next" @click="payOrder" :disabled="wait || !loadedStripe">
          <span v-if="wait" class="s5-spinner-sm" />
          Pay $ {{ formatPrice(order.price) }}
        </button>
      </div>

    </template>
  </BookingLayout>
</template>

<script>
import BookingLayout from "@/views/layouts/booking";
import BkSteps from "@/components/booking/BkSteps";
import { mapGetters, mapActions } from "vuex";
import { carTypes } from "@/components/data";
import {
  PickupIcon,
  DropIcon,
  OneWayIcon,
  RoundTripIcon,
  WheelChairIcon,
  GurneyIcon,
} from "@/assets/icons";
import { StripeElementPayment } from "@vue-stripe/vue-stripe";
import axios from "axios";
import urls from "@/urls";

export default {
  metaInfo() { return { title: this.$appConfig.title + " | Book a Ride – Payment" }; },
  components: {
    BookingLayout,
    BkSteps,
    StripeElementPayment,
    PickupIcon,
    DropIcon,
    OneWayIcon,
    RoundTripIcon,
    WheelChairIcon,
    GurneyIcon,
  },
  data() {
    return {
      loadingOrder: true,
      singleOrder: null,
      wait: true,
      waitCancel: true,
      loadedStripe: false,
      stripeError: "",
      pk: "",
      elementsOptions: { appearance: {} },
      stripeAccount: "",
      msg: { has: false, type: "", text: "" },
    };
  },
  async mounted() {
    const orderId = this.$route.query?.id;
    if (orderId) {
      try {
        const resp = await axios.get(`${urls.URL_ORDER_SINGLE}?id=${orderId}`);
        if (resp.data?.order) this.singleOrder = resp.data.order;
      } catch (err) {
        console.error("step-5 fetch order:", err.response?.data || err.message);
      }
    }
    this.loadingOrder = false;
    if (this.order) this.generatePaymentIntent();
    else this.waitCancel = false;
  },
  computed: {
    ...mapGetters(["client"]),
    order() { return this.singleOrder || null; },
    confirmParams() {
      return { return_url: `${window.location.origin}/ride/step-6?id=${this.order?.id}` };
    },
    additionalServices() {
      const svcs = this.order?.services;
      if (!svcs) return "";
      return Object.keys(svcs).filter(k => svcs[k])
        .map(k => k.charAt(0).toUpperCase() + k.slice(1).toLowerCase()).join(", ");
    },
  },
  methods: {
    ...mapActions(["clientCancelOrder"]),
    carTypeLabel(id) { return carTypes.find(t => t.id === id)?.label || id; },
    formatDate(iso) {
      if (!iso) return "";
      return new Date(iso).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" });
    },
    formatTime(iso) {
      if (!iso) return "";
      return new Date(iso).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" });
    },
    formatDateTime(iso) {
      const date = this.formatDate(iso);
      const time = this.formatTime(iso);
      if (!date && !time) return "";
      if (!date) return time;
      if (!time) return date;
      return `${date} | ${time}`;
    },
    formatPrice(val) {
      const n = Number(val);
      if (Number.isNaN(n)) return "0.00";
      return n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    },
    formatBookingId(id) {
      if (!id) return "";
      const d = this.order?.createdAt ? new Date(this.order.createdAt) : new Date();
      const y = d.getFullYear();
      const m = String(d.getMonth() + 1).padStart(2, "0");
      const day = String(d.getDate()).padStart(2, "0");
      return `CRU-${y}-${m}${day}-${String(id).padStart(6, "0")}`;
    },
    copyId() {
      navigator.clipboard?.writeText(this.formatBookingId(this.order?.id)).catch(() => {});
    },
    async generatePaymentIntent() {
      this.loadedStripe = false; this.wait = true; this.waitCancel = true; this.stripeError = "";
      try {
        const resp = await axios.post(urls.URL_PAYMENT_CREATE, { order_id: this.order.id });
        this.stripeAccount = resp.data.acc || "";
        this.pk = resp.data.pk;
        this.elementsOptions.clientSecret = resp.data.clientSecret;
        this.loadedStripe = true;
      } catch (err) {
        const status = err.response?.status;
        const detail = err.response?.data?.detail || err.response?.data?.error || err.message;
        this.stripeError = `Payment setup failed${status ? ` (${status})` : ""}: ${detail}`;
      } finally { this.waitCancel = false; }
    },
    payOrder() {
      this.msg = { has: false, type: "", text: "" };
      this.$refs.paymentRef.submit();
    },
    handleStripeError(err) { this.msg = { has: true, type: "danger", text: err.message }; },
    confirmCancel(order) {
      this.$bvModal.msgBoxConfirm(`Cancel order #${order.id}?`, {
        title: "Cancel Confirmation", okVariant: "danger",
        okTitle: "Yes, cancel", cancelTitle: "Keep it", centered: true,
      }).then(sure => { if (sure) this.cancelOrder(order.id); }).catch(() => {});
    },
    async cancelOrder(id) {
      this.wait = true; this.waitCancel = true;
      try { await this.clientCancelOrder(id); this.$router.push("/ride/step-3"); }
      catch (err) { console.error(err); }
      finally { this.wait = false; this.waitCancel = false; }
    },
  },
};
</script>

<style lang="scss" scoped>
$teal:       #199f97;
$teal-lt:    #e8f5f4;
$red:        #e84040;
$green:      #3fc784;
$border:     #e4eaea;
$text-dark:  #1a2a2a;
$text-mid:   #4a5e5d;
$text-muted: #9aadac;
$bg:         #F4F4F4;

/* ── Force white background on layout ── */
:deep(.booking-layout),
:deep(.booking-content),
:deep(.bk-layout),
:deep(.bk-body),
:deep(.bk-wrap) {
  background: $bg !important;
}

.s5-wrapper {
  background: #fff;
  border-radius: 20px;
  padding: 28px 28px 22px;
  margin: 0 auto;
  box-shadow: 0 8px 40px rgba(0,43,43,.07);
  border: 1.5px solid rgba(25,159,151,.35);

  @media (max-width: 480px) { padding: 20px 16px; border-radius: 16px; }
}

.s5-top {
  text-align: center;
  padding-bottom: 22px;
  border-bottom: 1px solid $border;
  margin-bottom: 20px;
}

.s5-illus-wrap {
  display: flex;
  justify-content: center;
  margin-bottom: 16px;
}

.s5-illus-img {
  width: 220px;
  max-width: 100%;
  height: auto;
  display: block;
  object-fit: contain;
}

.s5-title {
  font-size: 21px;
  font-weight: 800;
  color: $text-dark;
  margin: 0 0 7px;
  font-family: 'Montserrat', sans-serif;
}

.s5-sub {
  font-size: 14px;
  color: $text-mid;
  margin: 0 0 16px;
  max-width: 600px;
  margin-left: auto;
  margin-right: auto;
  line-height: 1.55;
}

/* Booking ID chip */
.s5-booking-chip {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  background: #E8F6F5;
  border-radius: 20px;
  padding: 10px 14px;
  font-size: 12px;
  font-weight: 600;
  color: $text-dark;
  font-family: 'Montserrat', sans-serif;
  margin-bottom: 12px;
}

.s5-copy-btn {
  background: none; border: none; cursor: pointer;
  color: $teal; 
  padding: 0;
  display: flex; align-items: center;
  .material-symbols-rounded { font-size: 16px; }
}

.s5-pay-status-wrap {
  display: flex;
  justify-content: center;
  margin-top: 4px;
}

/* Payment status bar */
.s5-pay-status-card {
  display: inline-flex;
  align-items: center;
  flex-wrap: wrap;
  justify-content: center;
  gap: 8px 12px;
  background: $bg;
  border: 1px solid $border;
  border-radius: 24px;
  padding: 10px 20px;
  box-shadow: 0 2px 10px rgba(0,0,0,.05);
  max-width: 100%;
}

.s5-pay-status-ico {
  font-size: 19px;
  color: $teal;
  font-variation-settings: 'FILL' 0;
}

.s5-pay-status-label {
  font-size: 12px;
  color: $text-muted;
  font-family: 'Montserrat', sans-serif;
}

.s5-pay-amount-text {
  font-size: 12.5px;
  color: $text-dark;
  font-family: 'Montserrat', sans-serif;
  strong { font-weight: 700; }
}

.s5-pending-badge {
  background: rgba(249,115,22,.12);
  border: 1px solid rgba(249,115,22,.25);
  color: #ea580c;
  border-radius: 20px;
  padding: 3px 12px;
  font-size: 11px;
  font-weight: 600;
  font-family: 'Montserrat', sans-serif;

  &::before {
    content: "•";
    margin-right: 4px;
  }
}

.s5-grid {
  display: grid;
  grid-template-columns: 1.15fr 1fr;
  gap: 16px;
  align-items: stretch;
  @media (max-width: 860px) { grid-template-columns: 1fr; }
}

.s5-card {
  background: $bg;
  border-radius: 14px;
  padding: 18px 16px;
  border: 1px solid rgba(228,234,234,.9);
}

.s5-card-title {
  font-size: 20px;
  font-weight: 700;
  color: $text-dark;
  margin: 0 0 14px;
  font-family: 'Montserrat', sans-serif;
}

/* ══════════════════════════════════════
   RIDE DETAILS — LEFT CARD
══════════════════════════════════════ */

/* Stats row: 3 columns with vertical dividers */
.s5-stats-row {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 0;
  padding-bottom: 14px;
  border-bottom: 1px solid $border;
  margin-bottom: 14px;
  @media (max-width: 500px) { grid-template-columns: 1fr; gap: 10px; }
}

.s5-stat {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 0 12px;

  &:not(:last-child) {
    border-right: 1px solid $border;
  }

  &:first-child { padding-left: 0; }
  &:last-child { padding-right: 0; }

  @media (max-width: 500px) {
    border-right: none !important;
    padding: 0;
  }
}

.s5-ico-circle {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: #fff;
  border: 1px solid $border;
  flex-shrink: 0;

  &--loc {
    width: 40px;
    height: 40px;
  }
}

.s5-ico-circle-symbol {
  font-size: 18px;
  color: $teal;
  font-variation-settings: 'FILL' 0;
}

.s5-stat-body {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.s5-stat-label {
  font-size: 11px;
  color: $text-muted;
  font-family: 'Montserrat', sans-serif;
  line-height: 1.3;
}

.s5-stat-val {
  font-size: 12px;
  font-weight: 600;
  color: $text-dark;
  font-family: 'Montserrat', sans-serif;
  line-height: 1.3;
}

/* Location rows */
.s5-locs {
  padding-bottom: 14px;
  border-bottom: 1px solid $border;
  margin-bottom: 0;
}

.s5-loc-row {
  display: flex;
  align-items: flex-start;
  gap: 10px;
  padding: 6px 0;
}

.s5-loc-body {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 3px;
}

.s5-loc-label {
  font-size: 11px;
  color: $text-muted;
  font-family: 'Montserrat', sans-serif;
  line-height: 1.3;
}

.s5-loc-addr {
  font-size: 12px;
  color: $text-dark;
  font-weight: 500;
  font-family: 'Inter', sans-serif;
  line-height: 1.4;
}

.s5-loc-time-pill {
  flex-shrink: 0;
  font-size: 11px;
  color: $text-dark;
  white-space: nowrap;
  font-family: 'Montserrat', sans-serif;
  font-weight: 500;
  background: #fff;
  border: 1px solid $border;
  border-radius: 20px;
  padding: 5px 12px;
  margin-top: 2px;
}

/* Connector dots between pickup and dropoff (same as step-1) */
.s5-connector {
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 40px;
  margin: 2px 0 2px 0;
  gap: 3px;
  span {
    display: block;
    width: 3px;
    height: 5px;
    background: #b0cece;
    border-radius: 2px;
  }
}

/* Extra info rows with dividers */
.s5-extra-list {
  margin-top: 0;
}

.s5-extra-row {
  display: flex;
  align-items: baseline;
  flex-wrap: wrap;
  gap: 5px;
  font-size: 12px;
  padding: 11px 0;
  border-bottom: 1px solid $border;

  &:last-child {
    border-bottom: none;
    padding-bottom: 0;
  }

  &:first-child {
    padding-top: 12px;
  }
}

.s5-extra-label {
  color: $text-muted;
  font-family: 'Montserrat', sans-serif;
  white-space: nowrap;
  font-size: 11.5px;
}

.s5-extra-val {
  color: $text-dark;
  font-weight: 500;
  font-family: 'Inter', sans-serif;
  font-size: 14px;
}

/* ══════════════════════════════════════
   PAYMENT — RIGHT CARD
══════════════════════════════════════ */
.s5-pay-method-label {
  font-size: 12.5px;
  font-weight: 600;
  color: $text-dark;
  margin: 0 0 9px;
  font-family: 'Montserrat', sans-serif;
}

/* Payment logo pills */
.s5-pay-methods {
  display: flex;
  gap: 7px;
  margin-bottom: 16px;
}

.s5-pay-logo {
  height: 36px;
  min-width: 52px;
  padding: 0 10px;
  border-radius: 8px;
  border: 1.5px solid $border;
  background: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: border-color .15s, box-shadow .15s;
  &:hover { border-color: $teal; }
  &--active {
    border-color: $teal;
    box-shadow: 0 0 0 2px rgba(25,159,151,.12);
    background: #fff;
  }

  /* Mastercard: two overlapping circles */
  .mc-red, .mc-yellow {
    width: 18px; height: 18px; border-radius: 50%; display: block;
  }
  .mc-red    { background: #eb001b; margin-right: -7px; position: relative; z-index: 1; }
  .mc-yellow { background: #f79e1b; }

  /* PayPal */
  .pp-label {
    font-size: 10.5px; font-weight: 800;
    color: #003087; font-family: Arial, sans-serif;
    em { color: #009cde; font-style: normal; }
  }

  /* Visa */
  .visa-label {
    font-size: 13px; font-weight: 900; font-style: italic;
    color: #1a1f71; font-family: Arial, sans-serif; letter-spacing: 0.5px;
  }

  /* Amex */
  &--amex {
    background: #016fd0; border-color: #016fd0;
    &.s5-pay-logo--active { border-color: #0158a8; }
    .amex-label {
      font-size: 6.5px; font-weight: 700; color: #fff;
      text-align: center; line-height: 1.25;
      text-transform: uppercase; font-family: Arial, sans-serif; letter-spacing: 0.2px;
    }
  }
}

/* ── Card form fields ── */
.s5-card-form { }

/* Two-column field row */
.s5-field-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 11px;
  margin-bottom: 11px;
  @media (max-width: 480px) { grid-template-columns: 1fr; }
}

.s5-field {
  display: flex;
  flex-direction: column;
  gap: 5px;
}

.s5-field-label {
  font-size: 11px;
  font-weight: 600;
  color: $text-dark;
  font-family: 'Montserrat', sans-serif;
}

.s5-field-input {
  height: 40px;
  border: 1.5px solid $border;
  border-radius: 10px;
  padding: 0 12px;
  font-size: 12px;
  color: $text-dark;
  font-family: 'Inter', sans-serif;
  background: #fff;
  outline: none;
  width: 100%;
  box-sizing: border-box;
  transition: border-color .15s;
  &::placeholder { color: $text-muted; font-size: 11.5px; }
  &:focus { border-color: $teal; background: $bg; }
}

/* Input with trailing icon */
.s5-field-icon-wrap {
  position: relative;
  .s5-field-input { padding-right: 32px; }
}

.s5-field-icon {
  position: absolute;
  right: 9px;
  top: 50%;
  transform: translateY(-50%);
  font-size: 15px;
  color: $text-muted;
  pointer-events: none;
}

/* Save card checkbox row */
.s5-save-row {
  display: flex;
  align-items: center;
  gap: 7px;
}

.s5-checkbox {
  width: 16px; 
  height: 16px;
  accent-color: $teal;
  cursor: pointer;
  border-radius: 3px;
}

.s5-save-label {
  font-size: 12px;
  color: $text-dark;
  font-family: 'Montserrat', sans-serif;
  cursor: pointer;
  margin-top: 8px;
}

/* Alert */
.s5-alert { margin-bottom: 12px; }

/* Error text */
.s5-err-text {
  font-size: 12px; color: $red;
  font-family: 'Montserrat', sans-serif; margin-top: 8px;
}

/* Secure badge */
.s5-secure-badge {
  display: flex; align-items: center; gap: 5px;
  font-size: 11px; color: $text-muted;
  font-family: 'Montserrat', sans-serif;
  justify-content: center;
  margin-top: 14px;
}

.s5-secure-ico { font-size: 13px; color: $green; }

/* ══════════════════════════════════════
   NEED HELP BANNER
══════════════════════════════════════ */
.s5-help-banner {
  margin: 30px auto 0;
  background: $teal-lt;
  border-radius: 14px;
  border: 1px solid rgba(25,159,151,.15);
  padding: 20px;
}

.s5-help-inner {
  display: flex;
  align-items: center;
  gap: 12px;
  justify-content: center;
}

/* Circle behind icon */
.s5-help-icon-wrap {
  width: 42px;
  height: 42px;
  border-radius: 50%;
  background: #C9E8E7;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.s5-help-ico {
  font-size: 22px;
  color: #000;          
  font-variation-settings: 'FILL' 0;
}

.s5-help-banner p {
  font-size: 13px;
  color: #4a5e5d;
  margin: 0;
  font-family: 'Inter', 'Montserrat', sans-serif;
}

.s5-help-link {
  color: $teal;
  font-weight: 700;
  text-decoration: none;
  &:hover { text-decoration: underline; }
}

/* ══════════════════════════════════════
   LOADING / NOT FOUND
══════════════════════════════════════ */
.s5-loading {
  display: flex; flex-direction: column; align-items: center;
  justify-content: center; gap: 14px; padding: 60px 20px;
  p { font-size: 13px; color: $text-muted; margin: 0; }
}

.s5-not-found {
  display: flex; flex-direction: column; align-items: center;
  gap: 8px; padding: 50px 20px; text-align: center;
  h4 { font-family: 'Montserrat', sans-serif; color: $text-dark; margin: 0; }
  p  { font-size: 13px; color: $text-muted; margin: 0; }
}

.s5-err-ico { font-size: 46px; color: $red; }

.s5-stripe-loading {
  display: flex; flex-direction: column; align-items: center; gap: 10px;
  padding: 30px 0;
}
.s5-stripe-loading-text {
  font-size: 13px; color: $text-muted;
  font-family: 'Montserrat', sans-serif; margin: 0;
}

.s5-spinner {
  width: 32px; height: 32px;
  border: 3px solid rgba(25,159,151,.2);
  border-top-color: $teal;
  border-radius: 50%; animation: spin .8s linear infinite;
}

.s5-spinner-sm {
  display: inline-block; width: 15px; height: 15px;
  border: 2px solid rgba(255,255,255,.4);
  border-top-color: #fff;
  border-radius: 50%; animation: spin .8s linear infinite;
}

@keyframes spin { to { transform: rotate(360deg); } }
</style>