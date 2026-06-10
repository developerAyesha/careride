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
      d="M11.9173 15.1237C11.9173 17.9082 9.66012 20.1654 6.87565 20.1654C4.09121 20.1654 1.83398 17.9082 1.83398 15.1237C1.83398 12.3392 4.09121 10.082 6.87565 10.082C9.66012 10.082 11.9173 12.3392 11.9173 15.1237Z"
      :stroke="color"
      stroke-width="1.5"
      stroke-linecap="round"
      stroke-linejoin="round"
    />

    <path
      d="M20.1667 18.3333C20.1667 19.3459 19.3459 20.1667 18.3333 20.1667C17.3208 20.1667 16.5 19.3459 16.5 18.3333C16.5 17.3208 17.3208 16.5 18.3333 16.5C19.3459 16.5 20.1667 17.3208 20.1667 18.3333Z"
      :stroke="color"
      stroke-width="1.5"
      stroke-linecap="round"
      stroke-linejoin="round"
    />

    <path
      d="M11.918 12.832H15.5846C17.1035 12.832 18.3346 14.0632 18.3346 15.582V16.4987"
      :stroke="color"
      stroke-width="1.5"
      stroke-linecap="round"
      stroke-linejoin="round"
    />

    <path
      d="M4.58398 10.082V3.66536C4.58398 2.65284 3.76317 1.83203 2.75065 1.83203H1.83398"
      :stroke="color"
      stroke-width="1.5"
      stroke-linecap="round"
      stroke-linejoin="round"
    />

    <path
      d="M4.58398 6.41797H16.5007"
      :stroke="color"
      stroke-width="1.5"
      stroke-linecap="round"
      stroke-linejoin="round"
    />

    <path
      d="M14.668 6.41797V12.8346"
      :stroke="color"
      stroke-width="1.5"
      stroke-linecap="round"
      stroke-linejoin="round"
    />
  </svg>
</template>

<script>
export default {
  name: "WheelChairIcon",
  props: {
    width: { type: [Number, String], default: 22 },
    height: { type: [Number, String], default: 22 },
    className: { type: String, default: "" },
    color: { type: String, default: "#202020" }
  }
};
</script>