<template>
  <BookingLayout>
    <BkSteps :current="4" />

    <!-- White wrapper card — everything inside -->
    <div class="s4-wrapper">

      <!-- Illustration -->
      <div class="s4-illustration">
        <img src="@/assets/images/bookride/ambulance.png" alt="Ride matching" class="s4-illus-img" />
      </div>

      <!-- Title & subtitle -->
      <h2 class="s4-title">We're working on matching your ride</h2>
      <p class="s4-sub">
        Our team is finding the best available driver and vehicle for your trip.
        You'll be notified as soon as your ride is confirmed.
      </p>

      <!-- Checklist panel -->
      <div class="s4-checklist-panel">
        <p class="s4-panel-heading mb-3">Our team is currently...</p>
        <div class="s4-checklist">
          <div
            v-for="(item, i) in checklist"
            :key="i"
            class="s4-check-item"
            :class="{ done: item.done, active: item.active }"
          >
            <span
              class="s4-check-ico material-symbols-rounded"
              :style="item.done ? 'font-variation-settings:\'FILL\' 1' : ''"
            >
              {{ item.done ? 'check_circle' : item.active ? 'radio_button_checked' : 'radio_button_unchecked' }}
            </span>
            <div class="s4-check-text">
              <span class="s4-check-title">{{ item.label }}</span>
              <span class="s4-check-desc">{{ item.desc }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Error state -->
      <div v-if="errorMsg" class="s4-err mt-3">{{ errorMsg }}</div>

      <!-- Need help banner -->
      <div class="s4-help-banner">
        <div class="s4-help-inner">
          <div class="s4-help-icon-wrap">
            <span class="material-symbols-rounded s4-help-ico">headset_mic</span>
          </div>
          <p class="mb-0">
            <strong>Need help?</strong>
            Call or text as at <a href="tel:9493450213" class="s4-help-link">949-345-0213</a>
          </p>
        </div>
      </div>

    </div>

    <div class="bk-step-actions">
      <button type="button" class="bk-btn-back" @click.prevent="$router.push('/ride/step-3')">
        <span class="material-symbols-rounded">arrow_back</span> Back
      </button>
    </div>

  </BookingLayout>
</template>

<script>
import BookingLayout from "@/views/layouts/booking";
import BkSteps from "@/components/booking/BkSteps";
import { mapGetters } from "vuex";
import axios from "axios";
import urls from "@/urls";

export default {
  metaInfo() { return { title: this.$appConfig.title + " | Book a Ride – Matching" }; },
  components: { BookingLayout, BkSteps },
  data() {
    return {
      orderId: null,
      pollTimer: null,
      errorMsg: "",
      pollCount: 0,
      MAX_POLLS: 60,
      checklist: [
        {
          label: "Assessing your trip details",
          desc:  "We've received your booking and are reviewing your trip information.",
          done: true,  active: false,
        },
        {
          label: "Finding the best match",
          desc:  "We're checking driver availability and selecting the right vehicle for your needs.",
          done: true, active: false,
        },
        {
          label: "Matching your ride",
          desc:  "Almost there! We're finalizing your ride details.",
          done: false, active: true,
        },
        {
          label: "You'll get notified",
          desc:  "We'll email and text you once your ride is confirmed.",
          done: false, active: false,
        },
      ],
    };
  },
  created() {
    this.orderId = this.$route.query?.id;
    if (!this.orderId) return;
    this.pollStatus();
    this.startPolling();
  },
  beforeDestroy() {
    this.stopPolling();
  },
  computed: {
    ...mapGetters(["client"]),
    order() {
      return this.client.orderlist?.items?.find(o => String(o.id) === String(this.orderId)) || null;
    },
  },
  methods: {
    startPolling() {
      this.pollTimer = setInterval(this.pollStatus, 3000);
    },
    stopPolling() {
      if (this.pollTimer) { clearInterval(this.pollTimer); this.pollTimer = null; }
    },
    async pollStatus() {
      this.pollCount++;

      if (this.pollCount > this.MAX_POLLS) {
        this.stopPolling();
        this.errorMsg = "Matching is taking longer than expected. Please try again.";
        return;
      }

      if (this.pollCount === 4) {
        this.checklist[1].done = true; this.checklist[1].active = false;
        this.checklist[2].active = true;
      }
      if (this.pollCount === 8) {
        this.checklist[2].done = true; this.checklist[2].active = false;
        this.checklist[3].active = true;
        this.stopPolling();
        // Stay 3 seconds on "You'll get notified" then navigate
        setTimeout(async () => {
          // Ensure order is accepted before step 5 loads (dev: no vendor in loop)
          try {
            await axios.post(urls.URL_ORDER_DEV_ACCEPT, { order_id: this.orderId });
          } catch { /* already accepted or prod env — ignore */ }
          this.checklist[3].done = true; this.checklist[3].active = false;
          this.$router.push(`/ride/step-5?id=${this.orderId}`);
        }, 3000);
        return;
      }

      try {
        await this.$store.dispatch("fetchClientOrderlist");
      } catch { return; }

      if (!this.order) return;

      const status = this.order.status;

      if (status === 1) {
        this.stopPolling();
        this.checklist[3].done = true; this.checklist[3].active = false;
        this.$router.push(`/ride/step-5?id=${this.orderId}`);
        return;
      }

      if ([20, 21, 22, 25, 26, 27].includes(status)) {
        this.stopPolling();
        this.errorMsg = "Your ride request could not be matched. Please try again.";
      }
    },
  },
};
</script>

<style lang="scss" scoped>
$teal: #199f97;
$teal-lt: #e8f5f4;
$red: #e84040;
$text-dark: #1a2a2a;
$text-muted: #747574;

/* ── White wrapper ── */
.s4-wrapper {
  background: #fff;
  border-radius: 24px;
  padding: 36px 32px 32px;
  margin: 0 auto;
  text-align: center;
  box-shadow: 0 8px 40px rgba(0,43,43,.07);
  border: 1px solid rgba(232,236,236,.9);

  @media (max-width: 480px) { padding: 24px 18px; border-radius: 18px; }
}

/* ── Illustration ── */
.s4-illustration {
  display: flex;
  justify-content: center;
  margin-bottom: 22px;
}

.s4-illus-img {
  width: 260px;
  height: auto;
  object-fit: contain;

  @media (max-width: 480px) { width: 180px; }
}

/* ── Title / sub ── */
.s4-title {
  font-size: 24px;
  font-weight: 700;
  color: $text-dark;
  margin: 0 0 10px;
  font-family: 'Inter', 'Montserrat', sans-serif;

  @media (max-width: 480px) { font-size: 17px; }
}

.s4-sub {
  font-size: 14px;
  color: $text-muted;
  line-height: 1.6;
  margin: 0 auto 24px;
  max-width: 700px;
  font-family: 'Inter', 'Montserrat', sans-serif;
}

/* ── Checklist panel ── */
.s4-checklist-panel {
  background: #F4F4F4;
  border-radius: 16px;
  padding: 18px 20px;
  text-align: left;
  max-width: 650px;
  margin: 0 auto;

  @media (max-width: 480px) { padding: 14px; }
}

.s4-panel-heading {
  font-size: 18px;
  font-weight: 700;
  color: $text-dark;
  margin: 0 0 14px;
  font-family: 'Montserrat', sans-serif;
}

.s4-checklist {
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.s4-check-item {
  display: flex;
  align-items: flex-start;
  gap: 10px;
  transition: opacity .3s;
}

.s4-check-ico {
  font-size: 25px;
  flex-shrink: 0;
  margin-top: 1px;
  color: #d0dada;
  transition: color .3s;

  .s4-check-item.done & { color: $teal; }
  .s4-check-item.active & { color: $teal; }
}

.s4-check-text {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.s4-check-title {
  font-size: 16px;
  font-weight: 600;
  color: $text-dark;
  font-family: 'Montserrat', sans-serif;
}

.s4-check-desc {
  font-size: 14px;
  color: $text-muted;
  line-height: 1.5;
  font-family: 'Inter', 'Montserrat', sans-serif;
}

/* ── Error ── */
.s4-err {
  font-size: 13px;
  color: $red;
  font-family: 'Montserrat', sans-serif;
  text-align: center;
}

/* ── Need help banner ── */
.s4-help-banner {
  margin: 30px auto 0;
  background: $teal-lt;
  border-radius: 14px;
  border: 1px solid rgba(25,159,151,.15);
  padding: 20px;
}

.s4-help-inner {
  display: flex;
  align-items: center;
  gap: 12px;
  justify-content: center;
}

/* Circle behind icon */
.s4-help-icon-wrap {
  width: 42px;
  height: 42px;
  border-radius: 50%;
  background: #C9E8E7;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.s4-help-ico {
  font-size: 22px;
  color: #000;          
  font-variation-settings: 'FILL' 0;
}

.s4-help-banner p {
  font-size: 13px;
  color: #4a5e5d;
  margin: 0;
  font-family: 'Inter', 'Montserrat', sans-serif;
}

.s4-help-link {
  color: $teal;
  font-weight: 700;
  text-decoration: none;
  &:hover { text-decoration: underline; }
}

.mt-3 { margin-top: 16px; }
.mb-0 { margin-bottom: 0; }
</style>
