<template>
  <BookingLayout>
    <BkSteps :current="6" />

    <div v-if="loading" class="s6-loading">
      <div class="s6-spinner" />
      <p>Loading confirmation...</p>
    </div>

    <div v-else-if="!order" class="s6-not-found">
      <span class="material-symbols-rounded s6-err-ico">error</span>
      <h4>Booking not found</h4>
      <p>We could not load your ride confirmation.</p>
      <button type="button" class="bk-btn-back" @click="$router.push('/')">Return to home</button>
    </div>

    <div v-else class="s6-wrapper">
      <!-- Header -->
      <div class="s6-top">
        <div class="s6-check-wrap">
          <span class="material-symbols-rounded s6-check-ico">check_circle</span>
        </div>

        <h2 class="s6-title">Your ride is confirmed</h2>
        <p class="s6-sub">
          Successful Paid <strong>${{ formatPrice(order.price) }}</strong> and Your payment was successful and your ride has been scheduled successfully.
        </p>

        <div class="s6-booking-chip">
          <span class="material-symbols-rounded s6-chip-ico">confirmation_number</span>
          Booking ID : <strong>{{ formatBookingId(order.id) }}</strong>
          <button type="button" class="s6-copy-btn" @click="copyId" title="Copy booking ID">
            <span class="material-symbols-rounded">content_copy</span>
          </button>
        </div>

        <div class="s6-info-bar">
          <span class="material-symbols-rounded s6-info-bar-ico">info</span>
          You can edit or cancel your booking before the driver begins the trip.
        </div>
      </div>

      <!-- Your ride + Payment details -->
      <div class="s6-grid">
        <div class="s6-card s6-card--ride">
          <h5 class="s6-card-title">Your ride</h5>

          <div class="s6-vehicle-box">
            <div class="s6-icon-circle s6-icon-circle--vehicle">
              <img
                src="@/assets/images/bookride/small_ambulance.png"
                class="s6-vehicle-img"
                alt="Vehicle"
              />
            </div>
            <div class="s6-vehicle-info">
              <span class="s6-vehicle-label">Vehicle :</span>
              <strong class="s6-vehicle-name">{{ carTypeLabel(order.cartype) }}</strong>
              <span class="s6-vehicle-model" v-if="vehicleModel">{{ vehicleModel }}</span>
            </div>
            <div class="s6-vehicle-actions">
              <a
                :href="`tel:${rideContactPhone}`"
                class="s6-action-btn s6-action-btn--filled"
                :title="rideContactLabel"
              >
                <span class="material-symbols-rounded">call</span>
              </a>
              <button type="button" class="s6-action-btn s6-action-btn--filled" title="Chat">
                <span class="material-symbols-rounded">chat_bubble</span>
              </button>
            </div>
          </div>

          <div class="s6-driver-note">
            <span class="s6-icon-circle s6-icon-circle--note">
              <span class="material-symbols-rounded">info</span>
            </span>
            <p class="s6-driver-note-text">
              Your driver will contact you before arrival and assistance will be provided at pickup.
            </p>
          </div>
        </div>

        <div class="s6-card">
          <h5 class="s6-card-title">Payment details</h5>
          <div class="s6-pay-panel">
          <div class="s6-pay-rows">
            <div class="s6-pay-row" v-if="transactionId">
              <span class="s6-pay-label">Transaction ID</span>
              <span class="s6-pay-val">{{ transactionId }}</span>
            </div>
            <div class="s6-pay-row" v-if="paymentDate">
              <span class="s6-pay-label">Date</span>
              <span class="s6-pay-val">{{ paymentDate }}</span>
            </div>
            <div class="s6-pay-row">
              <span class="s6-pay-label">Type of payment</span>
              <span class="s6-pay-val">{{ paymentType }}</span>
            </div>
            <div class="s6-pay-row" v-if="order.price">
              <span class="s6-pay-label">Amount</span>
              <span class="s6-pay-val">${{ formatPrice(order.price) }}</span>
            </div>
            <div class="s6-pay-row">
              <span class="s6-pay-label">Status</span>
              <span class="s6-pay-val s6-pay-success">{{ paymentStatus }}</span>
            </div>
          </div>
          </div>
        </div>
      </div>

      <!-- Booking confirmation sent -->
      <div class="s6-confirm-bar">
        <div class="s6-confirm-block s6-confirm-block--status">
          <span class="s6-icon-circle s6-icon-circle--confirm">
            <span class="material-symbols-rounded">mail</span>
          </span>
          <div class="s6-confirm-copy">
            <p class="s6-confirm-title">Booking confirmation sent</p>
            <p class="s6-confirm-sub">A confirmation email and SMS have been sent to you with ride details.</p>
          </div>
        </div>

        <div class="s6-confirm-divider" aria-hidden="true" />

        <div class="s6-confirm-block">
          <span class="s6-icon-circle s6-icon-circle--info">
            <span class="material-symbols-rounded">mail</span>
          </span>
          <div class="s6-confirm-copy">
            <p class="s6-contact-label">Email :</p>
            <p class="s6-contact-val">{{ userEmail || 'Not set' }}</p>
          </div>
        </div>

        <div class="s6-confirm-block" v-if="userPhone">
          <span class="s6-icon-circle s6-icon-circle--info">
            <span class="material-symbols-rounded">phone</span>
          </span>
          <div class="s6-confirm-copy">
            <p class="s6-contact-label">Phone :</p>
            <p class="s6-contact-val">{{ userPhone }}</p>
          </div>
        </div>
      </div>

      <!-- What happens next -->
      <div class="s6-next-section">
        <h5 class="s6-next-title">What happens next?</h5>
        <div class="s6-next-grid">
          <div class="s6-next-card" v-for="item in nextItems" :key="item.icon">
            <span class="s6-icon-circle s6-icon-circle--next">
              <span class="material-symbols-rounded">{{ item.icon }}</span>
            </span>
            <p class="s6-next-text">{{ item.text }}</p>
          </div>
        </div>
      </div>

      <!-- Need help -->
      <div class="s6-help-banner">
        <div class="s6-help-inner">
          <div class="s6-help-icon-wrap">
            <span class="material-symbols-rounded s6-help-ico">headset_mic</span>
          </div>
          <p class="mb-0">
            <strong>Need help?</strong>
            Call or text as at <a href="tel:9493450213" class="s6-help-link">949-345-0213</a>
          </p>
        </div>
      </div>

      <div class="bk-step-actions">
        <button type="button" class="bk-btn-back" @click="$router.push('/')">
          Return to home
        </button>
        <button type="button" class="bk-btn-next" @click="goToBookingDetails">
          View booking details
        </button>
      </div>
    </div>
  </BookingLayout>
</template>

<script>
import BookingLayout from "@/views/layouts/booking";
import BkSteps from "@/components/booking/BkSteps";
import { mapGetters } from "vuex";
import { carTypes } from "@/components/data";
import axios from "axios";
import urls from "@/urls";

export default {
  metaInfo() {
    return { title: this.$appConfig.title + " | Booking Confirmed" };
  },
  components: { BookingLayout, BkSteps },
  data() {
    return {
      loading: true,
      singleOrder: null,
      supportPhone: "9493450213",
      nextItems: [
        { icon: "description", text: "Driver and vehicle details will be shared before pickup." },
        { icon: "notifications", text: "You'll receive ride updates through SMS and email notifications." },
        { icon: "mail", text: "Your driver may contact you before arrival for pickup coordination." },
        { icon: "person", text: "Assistance will be provided during pickup and dropoff based on your selected service needs." },
      ],
    };
  },
  async mounted() {
    const orderId = this.$route.query?.id;
    if (orderId) {
      try {
        const resp = await axios.get(`${urls.URL_ORDER_SINGLE}?id=${orderId}`);
        if (resp.data?.order) this.singleOrder = resp.data.order;
      } catch (_) { /* fall back to order list */ }
    }

    if (this.$route.query.redirect_status === "succeeded" && orderId) {
      try {
        await axios.post(urls.URL_PAYMENT_DEV_HOLD, { order_id: orderId });
      } catch (_) { /* non-critical in dev */ }
    }

    await this.$store.dispatch("fetchClientOrderlist");
    if (this.orderId) this.$store.commit("setRouteData", null);
    this.loading = false;
  },
  computed: {
    ...mapGetters(["client", "user"]),
    orderId() {
      return this.$route.query?.id;
    },
    order() {
      if (this.singleOrder) return this.singleOrder;
      if (!this.orderId) return null;
      return this.client?.orderlist?.items?.find(o => String(o.id) === String(this.orderId)) || null;
    },
    transactionId() {
      const pi = this.$route.query?.payment_intent;
      if (!pi) return "";
      const raw = String(pi).replace(/\D/g, "").slice(-12);
      if (!raw) return "";
      return raw.replace(/(\d{4})(?=\d)/g, "$1 ").trim();
    },
    paymentDate() {
      const iso = this.order?.paidAt || this.order?.updatedAt || this.order?.createdAt;
      if (!iso) return "";
      return new Date(iso).toLocaleDateString("en-US", { day: "numeric", month: "long", year: "numeric" });
    },
    paymentType() {
      return "Credit card";
    },
    paymentStatus() {
      if (this.$route.query?.redirect_status === "succeeded") return "Success";
      if (this.order?.paystatus === 1 || this.order?.paid) return "Success";
      return "Success";
    },
    userEmail() {
      return this.user?.email || this.client?.profile?.email || this.client?.email || "";
    },
    userPhone() {
      const raw =
        this.order?.contact_phone ||
        this.order?.contact ||
        this.user?.login ||
        this.client?.profile?.login ||
        "";
      return this.formatPhoneDisplay(raw);
    },
    vehicleModel() {
      const car = this.order?.car;
      if (!car) return "";
      return car.model || car.car_model || "";
    },
    rideContactPhone() {
      const raw =
        this.order?.driver?.login ||
        this.order?.vendor?.login ||
        this.order?.vendor?.phone ||
        this.supportPhone;
      return String(raw || "").replace(/\D/g, "") || this.supportPhone;
    },
    rideContactLabel() {
      if (this.order?.driver?.login) return "Call driver";
      if (this.order?.vendor?.login) return "Call vendor";
      return "Call support";
    },
  },
  methods: {
    carTypeLabel(id) {
      return carTypes.find(t => Number(t.id) === Number(id))?.label || id;
    },
    formatPrice(val) {
      const n = Number(val);
      if (Number.isNaN(n)) return "0.00";
      return n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    },
    formatPhoneDisplay(v) {
      const d = String(v || "").replace(/\D/g, "");
      if (d.length === 10) return `(${d.slice(0, 3)}) ${d.slice(3, 6)}-${d.slice(6)}`;
      if (d.length === 11 && d[0] === "1") {
        return `(${d.slice(1, 4)}) ${d.slice(4, 7)}-${d.slice(7)}`;
      }
      return v || "";
    },
    formatBookingId(id) {
      if (!id) return "";
      const d = this.order?.createdAt ? new Date(this.order.createdAt) : new Date();
      const y = d.getFullYear();
      const m = String(d.getMonth() + 1).padStart(2, "0");
      const day = String(d.getDate()).padStart(2, "0");
      return `ORD-${y}-${m}${day}-${String(id).padStart(6, "0")}`;
    },
    copyId() {
      const text = this.formatBookingId(this.order?.id);
      navigator.clipboard?.writeText(text).catch(() => {});
    },
    goToBookingDetails() {
      const id = this.order?.id || this.orderId;
      if (id) {
        this.$router.push({ path: "/client/orders", query: { id: String(id) } }).catch(() => {});
      } else {
        this.$router.push("/client/orders").catch(() => {});
      }
    },
  },
};
</script>

<style lang="scss" scoped>
$teal: #199f97;
$teal-lt: #e8f5f4;
$green: #3fc784;
$border: #e4eaea;
$text-dark: #1a2a2a;
$text-mid: #4a5e5d;
$text-muted: #747574;
$bg: #f4f4f4;
$card-bg: #F4F4F4;

:deep(.bk-layout),
:deep(.bk-content) {
  background: $bg !important;
}

.s6-loading,
.s6-not-found {
  text-align: center;
  padding: 48px 20px;
  color: $text-mid;
  font-family: "Montserrat", sans-serif;
}

.s6-spinner {
  width: 36px;
  height: 36px;
  border: 3px solid $teal-lt;
  border-top-color: $teal;
  border-radius: 50%;
  animation: s6-spin 0.8s linear infinite;
  margin: 0 auto 14px;
}

@keyframes s6-spin {
  to { transform: rotate(360deg); }
}

.s6-err-ico {
  font-size: 48px;
  color: #e84040;
  display: block;
  margin-bottom: 12px;
}

.s6-wrapper {
  background: #fff;
  border-radius: 20px;
  padding: 28px 28px 24px;
  margin: 0 auto;
  box-shadow: 0 8px 40px rgba(0, 43, 43, 0.07);
  border: 1.5px solid rgba(25, 159, 151, 0.35);

  @media (max-width: 480px) {
    padding: 20px 16px;
    border-radius: 16px;
  }
}

.s6-top {
  text-align: center;
  padding-bottom: 20px;
  margin-bottom: 20px;
}

.s6-check-wrap {
  display: flex;
  justify-content: center;
  margin-bottom: 14px;
}

.s6-check-ico {
  font-size: 72px;
  color: $teal;
  font-variation-settings: "FILL" 1;
  filter: drop-shadow(0 4px 14px rgba(25, 159, 151, 0.28));
}

.s6-title {
  font-size: 22px;
  font-weight: 800;
  color: $text-dark;
  margin: 0 0 8px;
  font-family: "Montserrat", sans-serif;
}

.s6-sub {
  font-size: 13px;
  color: $text-mid;
  margin: 0 auto 14px;
  max-width: 520px;
  line-height: 1.6;
  font-family: "Inter", "Montserrat", sans-serif;

  strong {
    color: $text-dark;
    font-weight: 700;
  }
}

.s6-booking-chip {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  background: $teal-lt;
  border-radius: 20px;
  padding: 8px 14px;
  font-size: 12px;
  font-weight: 600;
  color: $text-dark;
  font-family: "Montserrat", sans-serif;
  margin-bottom: 12px;

  strong {
    font-weight: 700;
  }
}

.s6-chip-ico {
  font-size: 16px;
  color: $teal;
}

.s6-copy-btn {
  background: none;
  border: none;
  cursor: pointer;
  color: $teal;
  padding: 0;
  display: flex;
  align-items: center;

  .material-symbols-rounded {
    font-size: 16px;
  }
}

.s6-info-bar {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  max-width: 100%;
  margin: 0 auto;
  padding: 10px 16px;
  border: 1px solid $border;
  border-radius: 10px;
  font-size: 12px;
  color: $text-mid;
  font-family: "Inter", "Montserrat", sans-serif;
  line-height: 1.45;
  max-width: 520px;
}

.s6-info-bar-ico {
  font-size: 24px;
  color: black;
  flex-shrink: 0;
}

.s6-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
  align-items: stretch;

  @media (max-width: 860px) {
    grid-template-columns: 1fr;
  }
}

.s6-card {
  background: $card-bg;
  border-radius: 14px;
  padding: 18px 16px;
}

.s6-card--ride {
  background: #f4f4f4;
  border: none;
}

.s6-card-title {
  font-size: 17px;
  font-weight: 700;
  color: $text-dark;
  margin: 0 0 14px;
  font-family: "Montserrat", sans-serif;
  text-align: left;
}

.s6-icon-circle {
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  border-radius: 50%;

  .material-symbols-rounded {
    font-variation-settings: "FILL" 0;
  }
}

.s6-icon-circle--vehicle {
  width: 64px;
  height: 64px;
  background: #e8ecec;
  border: none;
}

.s6-icon-circle--note {
  width: 28px;
  height: 28px;
  background: #fff;
  border: 1.5px solid #c5cfcf;
  flex-shrink: 0;

  .material-symbols-rounded {
    font-size: 16px;
    color: #4a5e5d;
    font-variation-settings: "FILL" 0;
  }
}

.s6-icon-circle--confirm {
  width: 52px;
  height: 52px;
  border-radius: 50%;
  background: #fff;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.06);

  .material-symbols-rounded {
    font-size: 24px;
    color: #1a2a2a;
    font-variation-settings: "FILL" 0;
  }
}

.s6-icon-circle--info {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: #fff;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.06);

  .material-symbols-rounded {
    font-size: 20px;
    color: #1a2a2a;
    font-variation-settings: "FILL" 0;
  }
}

.s6-icon-circle--next {
  width: 40px;
  height: 40px;
  background: #e8ecec;
  border: none;
  flex-shrink: 0;

  .material-symbols-rounded {
    font-size: 20px;
    color: #4a5e5d;
    font-variation-settings: "FILL" 0;
  }
}

.s6-icon-circle--help {
  width: 40px;
  height: 40px;
  background: #fff;
  border: 1px solid rgba(25, 159, 151, 0.15);

  .material-symbols-rounded {
    font-size: 22px;
    color: $teal;
  }
}

.s6-vehicle-box {
  display: flex;
  align-items: center;
  gap: 16px;
  background: #fff;
  border: none;
  border-radius: 16px;
  padding: 16px 18px;
  margin-bottom: 10px;
  box-shadow: 0 4px 18px rgba(0, 43, 43, 0.08);
}

.s6-vehicle-img {
  width: 46px;
  height: auto;
  object-fit: contain;
  display: block;
}

.s6-vehicle-info {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 2px;
}

.s6-vehicle-label {
  font-size: 12px;
  font-weight: 400;
  color: $text-muted;
  font-family: "Montserrat", sans-serif;
  line-height: 1.3;
}

.s6-vehicle-name {
  font-size: 15px;
  font-weight: 700;
  color: $text-dark;
  font-family: "Montserrat", sans-serif;
  line-height: 1.35;
}

.s6-vehicle-model {
  font-size: 12px;
  font-weight: 400;
  color: $text-muted;
  font-family: "Inter", "Montserrat", sans-serif;
  line-height: 1.35;
}

.s6-vehicle-actions {
  display: flex;
  align-items: center;
  gap: 10px;
  flex-shrink: 0;
  margin-left: auto;
}

.s6-action-btn {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  text-decoration: none;
  transition: background 0.15s, box-shadow 0.15s;
  border: none;
  padding: 0;

  .material-symbols-rounded {
    font-size: 18px;
    font-variation-settings: "FILL" 0;
  }

  &--filled {
    background: $teal;
    box-shadow: 0 2px 10px rgba(25, 159, 151, 0.32);

    .material-symbols-rounded {
      color: #fff;
      font-size: 20px;
    }

    &:hover {
      background: darken($teal, 5%);
    }
  }
}

.s6-driver-note {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 0 2px;
}

.s6-driver-note-text {
  margin: 0;
  font-size: 13px;
  font-weight: 400;
  color: $text-mid;
  line-height: 1.55;
  font-family: "Inter", "Montserrat", sans-serif;
}

.s6-pay-panel {
  padding: 4px 14px;
}

.s6-pay-rows {
  display: flex;
  flex-direction: column;
}

.s6-pay-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 12px;
  padding: 10px 0;
  border-bottom: 1px solid $border;
  font-size: 13px;

  &:last-child {
    border-bottom: none;
  }
}

.s6-pay-label {
  color: $text-muted;
  font-family: "Montserrat", sans-serif;
}

.s6-pay-val {
  color: $text-dark;
  font-weight: 600;
  font-family: "Montserrat", sans-serif;
  text-align: right;
}

.s6-pay-success {
  color: $green !important;
  font-weight: 700 !important;
}

.s6-confirm-bar {
  margin-top: 16px;
  background: #f2f2f2;
  border-radius: 12px;
  padding: 18px 22px;
  display: flex;
  align-items: center;
  gap: 28px;

  @media (max-width: 900px) {
    flex-wrap: wrap;
    gap: 16px 20px;
  }

  @media (max-width: 640px) {
    flex-direction: column;
    align-items: stretch;
    gap: 0;
    padding: 16px;
  }
}

.s6-confirm-block {
  display: flex;
  align-items: center;
  gap: 14px;
  min-width: 0;

  &--status {
    flex: 1 1 38%;
    padding-right: 4px;

    @media (max-width: 640px) {
      flex: none;
      padding: 0 0 14px;
    }
  }

  &:not(.s6-confirm-block--status) {
    flex: 0 1 auto;

    @media (max-width: 640px) {
      padding: 14px 0;
      border-top: 1px solid rgba(0, 0, 0, 0.08);
    }
  }
}

.s6-confirm-copy {
  min-width: 0;
}

.s6-confirm-divider {
  width: 1px;
  align-self: stretch;
  min-height: 56px;
  background: #d8dede;
  flex-shrink: 0;

  @media (max-width: 640px) {
    display: none;
  }
}

.s6-confirm-title {
  margin: 0 0 4px;
  font-size: 14px;
  font-weight: 700;
  color: $text-dark;
  font-family: "Montserrat", sans-serif;
  line-height: 1.35;
}

.s6-confirm-sub {
  margin: 0;
  font-size: 12px;
  font-weight: 400;
  color: $text-mid;
  font-family: "Inter", "Montserrat", sans-serif;
  line-height: 1.5;
  max-width: 280px;
}

.s6-contact-label {
  margin: 0 0 3px;
  font-size: 13px;
  font-weight: 700;
  color: $text-dark;
  font-family: "Montserrat", sans-serif;
  line-height: 1.3;
}

.s6-contact-val {
  margin: 0;
  font-size: 12px;
  font-weight: 400;
  color: $text-mid;
  font-family: "Inter", "Montserrat", sans-serif;
  line-height: 1.35;
  white-space: nowrap;

  @media (max-width: 480px) {
    white-space: normal;
    word-break: break-all;
  }
}

.s6-next-section {
  margin-top: 16px;
  background: #f2f2f2;
  border-radius: 12px;
  padding: 18px 20px 20px;
}

.s6-next-title {
  font-size: 15px;
  font-weight: 700;
  color: $text-dark;
  margin: 0 0 14px;
  font-family: "Montserrat", sans-serif;
  text-align: left;
}

.s6-next-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 10px;

  @media (max-width: 992px) {
    grid-template-columns: repeat(2, 1fr);
    gap: 10px;
  }

  @media (max-width: 520px) {
    grid-template-columns: 1fr;
  }
}

.s6-next-card {
  background: #fff;
  border: none;
  border-radius: 10px;
  padding: 14px 12px;
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: 12px;
  min-height: 72px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.04);
}

.s6-next-text {
  margin: 0;
  flex: 1;
  font-size: 11.5px;
  font-weight: 400;
  color: $text-mid;
  line-height: 1.55;
  font-family: "Inter", "Montserrat", sans-serif;
}

.s6-help-banner {
  margin: 30px auto 0;
  background: $teal-lt;
  border-radius: 14px;
  border: 1px solid rgba(25,159,151,.15);
  padding: 20px;
}

.s6-help-inner {
  display: flex;
  align-items: center;
  gap: 12px;
  justify-content: center;
}

/* Circle behind icon */
.s6-help-icon-wrap {
  width: 42px;
  height: 42px;
  border-radius: 50%;
  background: #C9E8E7;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.s6-help-ico {
  font-size: 22px;
  color: #000;          
  font-variation-settings: 'FILL' 0;
}

.s6-help-banner p {
  font-size: 13px;
  color: #4a5e5d;
  margin: 0;
  font-family: 'Inter', 'Montserrat', sans-serif;
}

.s6-help-link {
  color: $teal;
  font-weight: 700;
  text-decoration: none;
  &:hover { text-decoration: underline; }
}


.mb-0 {
  margin-bottom: 0;
}
</style>
