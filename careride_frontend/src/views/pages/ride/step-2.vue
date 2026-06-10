<template>
  <BookingLayout>
    <BkSteps :current="2" />

    <div class="s2-grid">
      <!-- Left: Form card -->
      <div class="s2-form-card">
        <h5 class="s2-top-title">Are you booking for yourself or someone else</h5>

        <!-- Who is riding -->
        <div class="s2-who-row">
          <button
            class="s2-who-btn"
            :class="{ active: form.whoride === 0 }"
            type="button"
            @click="form.whoride = 0; 
            form.patient = {
              first: '',
              last: '',
              phone: ''
              };"
          >
            <span
              class="material-symbols-rounded s2-who-ico"
              :style="form.whoride === 0 ? 'font-variation-settings:\'FILL\' 1' : ''"
            >{{ form.whoride === 0 ? 'check_circle' : 'radio_button_unchecked' }}</span>
            Myself
          </button>
          <button
            class="s2-who-btn"
            :class="{ active: form.whoride === 1 }"
            type="button"
            @click="form.whoride = 1"
          >
            <span
              class="material-symbols-rounded s2-who-ico"
              :style="form.whoride === 1 ? 'font-variation-settings:\'FILL\' 1' : ''"
            >{{ form.whoride === 1 ? 'check_circle' : 'radio_button_unchecked' }}</span>
            Someone else
          </button>
        </div>



     <!-- Section title (when booking for someone)-->
     <div v-if="form.whoride === 1" class="s2-patient-block">
      <h6 class="s2-section-title">
        Patient (Rider) Information:
        </h6>

       <div class="s2-row3 mt-12">
          <div class="s2-field">
            <label class="s2-label">First name <span class="s2-req">*</span></label>
            <input v-model="form.patient.first" class="s2-inp" placeholder="Enter first name" maxlength="64" />
            <div class="s2-err" v-if="submitted && $v.form.patient.first.$error">Required</div>
          </div>
          <div class="s2-field">
            <label class="s2-label">Last name <span class="s2-req">*</span></label>
            <input v-model="form.patient.last" class="s2-inp" placeholder="Enter last name" maxlength="64" />
            <div class="s2-err" v-if="submitted && $v.form.patient.last.$error">Required</div>
          </div>
          <div class="s2-field">
            <label class="s2-label">Phone number <span class="s2-req">*</span></label>
            <input v-model="form.patient.phone" class="s2-inp" placeholder="Enter phone number" maxlength="16" type="tel" inputmode="numeric" @input="form.patient.phone = form.patient.phone.replace(/\D/g, '')" />
            <div class="s2-err" v-if="submitted && $v.form.patient.phone.$error">Required</div>
          </div>
        </div>
     </div>
       
        <!-- Gender -->
        <div class="s2-field mt-12">
          <label class="s2-label">Gender <span>(Optional)</span></label>
         <div class="s2-gender-row">
         <button v-for="g in genders" :key="g.key" class="s2-gender-btn" :class="{ on: form.gender === g.key }" type="button" @click="form.gender = g.key">
         <component
      :is="g.icon"
      :color="form.gender === g.key ? '#000' : '#747574'"
      :width="20"
      :height="20"
    />

    {{ g.label }}
  </button>
</div>
        </div>

        <!-- Weight & Height -->
        <div class="s2-row2 mt-12">
          <div class="s2-field">
            <label class="s2-label">Weight <span class="s2-req">*</span></label>
            <input v-model.number="form.weight" class="s2-inp" type="number" placeholder="LBS" min="0" max="999" />
            <div class="s2-err" v-if="submitted && $v.form.weight.$error">Required</div>
            <span class="s2-hint">Needed for transport safety and equipment planning</span>
          </div>
          <div class="s2-field">
            <label class="s2-label">Height <span class="s2-req">*</span></label>
            <div class="s2-height-row">
              <input v-model.number="form.height_ft" class="s2-inp" type="number" placeholder="Ft" min="0" max="9" />
              <input v-model.number="form.height_in" class="s2-inp" type="number" placeholder="In" min="0" max="11" />
            </div>
            <div class="s2-err" v-if="submitted && ($v.form.height_ft.$error || $v.form.height_in.$error)">Required</div>
            <span class="s2-hint">Used to ensure safe vehicle and assistance matching</span>
          </div>
        </div>

        <div class="s2-err mt-8" v-if="msg.has">{{ msg.text }}</div>
      </div>

      <!-- Right: Map -->
      <div class="s2-map-card">
        <GmapMap
          :center="center"
          :zoom="mapZoom"
          map-type-id="terrain"
          style="width:100%;height:100%;min-height:460px;"
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

    <div class="bk-step-actions">
      <button type="button" class="bk-btn-back" @click.prevent="$router.push('/ride/step-1')">
        <span class="material-symbols-rounded">arrow_back</span> Back
      </button>
      <button type="button" class="bk-btn-next" @click.prevent="handleSubmit">
        Next Step <span class="material-symbols-rounded">arrow_forward</span>
      </button>
    </div>
  </BookingLayout>
</template>

<script>
import BookingLayout from "@/views/layouts/booking";
import BkSteps from "@/components/booking/BkSteps";
import DirectionsRenderer from "@/components/DirectionsRenderer";
import { mapGetters } from "vuex";
import { requiredIf } from "vuelidate/lib/validators";
import { required } from "vuelidate/lib/validators";
import {
  MaleIcon,
  FemaleIcon,
  NonBinaryIcon,
  PreferNotIcon
} from "@/assets/icons";

export default {
  metaInfo() { return { title: this.$appConfig.title + " | Book a Ride – Patient Info" }; },
  components: { BookingLayout, BkSteps, DirectionsRenderer, MaleIcon, FemaleIcon, NonBinaryIcon,PreferNotIcon  },
  data() {
    return {
      submitted: false,
      msg: { has: false, type: "", text: "" },
        genders: [
          { key: "m", label: "Male", icon: MaleIcon },
          { key: "f", label: "Female", icon: FemaleIcon },
          { key: "nb", label: "Non binary", icon: NonBinaryIcon },
          { key: "x", label: "Prefer not to say", icon: PreferNotIcon },
          ],
form: {
  whoride: 0,

  contact: {
    first: "",
    last: "",
    phone: "",
  },

  patient: {
    first: "",
    last: "",
    phone: "",
  },

  gender: "",
  weight: "",
  height_ft: "",
  height_in: "",
}
    };
  },
validations() {
  const someoneElse = () => this.form.whoride === 1;

  return {
    form: {
      patient: {
        first: { required: requiredIf(someoneElse) },
        last: { required: requiredIf(someoneElse) },
        phone: { required: requiredIf(someoneElse) },
      },
      weight: { required },
      height_ft: { required },
      height_in: { required },
    },
  };
},
  created() {
    if (!this.routeData) {
      this.$router.push("/ride/step-1").catch(() => {});
      return;
    }
    this.restoreForm();
  },
  computed: {
    ...mapGetters(["routeData", "user"]),
    waypoints() {
      return this.routeData?.addData?.p_dat?.ets || [];
    },
    center() {
      if (this.waypoints.length) return this.waypoints[0].position;
      return { lat: 40.1966701, lng: -100.6248741 };
    },
    mapZoom() {
      return this.waypoints.length >= 2 ? 10 : 5;
    },
  },
  methods: {
   restoreForm() {
  const d = { ...this.routeData?.formData, ...this.routeData?.addData };

  this.form.whoride = d.whoride ?? 0;
  this.form.gender = d.gender || "";
  this.form.weight = d.weight || "";
  
  if (d.height) {
    this.form.height_ft = Math.floor(d.height / 12);
    this.form.height_in = d.height % 12;
  }

  // contact
  if (d.contact) {
    this.form.contact = {
      first: d.contact.first || "",
      last: d.contact.last || "",
      phone: d.contact.phone || "",
    };
  }

  // patient
  if (d.patient) {
    this.form.patient = {
      first: d.patient.first || "",
      last: d.patient.last || "",
      phone: d.patient.phone || "",
    };
  }
},
    handleSubmit() {
      this.submitted = true;
      this.$v.$touch();
      if (this.$v.$invalid) return;

      const heightTotal = (Number(this.form.height_ft) || 0) * 12 + (Number(this.form.height_in) || 0);

    const contact = {
      first: this.user?.first_name || "",
      last:  this.user?.last_name  || "",
      phone: this.user?.login      || "",
    };

    const patientData = {
      whoride: this.form.whoride,
      gender:  this.form.gender || null,
      weight:  Number(this.form.weight) || 0,
      height:  heightTotal,
      contact,
      patient:
        this.form.whoride === 1
          ? {
              first: this.form.patient.first,
              last:  this.form.patient.last,
              phone: this.form.patient.phone,
            }
          : null,
    };

      this.$store.commit("setRouteData", {
        formData: { ...this.routeData.formData, ...patientData },
        addData:  { ...this.routeData.addData,  ...patientData },
      });

      this.$router.push("/ride/step-3");
    },
  },
};
</script>

<style lang="scss" scoped>
$teal: #199f97;
$teal-lt: #e8f5f4;
$red: #e84040;
$border: #e8ecec;
$bg-input: #fff;
$text-dark: #1a2a2a;
$text-muted: #747574;

/* ── Two-column grid ── */
.s2-grid {
  display: grid;
  grid-template-columns: 1.4fr 1fr;
  gap: 26px;
  align-items: stretch;

  @media (max-width: 900px) { grid-template-columns: 1fr; }
}

/* ── Form card ── */
.s2-form-card {
  background: #fff;
  border-radius: 28px;
  padding: 28px 26px;
  display: flex;
  flex-direction: column;
  box-shadow: 0 28px 80px rgba(0,43,43,.08);
  border: 1px solid rgba(232,236,236,.9);

  @media (max-width: 480px) { padding: 20px 16px; border-radius: 20px; }
}

.s2-top-title {
  font-size: 18px;
  font-weight: 600;
  color: $text-dark;
  margin: 0 0 16px;
  font-family: 'Montserrat', sans-serif;
}

/* ── Who is riding toggles ── */
.s2-who-row {
  display: flex;
  gap: 10px;
  margin-bottom: 18px;
  flex-wrap: wrap;
}

.s2-who-btn {
  display: inline-flex;
  align-items: center;
  gap: 7px;
  padding: 8px 18px;
  border: 1.5px solid $border;
  border-radius: 30px;
  background: #fff;
  color: #6b7c7b;
  font-size: 13px;
  font-weight: 500;
  font-family: 'Montserrat', sans-serif;
  cursor: pointer;
  transition: all .15s;

  &.active {
    border-color: $teal;
    color: $teal;
    background: rgba(25,159,151,.05);
    font-weight: 600;
  }
}

.s2-who-ico {
  font-size: 17px;
  color: $text-muted;

  .s2-who-btn.active & { color: $teal; }
}

/* ── Section title ── */
.s2-section-title {
  font-size: 18px;
  font-weight: 600;
  color: $text-dark;
  margin: 0 0 14px;
  font-family: 'Montserrat', sans-serif;
}

.s2-patient-block {
  margin-top: 24px;
}

/* ── 3-column row for name+phone ── */
.s2-row3 {
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
  gap: 10px;

  @media (max-width: 640px) { grid-template-columns: 1fr; }
}

/* ── 2-column row ── */
.s2-row2 {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;

  @media (max-width: 480px) { grid-template-columns: 1fr; }
}

/* ── Field ── */
.s2-field {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.s2-label {
  font-size: 16px;
  font-weight: 600;
  color: #3a4a49;
  font-family: 'Montserrat', sans-serif;

  span{
   font-size: 14px;
  font-weight: 400;
  }
}

.s2-req { color: $red; margin-left: 2px; }

.s2-hint {
  font-size: 11px;
  color: $text-muted;
  font-family: 'Inter', 'Montserrat', sans-serif;
  line-height: 1.4;
}

/* ── Input ── */
.s2-inp {
  width: 100%;
  border: 1.5px solid $border;
  border-radius: 20px;
  padding: 12px 14px;
  font-size: 14px;
  font-family: 'Inter', 'Montserrat', sans-serif;
  color: $text-dark;
  background: #F4F4F4;
  outline: none;
  min-height: 42px;
  transition: border-color .15s, box-shadow .15s, background .15s;

  &:focus {
    border-color: $teal;
    box-shadow: 0 0 0 3px rgba(25,159,151,.1);
    background: #fff;
  }

  &::placeholder { color: $text-muted; font-size: 16px  }
  &[disabled] { opacity: 0.5; cursor: not-allowed; }
}

/* ── Gender row ── */
.s2-gender-row {
  display: flex;
  gap: 5px;
}

@media (max-width: 640px) {
  .s2-gender-row {
    display: grid;
    grid-template-columns: 1fr 1fr;
  }
}

.s2-gender-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  flex: 1;
  padding: 12px 0px;
  border-radius: 30px;
  border: 1.5px solid #e8ecec;
  background: #F4F4F4;
  font-size: 14px;
  font-weight: 500;
  color: #747574;
  transition: all .15s;
  cursor: pointer;
  svg {
    color: #747574;
  }

  &:hover {
    border-color: #199F97;
  }

  &.on {
    background: #E8F6F5;
    border-color: #199F97;
    color: #000;

    svg {
      color: #000;
    }
  }
}

/* ── Height row (Ft + In side by side) ── */
.s2-height-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 8px;
}

/* ── Error ── */
.s2-err {
  font-size: 12px;
  color: $red;
  font-family: 'Montserrat', sans-serif;
  min-height: 16px;
}

/* ── Map card ── */
.s2-map-card {
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
    min-height: 300px;
    height: 300px;
    border-radius: 10px;
    align-self: auto;

    ::v-deep .vue-map-container,
    ::v-deep .vue-map {
      min-height: 300px;
    }
  }
}

/* ── Spacing helpers ── */
.mt-12 { margin-top: 12px; }
.mt-8  { margin-top: 8px; }
</style>
