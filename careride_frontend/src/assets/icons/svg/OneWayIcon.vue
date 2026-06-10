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
      d="M10.0827 8.2513V5.00059C10.0827 4.2646 10.6793 3.66797 11.4153 3.66797C11.7381 3.66797 12.0499 3.78513 12.2929 3.99769L18.5595 9.48101C18.9979 9.86464 19.2493 10.4188 19.2493 11.0013C19.2493 11.5838 18.9979 12.138 18.5595 12.5216L12.2929 18.0049C12.0499 18.2175 11.7381 18.3346 11.4153 18.3346C10.6793 18.3346 10.0827 17.738 10.0827 17.002V13.7513H7.33268C6.82643 13.7513 6.41602 13.3409 6.41602 12.8346V9.16797C6.41602 8.66171 6.82643 8.2513 7.33268 8.2513H10.0827Z"
      :stroke="color"
      stroke-width="1.5"
      stroke-linecap="round"
      stroke-linejoin="round"
    />

    <path
      d="M2.75 8.25V13.75"
      :stroke="color"
      stroke-width="1.5"
      stroke-linecap="round"
      stroke-linejoin="round"
    />
  </svg>
</template>

<script>
export default {
  name: "OneWayIcon",
  props: {
    width: { type: [Number, String], default: 22 },
    height: { type: [Number, String], default: 22 },
    className: { type: String, default: "" },
    color: { type: String, default: "#202020" }
  }
};
</script>