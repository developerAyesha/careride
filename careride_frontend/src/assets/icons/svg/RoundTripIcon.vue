<template>
  <svg
    :width="width"
    :height="height"
    viewBox="0 0 22 22"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    :class="className"
  >
    <path
      d="M18.7917 5.04297H8.70833C5.30449 5.04297 2.75 7.50425 2.75 11.0013"
      :stroke="color"
      stroke-width="1.5"
      stroke-linecap="round"
      stroke-linejoin="round"
    />

    <path
      d="M3.20898 16.9583H13.2923C16.6962 16.9583 19.2507 14.4971 19.2507 11"
      :stroke="color"
      stroke-width="1.5"
      stroke-linecap="round"
      stroke-linejoin="round"
    />

    <path
      d="M16.959 2.75C16.959 2.75 19.2507 4.43779 19.2507 5.04169C19.2507 5.64559 16.959 7.33333 16.959 7.33333"
      :stroke="color"
      stroke-width="1.5"
      stroke-linecap="round"
      stroke-linejoin="round"
    />

    <path
      d="M5.04165 14.668C5.04165 14.668 2.75001 16.3557 2.75 16.9596C2.74999 17.5635 5.04167 19.2513 5.04167 19.2513"
      :stroke="color"
      stroke-width="1.5"
      stroke-linecap="round"
      stroke-linejoin="round"
    />
  </svg>
</template>

<script>
export default {
  name: "RoundTripIcon",
  props: {
    width: { type: [Number, String], default: 22 },
    height: { type: [Number, String], default: 22 },
    className: { type: String, default: "" },
    color: { type: String, default: "#202020" }
  }
};
</script>