<template>
  <div class="row order-info-view-full">
    <div
      class="order-info-col-1"
      :class="wide ? 'col-lg-6 col-xl-3' : 'col-xl col-lg-6'"
    >
      <div class="order-info">
        <div class="order-info-title">Starting Point</div>
        <div class="order-info-text">
          {{
            isVendor && order.status < 2 ? order.pfrom_city : order.pfrom_addr
          }}
        </div>
      </div>
      <div class="order-info">
        <div class="order-info-title">End point</div>
        <div class="order-info-text">
          {{ isVendor && order.status < 2 ? order.pto_city : order.pto_addr }}
        </div>
      </div>
      <div
        class="order-info"
        v-if="order.status === 0 && order.price === '0.00'"
      >
        <div class="order-info-title">Price</div>
        <div class="order-info-text">Pending</div>
      </div>
      <div class="order-info" v-else>
        <div class="order-info-title">Price</div>
        <div class="order-info-text text-success">
          $ {{ isVendor ? order.pricemk.payout : order.price }}
        </div>
      </div>
      <div class="order-info">
        <div class="order-info-title">Distance</div>
        <div class="order-info-text">{{ order.distance }} miles</div>
      </div>
      <div v-if="isVendor ? order.status !== 0 : true" class="order-info">
        <div class="order-info-title">Special instructions</div>
        <div class="order-info-text">
          {{ order.instruction }}
        </div>
      </div>
    </div>
    <div
      class="order-info-col-2"
      :class="wide ? 'col-lg-6 col-xl-3' : 'col-xl col-lg-6'"
    >
      <div class="order-info">
        <div class="order-info-title">Pickup Date & Time</div>
        <div class="order-info-text">
          {{ $dateAndTime(order.orderAt) }}
        </div>
      </div>
      <div class="order-info">
        <div class="order-info-title">Ordering Date & Time</div>
        <div class="order-info-text">
          {{ $dateAndTime(order.createdAt) }}
        </div>
      </div>
      <!-- if new oreder for current vendor: show company_name -->
      <template v-if="isVendor ? order.status !== 0 : true">
        <div class="order-info" v-if="order.status === 0 && order.company_name">
          <div class="order-info-title">Company</div>
          <div class="order-info-text">
            {{ order.company_name }}
          </div>
        </div>
        <div class="order-info">
          <div class="order-info-title">Car type</div>
          <div class="order-info-text">
            {{ carTypesLabel(order.cartype) }}
          </div>
        </div>
        <!-- show if not 0 - new AND 1- accepted -->
        <div class="order-info" v-if="order.status !== 0 && order.status !== 1">
          <div class="order-info-title">Client phone number</div>
          <div class="order-info-text">
            <template v-if="order.client_login">
              + {{ order.client_login }}
            </template>
            <template v-else> --- </template>
          </div>
        </div>
        <div v-if="Object.keys(order.services).length" class="order-info">
          <div class="order-info-title">Additional service</div>
          <div class="order-info-text">
            {{ servicesLabels(order.services) }}
          </div>
        </div>
      </template>
    </div>
    <template v-if="isVendor ? order.status !== 0 : true">
      <div
        class="order-info-col-3"
        :class="wide ? 'col-lg-6 col-xl-3' : 'col-xl col-lg-6'"
      >
        <div class="order-info">
          <div class="order-info-title">Client name</div>
          <div class="order-info-text">
            {{ clientName(order) }}
          </div>
        </div>
        <div class="order-info">
          <div class="order-info-title">BMI</div>
          <div class="order-info-text">{{ calcBMI(order) }}</div>
        </div>
        <div class="order-info">
          <div class="order-info-title">Accompanied by</div>
          <div class="order-info-text">
            {{ escortLabel(order.escort) }}
          </div>
        </div>
        <!-- show if not 0 - new AND 1- accepted -->
        <div class="order-info" v-if="order.status !== 0 && order.status !== 1">
          <div class="order-info-title">Contact number</div>
          <div class="order-info-text">
            {{ order.contact || " --- " }}
          </div>
        </div>
        <div class="order-info">
          <div class="order-info-title">COVID19 isolation required</div>
          <div class="order-info-text">
            {{ Boolean(order.covtst) ? "Yes" : "No" }}
          </div>
        </div>
      </div>
      <div
        v-if="order.contact_first || order.contact_last || order.contact_phone"
        class="order-info-col-2"
        :class="wide ? 'col-lg-6 col-xl-3' : 'col-xl col-lg-6'"
      >
        <div class="order-info">
          <div class="order-info-title">Passenger First Name</div>
          <div class="order-info-text">
            {{ order.contact_first || "-" }}
          </div>
        </div>
        <div class="order-info">
          <div class="order-info-title">Passenger Last Name</div>
          <div class="order-info-text">
            {{ order.contact_last || "-" }}
          </div>
        </div>
        <div class="order-info">
          <div class="order-info-title">Passenger Phone Number</div>
          <div class="order-info-text">
            {{ order.contact_phone || "-" }}
          </div>
        </div>
      </div>
    </template>
    <div
      class="order-info-col-4"
      :class="
        wide
          ? 'col-lg-6 col-xl-3'
          : 'col-12 col-lg-12 col-xl-auto ml-xl-auto text-center text-xl-right order-2 order-xl-1'
      "
    >
      <slot />
    </div>
    <div
      class="col-12 col-lg-12 order-info-more text-center text-sm-left my-3 my-sm-0 order-1 order-xl-2"
    >
      <slot name="more"></slot>
    </div>
  </div>
</template>

<script>
import { mapGetters } from "vuex";
import { carTypes, escortTypes } from "@/components/data";

export default {
  props: {
    order: {
      type: Object,
      default: () => {},
    },
    wide: {
      type: Boolean,
      default: false,
    },
    isVendor: Boolean,
  },
  data() {
    return {
      carTypes: carTypes,
      escortTypes: escortTypes,
    };
  },
  computed: {
    ...mapGetters(["opt"]),
    optServices() {
      return this.opt?.VENDOR_SERVICES || [];
    },
  },
  methods: {
    carTypesLabel(id) {
      return this.carTypes.find((t) => t.id === id).label;
    },
    servicesLabels(services) {
      const filtered = [];

      this.optServices.map((service) => {
        if (Object.keys(services).includes(service.c)) {
          filtered.push(service.t);
        }
      });

      return filtered.length ? filtered.join(",\n") : "";
    },
    clientName(order) {
      let name = "";

      if (order.client_first_name) {
        name += `${order.client_first_name} `;
      }

      if (order.client_second_name) {
        name += `${order.client_second_name} `;
      }

      if (order.client_last_name) {
        name += `${order.client_last_name}`;
      }

      return name.replace(/\s/g, "") ? name : "---";
    },
    escortLabel(escort) {
      if (!escort) {
        return "---";
      }
      return this.escortTypes.find((e) => Number(e.id) === Number(escort))
        .label;
    },
    calcBMI(order) {
      // console.log("Number(order.height * 12): ", Number(order.height * 12));
      // 703 * (Вес(lbs) / (Рост(in))^2)
      return order.weight &&
        order.height &&
        Number(order.weight) > 0 &&
        Number(order.height) > 0
        ? Number(
            703 *
              (Number(order.weight) / Math.pow(Number(order.height * 12), 2))
          ).toFixed(2)
        : " --- ";
    },
  },
};
</script>
<style scoped lang="scss">
.order-info-col-1 {
}

.order-info-col-2 {
}

.order-info-col-3 {
}

.order-info-col-4 {
  .btn {
    width: 120px;
  }
}

.order-info {
  margin-bottom: 18px;
}

.order-info-title {
  font-size: 14px;
  font-weight: 400;
  color: #505655;
  margin-bottom: 4px;
}

.order-info-text {
  font-family: "Montserrat", sans-serif;
  font-weight: 600;
  font-size: 18px;
  color: #293331;
}

.order-info-more {
  font-family: "Montserrat", sans-serif;
  font-weight: 600;
  font-size: 18px;
  text-decoration: none;
  color: #ff8528;
}
</style>
