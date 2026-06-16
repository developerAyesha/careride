<template>
  <Layout>
    <div class="form-container-max mx-auto mb-3">
      <div class="signup-headline mb-3">
        <h1 class="display-3 my-0">Sign up as vendor</h1>
        <div class="signup-headline-step">{{ step }}/2</div>
      </div>

      <b-alert :variant="msg.type" dismissible class="mt-3" v-model="msg.has" :show="msg.text">{{ msg.text }}</b-alert>

      <!-- 1 -->
      <form v-show="step === 1" action="#" @submit.prevent="submitStep1" novalidate>
        <div class="row">
          <div class="col-md-6 col-xl-4 mb-3 mb-md-0">
            <div class="card h-100 mb-0">
              <div class="card-body">
                <!-- Vendor info fields -->
                <div class="form-group mb-2">
                  <label for="login" class="required">Phone Number</label>
                  <div class="input-group input-group-merge">
                    <input v-model="step1.login" v-mask="'+1 ##########'" placeholder="+1 ##########" type="text"
                      id="login" class="form-control" @paste="onPhonePaste" :class="{
                        'is-invalid': submitted && $v.step1.login.$error,
                      }" />
                    <!-- <div class="text-muted w-100">e.g "+1 343 554 45 24"</div> -->
                    <div v-if="submitted && $v.step1.login.$error" class="invalid-feedback">
                      <div v-if="
                        !$v.step1.login.required ||
                        !$v.step1.login.minLength ||
                        !$v.step1.login.maxLength
                      ">
                        Phone number is required
                      </div>
                    </div>
                  </div>
                </div>

                <div class="form-group mb-2">
                  <label for="vendor-email" class="required">Email</label>
                  <input class="form-control" v-model="step1.email" type="email" placeholder="Enter email"
                    id="vendor-email" :class="{
                      'is-invalid': submitted && $v.step1.email.$error,
                    }" />
                  <div v-if="submitted && $v.step1.email.$error" class="invalid-feedback">
                    <span v-if="!$v.step1.email.required">Email is required field</span>
                    <span v-if="!$v.step1.email.email">Email is invalid</span>
                  </div>
                </div>

                <div class="form-group mb-2">
                  <label for="passw" class="required">Password</label>
                  <div class="input-group input-group-merge">
                    <input v-model="step1.passw" :type="showPassw ? 'text' : 'password'" id="passw" class="form-control"
                      placeholder="Enter your password" :class="{
                        'is-invalid': submitted && $v.step1.passw.$error,
                      }" />
                    <div class="input-group-append" @click="showPassw = !showPassw" role="button">
                      <div class="input-group-text">
                        <span v-if="showPassw" class="material-symbols-rounded fz-18">visibility</span>
                        <span v-else class="material-symbols-rounded fz-18">visibility_off</span>
                      </div>
                    </div>
                    <div v-if="submitted && $v.step1.passw.$error" class="invalid-feedback">
                      <div v-if="!$v.step1.passw.required">
                        Password is required
                      </div>
                      <div v-if="!$v.step1.passw.minLength">
                        Passwords min 8
                      </div>
                      <div v-if="!$v.step1.passw.maxLength">
                        Passwords max 16
                      </div>
                      <div v-if="!$v.step1.passw.valid">
                        Passwords is not valid, must include: A-Z, a-z, 0-9,
                        #?!@$%^&*-
                      </div>
                    </div>
                  </div>
                </div>

                <div class="form-group mb-0">
                  <label for="repassw" class="required">Confirm Password</label>
                  <div class="input-group input-group-merge">
                    <input v-model="step1.repassw" :type="showRepassw ? 'text' : 'password'" id="repassw"
                      class="form-control" placeholder="Confirm your password" :class="{
                        'is-invalid': submitted && $v.step1.repassw.$error,
                      }" />
                    <div class="input-group-append" @click="showRepassw = !showRepassw" role="button">
                      <div class="input-group-text">
                        <span v-if="showRepassw" class="material-symbols-rounded fz-18">visibility</span>
                        <span v-else class="material-symbols-rounded fz-18">visibility_off</span>
                      </div>
                    </div>
                    <div v-if="submitted && $v.step1.repassw.$error" class="invalid-feedback">
                      <div v-if="!$v.step1.repassw.required">
                        Confirm Password is required
                      </div>
                      <div v-if="!$v.step1.repassw.sameAsPassword">
                        Passwords are not matched
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div class="col-md-6 col-xl-8 mb-3 mb-md-0">
            <div class="card h-100 mb-0">
              <div class="card-body">
                <div class="row">
                  <div class="col-md-12 col-xl-6">
                    <!-- Company info fields -->
                    <div class="form-group mb-2">
                      <label for="company_name" class="required">Company Name</label>
                      <div class="input-group input-group-merge">
                        <input v-model="step1.company_name" id="company_name" class="form-control"
                          placeholder="Company Name" :class="{
                            'is-invalid':
                              submitted && $v.step1.company_name.$error,
                          }" />
                        <div v-if="submitted && $v.step1.company_name.$error" class="invalid-feedback">
                          <div v-if="!$v.step1.company_name.required">
                            Company Name is required
                          </div>
                          <div v-if="!$v.step1.company_name.minLength">
                            Company Name min 1
                          </div>
                          <div v-if="!$v.step1.company_name.maxLength">
                            Company Name max 64
                          </div>
                        </div>
                      </div>
                    </div>

                    <div class="form-group mb-2">
                      <label for="first_name" class="required">First Name</label>
                      <div class="input-group input-group-merge">
                        <input v-model="step1.first_name" id="first_name" class="form-control" placeholder="First Name"
                          :class="{
                            'is-invalid':
                              submitted && $v.step1.first_name.$error,
                          }" />
                        <div v-if="submitted && $v.step1.first_name.$error" class="invalid-feedback">
                          <div v-if="!$v.step1.first_name.required">
                            First Name is required
                          </div>
                          <div v-if="!$v.step1.first_name.minLength">
                            First Name min 1
                          </div>
                          <div v-if="!$v.step1.first_name.maxLength">
                            First Name max 20
                          </div>
                        </div>
                      </div>
                    </div>

                    <div class="form-group mb-2">
                      <label for="second_name">Middle Name</label>
                      <div class="input-group input-group-merge">
                        <input v-model="step1.second_name" id="second_name" class="form-control"
                          placeholder="Middle Name" />
                      </div>
                    </div>

                    <div class="form-group mb-2">
                      <label for="last_name" class="required">Last Name</label>
                      <div class="input-group input-group-merge">
                        <input v-model="step1.last_name" id="last_name" class="form-control" placeholder="Last Name"
                          :class="{
                            'is-invalid':
                              submitted && $v.step1.last_name.$error,
                          }" />
                        <div v-if="submitted && $v.step1.last_name.$error" class="invalid-feedback">
                          <div v-if="!$v.step1.last_name.required">
                            Last Name is required
                          </div>
                          <div v-if="!$v.step1.last_name.minLength">
                            Last Name min 1
                          </div>
                          <div v-if="!$v.step1.last_name.maxLength">
                            Last Name max 20
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div class="col-md-12 col-xl-6">
                    <!-- Address fields  -->
                    <div class="form-group mb-2">
                      <label for="address" class="required">Address</label>
                      <div class="input-group input-group-merge">
                        <input v-model="step1.address" id="address" class="form-control" placeholder="Address" :class="{
                          'is-invalid': submitted && $v.step1.address.$error,
                        }" />
                        <div v-if="submitted && $v.step1.address.$error" class="invalid-feedback">
                          <div v-if="!$v.step1.address.required">
                            Address is required
                          </div>
                          <div v-if="!$v.step1.address.minLength">
                            Address min 1
                          </div>
                          <div v-if="!$v.step1.address.maxLength">
                            Address max 32
                          </div>
                        </div>
                      </div>
                    </div>

                    <div class="form-group mb-2">
                      <label class="required">City</label>
                      <div class="input-group input-group-merge input-with-control-ico">
                        <GmapAutocomplete @place_changed="addPlace" :componentRestrictions="componentRestrictions"
                          :selectFirstOnEnter="true" :types="['(cities)']" :setFieldsTo="['address_components']"
                          ref="city" placeholder="Enter city" class="form-control form-autocomplete-place" :class="{
                            'is-invalid': submitted && $v.step1.city.$error,
                          }" />
                        <span v-if="place" @click="resetPlace"
                          class="material-symbols-rounded input-with-control-ico-btn">
                          close
                        </span>
                      </div>
                      <div v-if="submitted && $v.step1.city.$error" class="invalid-feedback" :class="{
                        'd-block': submitted && $v.step1.city.$error,
                      }">
                        <div v-if="!$v.step1.city.required">
                          City is required
                        </div>
                      </div>
                    </div>

                    <div class="form-group mb-2">
                      <label for="state">State</label>
                      <div class="input-group input-group-merge">
                        <input v-model="step1.state" id="state" class="form-control" placeholder="Enter state" readonly />
                      </div>
                    </div>

                    <div class="form-group mb-2">
                      <label for="zipcode" class="required">Zip Code</label>
                      <div class="input-group input-group-merge">
                        <input v-model="step1.zipcode" v-mask="'#####'" placeholder="12345" type="text" id="zipcode"
                          class="form-control" :class="{
                            'is-invalid': submitted && $v.step1.zipcode.$error,
                          }" />
                        <!-- <div class="text-muted w-100">e.g "15112"</div> -->
                        <div v-if="submitted && $v.step1.zipcode.$error" class="invalid-feedback">
                          <div v-if="!$v.step1.zipcode.required">
                            Zip Code is required, 5 digit
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div class="col-12">
                    <div class="form-group mt-2 mb-0">
                      <div class="input-group">
                        <b-form-checkbox id="partner-agreements" v-model="step1.agree" name="partner-agreements"
                          :value="true" unchecked-value="" :class="{
                            'is-invalid': submitted && $v.step1.agree.$error,
                          }">
                          I agree with
                          <router-link to="?page=terms">Terms &amp; Conditions</router-link>
                          and
                          <router-link to="?page=policy">Privacy Policy</router-link>
                        </b-form-checkbox>
                        <div v-if="submitted && $v.step1.agree.$error" class="invalid-feedback">
                          To use service you need to accept Agreements
                        </div>
                      </div>
                    </div>
                  </div>
                  <div class="col-12">
                    <div class="form-group mt-2 mb-0">
                      <div class="input-group">
                        <b-form-checkbox id="partner-agreements2" v-model="step1.agree2" name="partner-agreements2"
                          :value="true" unchecked-value="" :class="{
                            'is-invalid': submitted && $v.step1.agree2.$error,
                          }">
                          I accept
                          <router-link to="?page=agreements">Agreements</router-link>
                        </b-form-checkbox>
                        <div v-if="submitted && $v.step1.agree2.$error" class="invalid-feedback">
                          To use service you need to accept Agreements
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div class="row my-0 mt-md-3">
          <div class="col-md-12 col-xl-4">
            <h3 class="header-title">
              License<label class="required-star ml-1">*</label>
            </h3>
            <div class="card mb-0">
              <div class="card-body">
                <div class="form-group mb-0">
                  <div class="text-muted">
                    Please, upload Business license, Insurance and Form of Identification<br />
                    Format: jpeg, png, pdf. Size limit: 2MB. MAX 5 files
                  </div>
                  <div class="input-group input-group-merge custom-input-file">
                    <div v-if="!step1.files.length" :class="{
                      'is-invalid': submitted && $v.step1.files.$error,
                    }">
                      <input id="files" ref="files" type="file" class="form-control custom-input-file-input"
                        @change="fileChanged" multiple accept="image/jpeg, image/png, application/pdf" />
                      <label class="custom-input-file-label" for="files">Upload
                        <span class="material-symbols-rounded custom-input-file-label-ico">
                          upload
                        </span></label>
                    </div>
                    <div v-else>
                      <div v-for="(file, i) of step1.files" :key="i" class="custom-input-file-text">
                        <span class="material-symbols-rounded custom-input-file-text-ico">
                          description
                        </span>
                        {{ file.name }}
                        <span @click="resetFile(i)" class="material-symbols-rounded custom-input-file-reset"
                          title="Reset file">
                          cancel
                        </span>
                      </div>
                    </div>
                    <div v-if="submitted && $v.step1.files.$error" class="invalid-feedback">
                      License files required
                    </div>
                  </div>

                  <b-alert :show="Boolean(fileAlert)" variant="danger" class="mt-1 mb-0">
                    {{ fileAlert }}
                  </b-alert>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div class="text-center text-md-left my-3">
          <button class="btn btn-primary mw-230" type="submit" :disabled="trySubmit">
            Continue
          </button>
        </div>
      </form>

      <!-- 2 -->
      <form v-if="step === 2" action="#" @submit.prevent="submitStep2" novalidate>
        <div class="row">
          <div class="col-md-6 col-xl-5 mb-3 mb-md-0 h-100">
            <h3 class="header-title">Car Type</h3>
            <div class="card h-100 mb-0">
              <div class="card-body">
                <div class="row">
                  <div v-for="(cartype, i) of step2.cartypes" :key="cartype.key" class="col-12 col-xl-6"
                    :class="{ 'mb-2 mb-xl-0': i !== step2.cartypes.length - 1 }">
                    <div class="form-group mb-2">
                      <div class="input-group">
                        <b-form-checkbox v-model="cartype.checked" :value="true" :unchecked-value="false" @change="
                          cartype.checked
                            ? (cartype.value = '')
                            : (cartype.value = null)
                        " @input="
  moveToNextField($event, `cartype-${cartype.key}`)
">
                          {{ cartype.label }}
                        </b-form-checkbox>
                      </div>
                    </div>
                    <div class="form-group my-2">
                      <label :for="`cartype-${cartype.key}`">Price per mile</label>
                      <div class="input-group input-group-merge">
                        <input v-model.number="cartype.value" v-mask="currencyMask" placeholder="$" type="text"
                          :id="`cartype-${cartype.key}`" :ref="`cartype-${cartype.key}`" :disabled="!cartype.checked"
                          class="form-control" :class="{
                            'is-invalid':
                              submitted &&
                              $v.step2.cartypes.$each[i].value.$error,
                          }" />
                      </div>
                    </div>
                    <div class="form-group my-0">
                      <label :for="`cartype-baseprice-${cartype.key}`">Base price</label>
                      <div class="input-group input-group-merge">
                        <input v-model.number="cartype.baseprice" v-mask="currencyMask" placeholder="$" type="text"
                          :id="`cartype-baseprice-${cartype.key}`" :ref="`cartype-baseprice-${cartype.key}`"
                          :disabled="!cartype.checked" class="form-control" :class="{
                            'is-invalid':
                              submitted &&
                              $v.step2.cartypes.$each[i].baseprice.$error,
                          }" />
                        <div v-if="
                          submitted &&
                          $v.step2.cartypes.$each[i].baseprice.$error
                        " class="invalid-feedback">
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
            <h3 class="header-title">Additional Services</h3>
            <div class="card h-100 mb-0">
              <div class="card-body">
                <div class="row">
                  <div v-for="(service, i) of step2.services" :key="service.c" class="col-12 col-xl-4"
                    :class="{ 'mb-2 mb-xl-0': i !== step2.services.length - 1 }">
                    <div class="form-group mb-2">
                      <div class="input-group">
                        <b-form-checkbox v-model="service.checked" :value="true" :unchecked-value="false" @change="
                          service.checked
                            ? (service.value = '')
                            : (service.value = null)
                        " @input="
  moveToNextField($event, `service-${service.c}`)
">
                          {{ service.t }}
                        </b-form-checkbox>
                      </div>
                    </div>
                    <div class="form-group my-0">
                      <label :for="`service-${service.c}`">Price</label>
                      <div class="input-group input-group-merge">
                        <input v-model.number="service.value" v-mask="currencyMask" placeholder="$" type="text"
                          :id="`service-${service.c}`" :ref="`service-${service.c}`" :disabled="!service.checked"
                          class="form-control" :class="{
                            'is-invalid':
                              submitted &&
                              $v.step2.services.$each[i].value.$error,
                          }" />
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
                <div v-if="!step2.overtimes.length" class="text-center">
                  <a class="btn btn-outline-primary mx-auto" @click.prevent="addOvertime" title="Add overtime" href="#">
                    <span class="material-symbols-rounded"> add_location </span>
                    Add overtime
                  </a>
                </div>
                <div v-else class="overtime-slider">
                  <div v-for="(overtime, i) in step2.overtimes" :key="overtime.id" class="row"
                    :class="{ 'mb-3': i < step2.overtimes.length - 1 }">
                    <div class="col-12 col-xl-9">
                      <div class="row">
                        <div class="col-auto"><label>Period start</label></div>
                        <div class="col-auto ml-auto text-center">
                          <div class="invalid-feedback text-center" :class="{
                            'is-invalid slider-diapason-msg d-block':
                              $v.step2.overtimes.$each[i].slider.$error,
                          }">
                            Overtime diapason
                            <b>[{{ getOverflowTime(overtime.slider[0]).name }} -
                              {{ getOverflowTime(overtime.slider[1]).name }}]</b>
                            has collision
                          </div>
                        </div>
                        <div class="col-auto ml-auto">
                          <label>Period end</label>
                        </div>
                      </div>
                      <vue-slider v-model="overtime.slider" :data="sliderSteps" :data-value="'id'" :data-label="'name'"
                        :min-range="1" :max-range="25" :class="{
                          'is-invalid':
                            $v.step2.overtimes.$each[i].slider.$error,
                        }">
                        <template v-slot:step="{ label, active }">
                          <div :class="['custom-step', { active }]"></div>
                        </template>
                      </vue-slider>
                    </div>
                    <div class="col-auto mx-auto col-xl-3">
                      <div class="form-group mb-0">
                        <label>Price</label>
                        <div class="input-group input-group-merge input-with-control-ico">
                          <div class="position-relative w-100">
                            <input v-model.number="overtime.price" v-mask="currencyMask" placeholder="$" type="text"
                              class="form-control" :class="{
                                'is-invalid':
                                  submitted &&
                                  $v.step2.overtimes.$each[i].price.$error,
                              }" />
                          </div>
                          <a class="btn btn-outline-primary btn-ico ml-2" v-if="
                            step2.overtimes.length < sliderSteps.length - 1
                          " @click.prevent="addOvertime" title="Add overtime" href="#">
                            <span class="material-symbols-rounded">
                              add_location
                            </span>
                          </a>
                          <a class="btn btn-transparent btn-ico btn-ico-remove ml-1"
                            @click.prevent="removeOvertime(overtime.id)" title="Remove location" href="#">
                            <span class="material-symbols-rounded">
                              cancel
                            </span>
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

        <div class="text-center text-md-left my-3">
          <button class="btn btn-outline-primary btn-ico mr-2" @click.prevent="backStep">
            <span class="material-symbols-rounded ico-back">
              arrow_back_ios
            </span>
          </button>

          <button class="btn btn-primary mw-230" type="submit" :disabled="trySubmit">
            Sign up
          </button>
        </div>
      </form>
    </div>

    <TermsModal :show="showModalTerms" @close="closeModal" />
    <AgreementsModal :show="showModalAgreements" @close="closeModal" />
    <PrivacyPolicyModal :show="showPrivacyPolicyModal" @close="closeModal" />

    <!-- <pre>this.opt.VENDOR_SERVICES: {{ this.opt.VENDOR_SERVICES }}</pre> -->
    <!-- <pre>step2.services: {{ step2.services }}</pre> -->
    <!-- <pre>carTypes: {{ carTypes }}</pre> -->
    <!-- <pre>step2.cartypes: {{ step2.cartypes }}</pre> -->
    <!-- <pre>step2.overtimes: {{ step2.overtimes }}</pre> -->
    <!-- <pre>step1: {{ step1 }}</pre> -->
    <!-- <pre>step2: {{ step2 }}</pre> -->

    <!-- <pre>cities: {{ cities }}</pre> -->
    <!-- <pre>place: {{ place }}</pre> -->
</Layout>
</template>

<script>
import Layout from "@/views/layouts/main";
import axios from "axios";
import { mapGetters } from "vuex";
import Swal from "sweetalert2";
import urls from "@/urls";
import {
  required,
  minLength,
  maxLength,
  sameAs,
  requiredIf,
  email,
} from "vuelidate/lib/validators";
import { getCity } from "@/helpers";
import { carTypes, timeline } from "@/components/data";
import createNumberMask from "text-mask-addons/dist/createNumberMask";
import VueSlider from "vue-slider-component";
import "vue-slider-component/theme/default.css";
import TermsModal from "@/components/terms-modal";
import AgreementsModal from "@/components/agreements-modal";
import PrivacyPolicyModal from "@/components/privacy-policy-modal";
import { pasteAsLoginDisplay } from "@/helpers/phone";

export default {
  metaInfo() {
    return {
      title: this.$appConfig.title + " | Become a partner",
    };
  },
  components: {
    Layout,
    VueSlider,
    TermsModal,
    AgreementsModal,
    PrivacyPolicyModal,
  },
  data() {
    return {
      step: 1,

      cities: "",

      msg: {
        has: false,
        type: "",
        text: "",
      },

      componentRestrictions: { country: "us" },

      carTypes: carTypes,

      step1: {
        login: "",
        email: "",
        passw: "",
        repassw: "",
        company_name: "",
        first_name: "",
        second_name: "", // opt
        last_name: "",
        address: "",
        city: "",
        state: "", // opt
        zipcode: "",
        files: [], // opt
        agree: "",
        agree2: "",
      },

      step2: {
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

      showModalTerms: false,
      showModalAgreements: false,
      showPrivacyPolicyModal: false,

      place: "",

      fileAlert: "",

      showPassw: false,
      showRepassw: false,

      sliderSteps: timeline,

      submitted: false,
      trySubmit: false,
    };
  },
  validations() {
    return {
      step1: {
        login: {
          required,
          minLength: minLength(13),
          maxLength: maxLength(13),
        },
        email: {
          required,
          email,
        },
        passw: {
          required,
          valid: function (value) {
            const containsUppercase = /[A-Z]/.test(value);
            const containsLowercase = /[a-z]/.test(value);
            const containsNumber = /[0-9]/.test(value);
            const containsSpecial = /[#?!@$%^&*-]/.test(value);
            return (
              containsUppercase &&
              containsLowercase &&
              containsNumber &&
              containsSpecial
            );
          },
          minLength: minLength(8),
          maxLength: maxLength(16),
        },
        repassw: {
          required,
          sameAsPassword: sameAs("passw"),
        },
        files: {
          required,
        },
        company_name: {
          required,
          minLength: minLength(1),
          maxLength: maxLength(64),
        },
        first_name: {
          required,
          minLength: minLength(1),
          maxLength: maxLength(20),
        },
        last_name: {
          required,
          minLength: minLength(1),
          maxLength: maxLength(20),
        },
        address: {
          required,
          minLength: minLength(1),
          maxLength: maxLength(32),
        },
        city: {
          required,
        },
        zipcode: {
          required,
          minLength: minLength(5),
          maxLength: maxLength(5),
        },
        agree: {
          required,
        },
        agree2: {
          required,
        },
      },

      // dynamic required validation field if field.checked: true else optional (field.checked: false - disabled)
      step2: {
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
                if (this.step2.overtimes.length === 1) {
                  return true;
                }

                // check collision
                const reverseOvertimes = [...this.step2.overtimes];
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
    // this.showModalRegistrationSuccess(); //###dev
    this.prepareData();
  },
  computed: {
    ...mapGetters(["opt"]),
    fileSizeMaxMb() {
      return process.env.VUE_APP_FILE_BUSINESS_LICENSE_MAX_SIZE;
    },
  },
  methods: {
    onPhonePaste(evt) {
      const formatted = pasteAsLoginDisplay(evt);
      if (formatted) this.step1.login = formatted;
    },
    backStep() {
      this.step = 1;
      this.msg = {
        has: false,
        type: "",
        text: "",
      };
    },
    submitStep1() {
      this.submitted = true;

      this.$v.step1.$touch();

      if (this.$v.step1.$invalid) {
        return;
      } else {
        this.step = 2;
      }
    },
    async submitStep2() {
      this.submitted = true;
      this.msg = {
        has: false,
        type: "",
        text: "",
      };

      this.$v.step2.$touch();

      if (this.$v.step2.$invalid) {
        // console.log("step2 NOT valid....");
        return;
      } else {
        // console.log("step2 is valid....");
        this.trySubmit = true;
        this.errorMsg = null;

        const formData = new FormData();

        // form
        formData.append("login", this.step1.login);
        formData.append("email", this.step1.email);
        formData.append("passw", this.step1.passw);
        formData.append("company_name", this.step1.company_name);
        formData.append("first_name", this.step1.first_name);
        formData.append("second_name", this.step1.second_name);
        if (this.step1.last_name) {
          formData.append("last_name", this.step1.last_name);
        }
        formData.append("address", this.step1.address);
        formData.append("city", this.step1.city);
        if (this.step1.state) {
          formData.append("state", this.step1.state);
        }
        formData.append("zipcode", this.step1.zipcode);
        Array.from(this.step1.files).forEach((file) => {
          formData.append("filelicense", file);
        });

        // cartypes price if checked: costmt1, costmt2
        this.step2.cartypes.map((cartype) => {
          if (cartype.checked) {
            formData.append(cartype.key, this.getPrice(cartype.value));
            formData.append(
              cartype.basepricekey,
              this.getPrice(cartype.baseprice)
            );
          } else {
            formData.append(cartype.key, 0); // if null back error
          }
        });

        // services
        // "services": {
        //   "OXYGEN": 15.5,
        //   "STAIRS": 3.3
        // },
        this.step2.services.map((service) => {
          // services[OXYGEN]
          if (service.checked) {
            formData.append(
              `services[${service.c}]`,
              this.getPrice(service.value)
            );
          } else {
            formData.append(`services[${service.c}]`, "null");
          }
        });

        // overtimes
        // "overtimes": [
        //   {
        //     "timefrom": "19:00",
        //     "timeto": "06:00",
        //     "price": 15.5
        //   },
        // ]
        this.step2.overtimes.map((overtime, i) => {
          // overtimes[0][timefrom]
          formData.append(
            `overtimes[${i}][timefrom]`,
            this.getOverflowTime(overtime.slider[0]).time
          );
          formData.append(
            `overtimes[${i}][timeto]`,
            this.getOverflowTime(overtime.slider[1]).time
          );
          formData.append(
            `overtimes[${i}][price]`,
            this.getPrice(overtime.price)
          );
        });

        // Display the key/value pairs ###debug
        // for (var pair of formData.entries()) {
        //   console.log(pair[0] + " :", pair[1]);
        // }

        try {
          await axios.post(urls.URL_SIGNUP_VENDOR, formData, {
            headers: {
              "content-type": "multipart/form-data",
            },
          });

          this.showModalRegistrationSuccess();

          this.inprogress = false;
        } catch (error) {
          // console.log("Error: ", error);
          // console.log("Error response: ", error.response);

          this.msg.has = true;
          this.msg.type = "danger";
          this.msg.text = "Error on vendor registration ...";

          if (!error.response) {
            this.msg.text = "Error: Network Error";
          } else {
            if (error.response?.status) {
              if (error.response.statusText) {
                this.msg.text = `Error: ${error.response.status} ${error.response.statusText}`;
              } else if (error.response.data?.detail) {
                this.msg.text = `Error: ${error.response.status} ${error.response.data.detail}`;
              } else if (error.response.data?.error) {
                this.msg.text = `Error: ${error.response.status} ${error.response.data.error}`;
              }
            }
          }

          this.inprogress = false;
        } finally {
          this.$scrollToTop();
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
    fileChanged(e) {
      console.log(e.target.files);
      this.step1.files = Array.from(e.target.files);

      if (!this.step1.files) {
        return;
      }

      // 1 check count, max 5
      if (this.step1.files.length > 5) {
        this.fileAlert = "Max 5 files";
        this.$refs.files.value = null;
        this.step1.files = [];
        return;
      } else {
        this.fileAlert = "";
      }

      // 2 check size, set to step1.file
      const max = this.fileSizeMaxMb * 1048576; // 1MB = 1048576 Bytes

      let size = 0;
      this.step1.files.map((f) => (size += f.size));
      console.log("size: ", size);

      if (size > max) {
        this.fileAlert = `File size too big, limit: ${this.fileSizeMaxMb}Mb`;
        this.$refs.files.value = null;
        this.step1.files = [];
      } else {
        this.fileAlert = "";
      }
    },
    resetFile(i) {
      this.step1.files.splice(i, 1);
    },
    showModalRegistrationSuccess() {
      Swal.fire({
        imageUrl: require("@/assets/images/vendor-registration-success.svg"),
        imageHeight: 173,
        imageAlt: "",
        html: "Please log in now to activate your payment system in order for your account to be reviewed.",
        showCloseButton: true,
        showCancelButton: false,
        showConfirmButton: false,
        showDenyButton: true,
        denyButtonText: "Log in",
        confirmButtonText: "Attach stripe acc",
        customClass: {
          confirmButton: "btn btn-primary mt-0 mb-2",
          denyButton: "btn btn-outline-primary mt-0 mb-2",
        },
      }).then((result) => {
        if (result.isConfirmed) {
          // console.log("go to Attach stripe acc page...");
        } else if (result.isDenied) {
          this.$router.push("/login?tab=vendor");
        }
      });
    },
    moveToNextField(e, ref) {
      this.$nextTick(() => {
        this.$refs[ref][0].focus();
      });
    },
    prepareData() {
      // cartypes, add checkbox and value = ""
      this.step2.cartypes = this.carTypes.map((t) => ({
        ...t,
        checked: false,
        value: "",
        baseprice: "",
      }));

      // services, add checkbox and value = ""
      this.step2.services = this.opt?.VENDOR_SERVICES.map((s) => ({
        ...s,
        checked: false,
        value: "",
      }));
    },
    addOvertime() {
      // set next diapason, calc from arr
      let start = 1;
      this.step2.overtimes.map((overtime) => {
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

      this.step2.overtimes.push(overtime);
    },
    removeOvertime(id) {
      // console.log("removeOvertime, id: ", id);
      this.step2.overtimes = this.step2.overtimes.filter(
        (overtime) => overtime.id !== id
      );
    },
    getPrice(str) {
      return parseFloat(String(str).match(/(\d+)(\.\d+)?/g));
    },
    getOverflowTime(timeid) {
      return this.sliderSteps.find((step) => step.id === timeid);
    },
    closeModal() {
      this.showModalTerms = false;
      this.showModalAgreements = false;
      this.showPrivacyPolicyModal = false;

      this.$router.replace({ 'query': null }).catch(err => { });
    },
  },
  watch: {
    place: {
      handler: function () {
        // get city id - "Bossier City, LA"
        if (this.place) {
          const city = getCity(this.place);

          if (city.name.length) {
            this.step1.state = city.name[1];
            this.step1.city = city.name.join(", ");
          }
        } else {
          this.step1.state = "";
          this.step1.city = "";
        }
      },
      deep: true,
    },
    "step1.files": {
      handler: function () {
        console.log("step1.files: ", this.step1.files);
      },
      deep: true,
    },
    '$route.query.page': {
      handler: function (page) {
        switch (page) {
          case 'agreements':
            this.showModalAgreements = true;
            break;
          case 'terms':
            this.showModalTerms = true;
            break;
          case 'policy':
            this.showPrivacyPolicyModal = true;
            break;
        }
      },
      deep: false,
      immediate: true
    },
  },
};
</script>

<style lang="scss" scoped>
.material-symbols-rounded.ico-back {
  position: relative;
  top: -2px;
  left: 4px;
}

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
</style>
