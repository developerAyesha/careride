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
      d="M9.16732 13.75H3.20898C2.78187 13.75 2.56832 13.75 2.39986 13.8198C2.17525 13.9128 1.99679 14.0913 1.90376 14.3159C1.83398 14.4843 1.83398 14.6979 1.83398 15.125C1.83398 15.5521 1.83398 15.7657 1.90376 15.9341C1.99679 16.1587 2.17525 16.3372 2.39986 16.4302C2.56832 16.5 2.78187 16.5 3.20898 16.5H9.16732V13.75Z"
      :stroke="color"
      stroke-width="1.5"
      stroke-linecap="round"
      stroke-linejoin="round"
    />

    <path
      d="M11.9173 11H6.41732C5.55308 11 5.12096 11 4.85247 11.2685C4.58398 11.537 4.58398 11.9691 4.58398 12.8333V13.75H11.9173V11Z"
      :stroke="color"
      stroke-width="1.5"
      stroke-linecap="round"
      stroke-linejoin="round"
    />

    <path
      d="M9.16602 16.5H16.4993C18.2278 16.5 19.092 16.5 19.629 15.963C20.166 15.426 20.166 14.5618 20.166 12.8333V7.33333C20.166 6.46909 20.166 6.03697 19.8975 5.76848C19.629 5.5 19.1969 5.5 18.3327 5.5H17.416"
      :stroke="color"
      stroke-width="1.5"
      stroke-linecap="round"
      stroke-linejoin="round"
    />

    <path
      d="M14.6673 8.25H9.16732C8.30308 8.25 7.87096 8.25 7.60247 8.51848C7.33398 8.78697 7.33398 9.2191 7.33398 10.0833V11H14.6673V8.25Z"
      :stroke="color"
      stroke-width="1.5"
      stroke-linecap="round"
      stroke-linejoin="round"
    />

    <path
      d="M17.4173 5.5H11.9173C11.0531 5.5 10.621 5.5 10.3525 5.76848C10.084 6.03697 10.084 6.46909 10.084 7.33333V8.25H17.4173V5.5Z"
      :stroke="color"
      stroke-width="1.5"
      stroke-linecap="round"
      stroke-linejoin="round"
    />
  </svg>
</template>

<script>
export default {
  name: "StairIcon",
  props: {
    width: { type: [Number, String], default: 22 },
    height: { type: [Number, String], default: 22 },
    className: { type: String, default: "" },
    color: { type: String, default: "#202020" }
  }
};
</script>