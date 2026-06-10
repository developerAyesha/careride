<template>
  <div>
    <!-- hide if landing (main) or booking flow -->
    <div class="navbar-custom" v-if="$route.name !== 'main' && !$route.path.startsWith('/ride/')">
      <div class="row align-items-center">
        <div class="col-auto">
          <ul class="list-unstyled topnav-menu topnav-menu-left m-0">
            <li>
              <button
                class="button-menu-mobile waves-effect waves-light"
                @click="toggleMenu"
              >
                <span class="material-symbols-rounded">menu</span>
              </button>
            </li>

            <li>
              <a
                class="navbar-toggle nav-link"
                data-toggle="collapse"
                @click="horizonalmenu()"
                data-target="#topnav-menu-content"
              >
                <div class="lines">
                  <span></span>
                  <span></span>
                  <span></span>
                </div>
              </a>
            </li>
          </ul>
        </div>
        <div class="col">
          <div class="status-bar status-bar col col-lg-10 col-xl-8 mx-auto">
            <div class="status-bar-list">
              <!-- <div
                v-for="order in ordersWait"
                :key="`status-wait-${order.id}`"
                class="status-bar-item status-bar-item--wait"
                @click="clickStatus(order)"
              >
                <div class="status-bar-item-text">
                  <vac
                    :end-time="
                      new Date(order.createdAt).getTime() + orderAcceptTime
                    "
                    @finish="$store.dispatch('fetchUserDataCustomer')"
                    :key="`vac-status-wait-${order.id}`"
                  >
                    <template v-slot:process="{ timeObj }">
                      <span>{{ `${timeObj.m}:${timeObj.s}` }}</span>
                      <div
                        class="status-bar-item-progress"
                        :style="{ width: widthProgressAccept(timeObj) }"
                      ></div>
                    </template>
                  </vac>
                  min for
                  {{ order.vendor_id ? `"${order.company_name}"` : "vendors" }}
                  to accept your order #{{ order.id }}
                </div>
              </div> -->

              <!--<div
                v-for="order in ordersAccepted"
                :key="`status-accepted-${order.id}`"
                class="status-bar-item status-bar-item--accepted"
                @click="clickStatus(order)"
              >
                <div class="status-bar-item-text">
                  <vac
                    :end-time="
                      new Date(order.acceptedAt).getTime() + orderPayTime
                    "
                    @finish="$store.dispatch('fetchUserDataCustomer')"
                    :key="`vac-status-accepted-${order.id}`"
                  >
                    <template v-slot:process="{ timeObj }">
                      <span>{{ `${timeObj.m}:${timeObj.s}` }}</span>
                      <div
                        class="status-bar-item-progress"
                        :style="{ width: widthProgressPay(timeObj) }"
                      ></div>
                    </template>
                  </vac>
                  min to pay for your order #{{ order.id }}
                </div>
              </div> -->
            </div>
            <span
              v-if="ordersWait.length + ordersAccepted.length > 3"
              class="material-symbols-rounded status-bar-more"
              >keyboard_double_arrow_down</span
            >
          </div>
        </div>

        <!-- client notify - show active orders -->
        <div class="col-auto" v-if="client?.orderstatuses?.length">
          <router-link to="/client/orders" class="notify-box">
            <span class="material-symbols-rounded">
              notification_important
            </span>
            <span class="badge badge-danger noti-icon-badge">{{
              client.orderstatuses.length
            }}</span>
          </router-link>
        </div>

        <!-- driver notify - show new orders -->
        <div
          class="col-auto"
          v-if="driver && driver.orderlist && driver.orderlist.length"
        >
          <router-link to="/driver/order" class="notify-box">
            <span class="material-symbols-rounded">
              notification_important
            </span>
            <span class="badge badge-danger noti-icon-badge">{{
              driver.orderlist.length
            }}</span>
          </router-link>
        </div>

        <!-- vendor notify - show new orders -->
        <div class="col-auto">
          <a
            v-if="vendor && vendor.orderlist && vendor.orderlist.length"
            @click.prevent="goToVendorsAvailableOrders"
            href="/vendor/orders/available"
            class="notify-box"
          >
            <span class="material-symbols-rounded">
              notification_important
            </span>
            <span class="badge badge-danger noti-icon-badge">{{
              vendor.orderlist.length
            }}</span>
          </a>
        </div>

        <div class="col-auto">
          <ul class="list-unstyled topnav-menu float-right mb-0">
            <template v-if="!authorized">
              <li>
                <router-link to="/signup" class="nav-link">Sign up</router-link>
              </li>
              <li>
                <router-link to="/login" class="nav-link">Log in</router-link>
              </li>
            </template>
            <li v-else>
              <a class="nav-link" href="/logout" @click.prevent="handleLogout">
                <i class="fe-log-out mr-1"></i>
                <span>Log out</span>
              </a>
            </li>
          </ul>
        </div>
      </div>
    </div>

    <!-- Wait order accept modal: ordersWait no-stacking -->
    <!-- <b-modal v-for="order in ordersWait" :key="`ordersWait-${order.id}`" :ref="`ordersWait-${order.id}`"
      :visible="proceed.includes(order.id)" hide-header hide-footer centered no-close-on-backdrop
      modal-class="b-modal-wait-accept">
      <div class="common-modal-headline">
        <h4 class="common-modal-title">&nbsp;</h4>
        <span class="material-symbols-rounded common-modal-close" @click="closeModal(`ordersWait-${order.id}`)">
          close
        </span>
      </div>
      <div class="wait-accept-modal">
        <div class="wait-accept-modal-loader mb-3">
          <img :src="require('@/assets/images/loader.gif')" width="120" height="120" class="mx-auto mt-1 mb-2" />
        </div>
        <h4 class="wait-accept-modal-title mx-0 my-2">
          <template v-if="order.vendor_id">Waiting for "{{ order.company_name }}" to accept
            order #{{ order.id }}</template>
          <template v-else>Waiting for one of the companies to accept order #{{ order.id }}</template>
        </h4>
        <div class="wait-accept-modal-timer mb-3">
          <vac :end-time="new Date(order.createdAt).getTime() + orderAcceptTime
            " :key="order.createdAt">
            <template v-slot:process="{ timeObj }">
              <span>{{ `${timeObj.m}:${timeObj.s}` }}</span>
            </template>
          </vac>
        </div>
        <button class="btn btn-transparent" @click.prevent="fireCancelOrder(order.id)" :disabled="wait">
          Cancel order
        </button>
      </div>
    </b-modal> -->

    <!-- None accept order modal, satus: 21 (reject), 22 expired && !order.acceptedAt no-stacking -->
    <b-modal
      v-for="order in ordersNoneAccepted"
      :key="`ordersNoneAccepted-${order.id}`"
      :ref="`ordersNoneAccepted-${order.id}`"
      :visible="proceed.includes(order.id)"
      hide-header
      hide-footer
      centered
      no-close-on-backdrop
      no-close-on-esc
      modal-class="b-modal-none-accepted"
    >
      <div class="common-modal-headline">
        <h4 class="common-modal-title">&nbsp;</h4>
        <span
          class="material-symbols-rounded common-modal-close"
          @click="fireCancelOrder(order.id)"
        >
          close
        </span>
      </div>
      <div class="wait-accept-modal">
        <div class="wait-accept-modal-none-title my-2">Oops...</div>
        <div class="wait-accept-modal-none-text my-4">
          <template v-if="order.status === 22">
            Order #{{ order.id }}.
            <br />
            <template v-if="order.company_name">
              Seems like this "{{ order.company_name }}" is not available now.
              You should book a ride with another vendor.</template
            >
            <template v-else
              >Seems like these vendors are not available now. Please try again
              later.</template
            >
          </template>
          <template v-else> Vendor reject order #{{ order.id }}.</template>
        </div>
        <button
          class="btn btn-transparent"
          @click.prevent="fireCancelOrder(order.id)"
          :disabled="wait"
        >
          Cancel order
        </button>
      </div>
    </b-modal>

    <!-- Order not paid and expaired no-stacking -->
    <b-modal
      v-for="order in ordersNonePayed"
      :key="`ordersNonePayed-${order.id}`"
      :ref="`ordersNonePayed-${order.id}`"
      :visible="proceed.includes(order.id)"
      hide-header
      hide-footer
      centered
      no-close-on-backdrop
      no-close-on-esc
      modal-class="b-modal-none-paid"
    >
      <div class="common-modal-headline">
        <h4 class="common-modal-title">Order #{{ order.id }} not paid</h4>
        <span
          class="material-symbols-rounded common-modal-close"
          @click="fireCancelOrder(order.id)"
        >
          close
        </span>
      </div>
      <hr class="my-3" />
      <div class="wait-accept-modal">
        <div class="wait-accept-modal-none-text my-4">
          Accepted order #{{ order.id }} - not paid and expired.
        </div>
      </div>
      <div class="text-center">
        <button
          class="btn btn-outline-primary mw-230"
          @click.prevent="fireCancelOrder(order.id)"
          :disabled="wait"
        >
          Ok
        </button>
      </div>
    </b-modal>

    <!-- Order completed successfully, satus = 10 no-stacking -->
    <b-modal
      v-for="order in ordersCompleted"
      :key="`ordersCompleted-${order.id}`"
      :ref="`ordersCompleted-${order.id}`"
      :visible="proceed.includes(order.id)"
      hide-header
      hide-footer
      centered
      no-close-on-backdrop
      no-close-on-esc
      modal-class="b-modal-successfully"
    >
      <div class="common-modal-headline">
        <h4 class="common-modal-title">Order #{{ order.id }} Finished</h4>
        <span
          class="material-symbols-rounded common-modal-close"
          @click="fireCancelOrder(order.id)"
        >
          close
        </span>
      </div>
      <hr class="my-3" />
      <div class="accepted-modal">
        <div class="accepted-modal-line" v-if="order.car">
          <div class="accepted-modal-line-title">Car Model</div>
          <div class="accepted-modal-line-text">
            {{ order.car.model }}
          </div>
        </div>
        <div class="accepted-modal-line" v-if="order.car">
          <div class="accepted-modal-line-title">License Plate</div>
          <div class="accepted-modal-line-text">
            {{ order.car.plate }}
          </div>
        </div>
        <div class="accepted-modal-line" v-if="order.driver">
          <div class="accepted-modal-line-title">Driver Name</div>
          <div class="accepted-modal-line-text">
            {{ order.driver.first_name }}
            {{ order.driver.last_name }}
          </div>
        </div>
        <div class="accepted-modal-line">
          <div class="accepted-modal-line-title">Starting Location</div>
          <div class="accepted-modal-line-text">
            {{ order.pfrom_addr }}
          </div>
        </div>
        <div class="accepted-modal-line">
          <div class="accepted-modal-line-title">End Location</div>
          <div class="accepted-modal-line-text">{{ order.pto_addr }}</div>
        </div>
      </div>
      <hr class="my-3" />
      <div class="text-center">
        <button
          class="btn btn-outline-primary mw-230"
          @click.prevent="fireCancelOrder(order.id)"
          :disabled="wait"
        >
          Ok
        </button>
      </div>
    </b-modal>

    <!-- Wait accepted order pay modal: ordersAccepted no-stacking -->
    <b-modal
      v-for="order in ordersAccepted"
      :key="`ordersAccepted-${order.id}`"
      :ref="`ordersAccepted-${order.id}`"
      :visible="proceed.includes(order.id) && !$route.path.startsWith('/ride/step-5') && !$route.path.startsWith('/ride/step-6')"
      hide-header
      hide-footer
      centered
      no-close-on-backdrop
      no-close-on-esc
      modal-class="b-modal-accepted"
    >
      <div class="common-modal-headline">
        <h4 class="common-modal-title">Order Accepted #{{ order.id }}</h4>
        <span
          class="material-symbols-rounded common-modal-close"
          @click="closeModal(`ordersAccepted-${order.id}`)"
        >
          close
        </span>
      </div>
      <hr class="my-3" />
      <div class="accepted-modal">
        <div
          v-if="order.vendor && order.vendor.company_name"
          class="accepted-modal-line"
        >
          <div class="accepted-modal-line-title">Company</div>
          <div class="accepted-modal-line-text">
            {{ order.vendor.company_name }}
          </div>
        </div>
        <div class="accepted-modal-line" v-if="order.car">
          <div class="accepted-modal-line-title">Car Model</div>
          <div class="accepted-modal-line-text">
            {{ order.car.model || "" }}
          </div>
        </div>
        <div class="accepted-modal-line" v-if="order.car">
          <div class="accepted-modal-line-title">License Plate</div>
          <div class="accepted-modal-line-text">
            {{ order.car.plate || "" }}
          </div>
        </div>
        <div class="accepted-modal-line" v-if="order.driver">
          <div class="accepted-modal-line-title">Driver Name</div>
          <div class="accepted-modal-line-text">
            {{ order.driver.first_name }}
            {{ order.driver.last_name }}
          </div>
        </div>
      </div>
      <hr class="my-3" />
      <div class="row align-items-center mt-3">
        <div class="col-auto accepted-modal-vendor-time">
          Driver will arrive at {{ order.reason }}
        </div>
        <div class="col-auto ml-auto">
          <button class="btn btn-primary" @click.prevent="payPage(order.id)">
            Pay $ {{ order.price }}
          </button>
        </div>
      </div>
    </b-modal>

    <!-- Order canceled by vendor(26) or admin(27) no-stacking -->
    <b-modal
      v-for="order in ordersCanceled"
      :key="`ordersCanceled-${order.id}`"
      :ref="`ordersCanceled-${order.id}`"
      :visible="proceed.includes(order.id)"
      hide-header
      hide-footer
      centered
      no-close-on-backdrop
      no-close-on-esc
      modal-class="b-modal-canceled"
    >
      <div class="common-modal-headline">
        <h4 class="common-modal-title">
          Order #{{ order.id }}
          Canceled By
          <template v-if="order?.status === 26">
            {{ order.company_name }}</template
          >
          <template v-if="order?.status === 27"> Admin</template>
        </h4>
        <span
          class="material-symbols-rounded common-modal-close"
          @click="fireCancelOrder(order.id)"
        >
          close
        </span>
      </div>
      <hr class="my-3" />
      <div class="accepted-modal">
        <div class="row">
          <div class="col-12 col-lg-6">
            <div class="accepted-modal-line" v-if="order.car">
              <div class="accepted-modal-line-title">Car Model</div>
              <div class="accepted-modal-line-text">
                {{ order.car.model }}
              </div>
            </div>
            <div class="accepted-modal-line" v-if="order.car">
              <div class="accepted-modal-line-title">License Plate</div>
              <div class="accepted-modal-line-text">
                {{ order.car.plate }}
              </div>
            </div>
            <div class="accepted-modal-line" v-if="order.driver">
              <div class="accepted-modal-line-title">Driver Name</div>
              <div class="accepted-modal-line-text">
                {{ order.driver.first_name }}
                {{ order.driver.last_name }}
              </div>
            </div>
            <div class="accepted-modal-line">
              <div class="accepted-modal-line-title">Starting Location</div>
              <div class="accepted-modal-line-text">
                {{ order.pfrom_addr }}
              </div>
            </div>
            <div class="accepted-modal-line">
              <div class="accepted-modal-line-title">End Location</div>
              <div class="accepted-modal-line-text">
                {{ order.pto_addr }}
              </div>
            </div>
          </div>
          <div class="col-12 col-lg-6">
            <div class="accepted-modal-line" v-if="order?.status === 27">
              <div class="accepted-modal-line-title">Cancel Reason</div>
              <div class="accepted-modal-line-text">{{ order.reason }}</div>
            </div>
            <template v-if="order.payment && order.payAt">
              <div class="accepted-modal-line">
                <div class="accepted-modal-line-title">Payment Amount</div>
                <div class="accepted-modal-line-text">
                  {{ formatCurrencyCent(order.payment.amount) }}
                </div>
              </div>
              <div class="accepted-modal-line">
                <div class="accepted-modal-line-title">
                  Payment Capture Percent
                </div>
                <div class="accepted-modal-line-text">
                  {{ order.payment.detail.capture_percent }} %
                </div>
              </div>
              <div class="accepted-modal-line">
                <div class="accepted-modal-line-title">Payment Capture</div>
                <div class="accepted-modal-line-text">
                  {{
                    formatCurrencyCent(order.payment.detail.amount_to_capture)
                  }}
                </div>
              </div>
            </template>
          </div>
        </div>
      </div>
      <hr class="my-3" />
      <div class="text-center">
        <button
          class="btn btn-outline-primary mw-230"
          @click.prevent="fireCancelOrder(order.id)"
          :disabled="wait"
        >
          Ok
        </button>
      </div>
    </b-modal>

    <!-- Driver: Order canceled by client (25), vendor(26) or admin(27) no-stacking -->
    <b-modal
      :visible="modalDriverOrderCanceled && Boolean(oldOrder)"
      @hide="detachingDriverOrder"
      hide-header
      hide-footer
      centered
      no-close-on-backdrop
      no-close-on-esc
      modal-class="b-modal-driver-canceled"
    >
      <div class="common-modal-headline">
        <h4 class="common-modal-title">
          Order
          <template v-if="oldOrder?.id">#{{ oldOrder.id }}</template>
          Canceled By
          <template v-if="oldOrder?.status === 25"> client</template>
          <template v-if="oldOrder?.status === 26">
            {{ oldOrder.vendor.company_name }}</template
          >
          <template v-if="oldOrder?.status === 27"> Admin</template>
        </h4>
        <span
          class="material-symbols-rounded common-modal-close"
          @click="modalOrderCompleted = false"
        >
          close
        </span>
      </div>
      <hr class="my-3" />
      <div class="accepted-modal" v-if="oldOrder">
        <div class="accepted-modal-line">
          <div class="accepted-modal-line-title">Starting Location</div>
          <div class="accepted-modal-line-text">
            {{ oldOrder.pfrom_addr }}
          </div>
        </div>
        <div class="accepted-modal-line">
          <div class="accepted-modal-line-title">End Location</div>
          <div class="accepted-modal-line-text">{{ oldOrder.pto_addr }}</div>
        </div>
        <!-- <pre>oldOrder: {{ oldOrder }}</pre> -->
      </div>
      <hr class="my-3" />
      <div class="text-center">
        <button
          class="btn btn-outline-primary mw-230"
          @click.prevent="detachingDriverOrder"
          :disabled="wait"
        >
          Ok
        </button>
      </div>
    </b-modal>

    <!-- Vendor: Order canceled by client (25) or admin(27) no-stacking -->
    <b-modal
      v-for="order in modalVendorOrderCanceled"
      :key="order.order_id"
      visible
      @hide="detachingVendorOrder(order.order_id)"
      hide-header
      hide-footer
      centered
      no-close-on-backdrop
      no-close-on-esc
      modal-class="b-modal-vendor-canceled"
    >
      <div class="common-modal-headline">
        <h4 class="common-modal-title">
          Order #{{ order.order_id }} Canceled By
          <template v-if="order.status_to === 20 || order.status_to === 25">
            client</template
          >
          <template v-if="order.status_to === 27"> Admin</template>
        </h4>
        <span
          class="material-symbols-rounded common-modal-close"
          :class="{ 'common-modal-close-disabled': wait }"
          @click="detachingVendorOrder(order.order_id)"
        >
          close
        </span>
      </div>
      <hr class="my-3" />
      <div class="accepted-modal">
        <div class="accepted-modal-line" v-if="order.status_to === 27">
          <div class="accepted-modal-line-title">Cancel Reason</div>
          <div class="accepted-modal-line-text">
            {{ order.order.reason || " --- " }}
          </div>
        </div>
        <div class="accepted-modal-line">
          <div class="accepted-modal-line-title">Starting Location</div>
          <div class="accepted-modal-line-text">
            {{ order.order.pfrom_addr }}
          </div>
        </div>
        <div class="accepted-modal-line">
          <div class="accepted-modal-line-title">End Location</div>
          <div class="accepted-modal-line-text">{{ order.order.pto_addr }}</div>
        </div>
      </div>
      <hr class="my-3" />
      <div class="text-center">
        <button
          class="btn btn-outline-primary mw-230"
          @click.prevent="detachingVendorOrder(order.order_id)"
          :disabled="wait"
        >
          Ok
        </button>
      </div>
    </b-modal>

    <Debuginfo>
      <div v-if="user.role === 'c'">
        <pre>proceed: {{ proceed }}</pre>
      </div>
      <div v-if="user.role === 'c'">
        <pre>client: {{ client }}</pre>
      </div>
      <div v-if="user.role === 'v'">
        <pre>vendor: {{ vendor }}</pre>
      </div>
      <div v-if="user.role === 'd'">
        <pre>driver: {{ driver }}</pre>
      </div>
      <hr />
      <div>
        <pre>user: {{ user }}</pre>
      </div>
    </Debuginfo>
  </div>
</template>

<script>
import store from "@/store";
import router from "@/router";
import axios from "axios";
import urls from "@/urls";
import { mapState, mapGetters, mapActions } from "vuex";
import { formatCurrencyCent } from "@/helpers";

export default {
  components: {},
  data() {
    return {
      timer: null,
      orderWait: null,
      oldOrder: null, // use for driver
      modalOrderCompleted: false, // use for driver
      modalDriverOrderCanceled: false, // use for driver
      wait: false,
      proceed: [],
    };
  },
  mounted() {
    if (this.authorized) {
      this.proceed = this.client?.orderstatuses?.map((o) => o.id) || [];
    }
    this.setTimer();
  },
  beforeDestroy() {
    clearInterval(this.timer);
  },
  computed: {
    ...mapGetters([
      "authorized",
      "user",
      "userLoading",
      "client",
      "driver",
      "vendor",
    ]),
    fetchDataTime() {
      return Number(process.env.VUE_APP_FETCH_DATA_TIME);
    },
    // 0 - new, not accepted yet
    ordersWait() {
      if (this.client?.orderlist?.items?.length) {
        return (
          this.client.orderlist.items.filter(
            (order) => Number(order.status) === 0
          ) || []
        );
      }

      return [];
    },
    // 21 - reject and 22-expired && !order.acceptedAt,
    ordersNoneAccepted() {
      if (this.client?.orderlist?.items?.length) {
        return (
          this.client.orderlist.items.filter(
            (order) =>
              Number(order.status) === 21 ||
              (Number(order.status) === 22 && !order.acceptedAt)
          ) || []
        );
      }

      return [];
    },
    // reject by not payed: 22 && order.acceptedAt
    ordersNonePayed() {
      if (this.client?.orderlist?.items?.length) {
        return (
          this.client.orderlist.items.filter(
            (order) => Number(order.status) === 22 && order.acceptedAt
          ) || []
        );
      }

      return [];
    },
    // order finish, completd, status = 10
    ordersCompleted() {
      if (this.client?.orderlist?.items?.length) {
        return (
          this.client.orderlist.items.filter(
            (order) => Number(order.status) === 10
          ) || []
        );
      }

      return [];
    },
    // 1 - accepted
    ordersAccepted() {
      if (this.client?.orderlist?.items?.length) {
        return (
          this.client.orderlist.items.filter(
            (order) => Number(order.status) === 1
          ) || []
        );
      }

      return [];
    },
    // Order canceled by vendor(26) or admin(27)
    ordersCanceled() {
      if (this.client?.orderlist?.items?.length) {
        return (
          this.client.orderlist.items.filter(
            (order) =>
              Number(order.status) === 26 || Number(order.status) === 27
          ) || []
        );
      }

      return [];
    },
    // pick up or work 3/4
    ordersInWork() {
      if (this.client?.orderlist?.items?.length) {
        return (
          this.client.orderlist.items.filter(
            (order) => Number(order.status) === 3 || Number(order.status) === 4
          ) || []
        );
      }

      return [];
    },
    orderAcceptTime() {
      return Number(process.env.VUE_APP_ORDER_ACCEPT_TIME);
    },
    orderPayTime() {
      return Number(process.env.VUE_APP_ORDER_PAY_TIME);
    },
    modalVendorOrderCanceled() {
      if (this.vendor.changes?.length) {
        // canceled by client 20 (not payed), 25, canceled by admin 27
        return this.vendor.changes.filter(
          (order) =>
            order.status_to === 20 ||
            order.status_to === 25 ||
            order.status_to === 27
        );
      } else {
        return [];
      }
    },
  },
  methods: {
    formatCurrencyCent,
    ...mapActions(["logout", "fetchClientOrderlist", "clientCancelOrder"]),
    async setTimer() {
      await this.customerData();
      this.driverData();
      this.vendorData();

      this.timer = setInterval(async () => {
        await this.customerData();
        this.driverData();
        this.vendorData();
      }, this.fetchDataTime); // 10sec, 1sec = 1000 mlsec
    },
    async customerData() {
      if (this.authorized && this.user.role === "c") {
        await this.$store.dispatch("fetchUserDataCustomer");
      }
    },
    async driverData() {
      if (this.authorized && this.user.role === "d") {
        await this.$store.dispatch("fetchDriverOrders");
      }
    },
    async vendorData() {
      if (this.authorized && this.user.role === "v") {
        await this.$store.dispatch("fetchVendorNewOrdersAndChanges");
      }
    },
    async handleLogout() {
      await this.$store.dispatch("logout");
      await this.$router.push("/main").catch(() => {}); // main or login...
    },
    toggleMenu() {
      store.commit("toggleMenu");
    },
    initFullScreen() {
      document.body.classList.toggle("fullscreen-enable");
      if (
        !document.fullscreenElement &&
        /* alternative standard method */
        !document.mozFullScreenElement &&
        !document.webkitFullscreenElement
      ) {
        // current working methods
        if (document.documentElement.requestFullscreen) {
          document.documentElement.requestFullscreen();
        } else if (document.documentElement.mozRequestFullScreen) {
          document.documentElement.mozRequestFullScreen();
        } else if (document.documentElement.webkitRequestFullscreen) {
          document.documentElement.webkitRequestFullscreen(
            Element.ALLOW_KEYBOARD_INPUT
          );
        }
      } else {
        if (document.cancelFullScreen) {
          document.cancelFullScreen();
        } else if (document.mozCancelFullScreen) {
          document.mozCancelFullScreen();
        } else if (document.webkitCancelFullScreen) {
          document.webkitCancelFullScreen();
        }
      }
    },
    horizonalmenu() {
      let element = document.getElementById("topnav-menu-content");
      element.classList.toggle("show");
    },
    closeModal(ref) {
      console.log("closeModal, ref: ", ref);
      console.log("closeModal, this.$refs[ref]: ", this.$refs[ref]);
      this.$refs[ref][0].hide();
    },
    async fireCancelOrder(id) {
      this.wait = true;

      this.msg = {
        has: false,
        type: "",
        text: "",
      };

      try {
        await this.clientCancelOrder(id);
      } catch (error) {
        console.log("Cancel order, Error: ", error);
      } finally {
        await this.$store.dispatch("fetchUserDataCustomer");
        this.$scrollToTop();
        this.wait = false;
      }
    },
    clickStatus(order) {
      // click n show wait order - new order
      // if (order.status === 0) {
      //   this.$refs[`ordersWait-${order.id}`][0].show()
      // }

      // click n show accepted order
      if (order.status === 1) {
        this.$refs[`ordersAccepted-${order.id}`][0].show();
      }
    },
    widthProgressAccept(obj) {
      // console.log("widthProgressAccept, iobjd: ", obj.leftTime);
      const percent = this.orderAcceptTime / 100;

      if (obj.leftTime) {
        // return obj.leftTime/percent + "%"; // style 1: 100% to 0, right to left
        return 100 - obj.leftTime / percent + "%"; // style 2: 0 to 100% left to right
      } else {
        return "100%";
      }
    },
    widthProgressPay(obj) {
      // console.log("widthProgressPay, iobjd: ", obj.leftTime);
      const percent = this.orderPayTime / 100;

      if (obj.leftTime) {
        // return obj.leftTime/percent + "%"; // style 1: 100% to 0, right to left
        return 100 - obj.leftTime / percent + "%"; // style 2: 0 to 100% left to right
      } else {
        return "100%";
      }
    },
    payPage(id) {
      this.proceed = this.proceed.filter(pid => pid !== id);
      this.$router.push(`/ride/step-5?id=${id}`).catch(() => {});
    },
    goToVendorsAvailableOrders() {
      router.push({
        path: "/vendor/orders/available",
        query: { update: new Date().getTime() },
      });
    },
    async detachingDriverOrder() {
      this.wait = true;
      this.modalDriverOrderCanceled = false;
      await this.$store.dispatch("detachOrder", {
        id: this.oldOrder.id,
        role: "d",
      });
      this.oldOrder = null;
      this.wait = false;
      router.push("/driver/order").catch(() => {});
    },
    async detachingVendorOrder(id) {
      // console.log("detachingVendorOrder, id: ", id);
      this.wait = true;

      await this.$store.dispatch("detachOrder", {
        id,
        role: "v",
      });

      await this.$store.dispatch("fetchVendorNewOrdersAndChanges");

      // if on same page: /vendor/orders/available - reload
      if (this.$route.name === "vendor-orders-available") {
        router
          .push(`/vendor/orders/available?update=${new Date().getTime()}`)
          .catch(() => {});
      }

      this.wait = false;
    },
  },
  watch: {
    async "client.orderstatuses"(newItems = [], oldItems = []) {
      if (this.authorized) {
        console.log("client.orderstatuses... ");
        // console.log('client.orderstatuses, newItems: ', newItems)
        // console.log('client.orderstatuses, oldItems: ', oldItems)

        // simple check diff if change
        if (JSON.stringify(newItems) !== JSON.stringify(oldItems)) {
          console.log("client.orderstatuses... changed!!!");
          await this.fetchClientOrderlist();

          // set diff
          let diff = newItems.filter(
            (newitem) =>
              !oldItems.some(
                (olditem) =>
                  olditem.id === newitem.id && olditem.status === newitem.status
              )
          );
          diff = diff.map((o) => o.id);

          // merge to proceed, only unique
          this.proceed = [...new Set([...this.proceed, ...diff])];
        }
      }
    },
    "driver.lastorders.items": {
      handler: function (items) {
        // console.log("driver.lastorders.items, items: ", items);
        const order = items && items.length && items[0] ? items[0] : null;

        if (order && order.payAt) {
          // order canceled by: client (25), vendor(26) or admin(27)
          if (
            order.status === 25 ||
            order.status === 26 ||
            order.status === 27
          ) {
            this.oldOrder = order;
            this.modalDriverOrderCanceled = true;
          }
        }
      },
      deep: true,
    },
  },
};
</script>

<style lang="scss" scoped>
.user-info {
  display: flex;
  justify-content: flex-start;
  align-items: center;
}

.button-menu-mobile > span {
  position: relative;
  top: 2px;
}

.wait-accept-modal {
  text-align: center;

  .btn-transparent {
    color: #acb4b8 !important;
  }

  &-timer {
    font-family: "Montserrat", sans-serif;
    font-size: 24px;
    font-weight: 600;
    color: #199f97;
  }

  &-none-title {
    font-family: "Montserrat", sans-serif;
    font-size: 38px;
    font-weight: 600;
    color: #199f97;
  }

  &-none-text {
    font-family: "Montserrat", sans-serif;
    font-size: 18px;
    font-weight: 600;
    color: #505655;
  }
}

.accepted-modal-line {
  margin-top: 16px;

  &:first-child {
    margin-top: 0;
  }

  &-title {
    font-size: 14px;
    font-weight: 600;
    color: #505655;
    margin: 0 0 4px 0;
  }

  &-text {
    font-size: 16px;
    font-weight: 400;
    color: #505655;
  }
}

.accepted-modal-vendor-time {
  font-size: 18px;
  font-weight: 600;
  color: #199f97;
}
</style>
