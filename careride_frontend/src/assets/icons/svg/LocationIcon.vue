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
      d="M8.47949 10.0833H13.5212"
      :stroke="color"
      stroke-width="1.5"
      stroke-linecap="round"
    />

    <path
      d="M11 12.6042V7.5625"
      :stroke="color"
      stroke-width="1.5"
      stroke-linecap="round"
    />

    <path
      d="M3.31823 7.78248C5.12406 -0.155852 16.8849 -0.146685 18.6816 7.79165C19.7357 12.4483 16.8391 16.39 14.2999 18.8283C12.4574 20.6066 9.5424 20.6066 7.69073 18.8283C5.16073 16.39 2.26406 12.4391 3.31823 7.78248Z"
      :stroke="color"
      stroke-width="1.5"
    />
  </svg>
</template>

<script>
export default {
  name: "LocationIcon",
  props: {
    width: { type: [Number, String], default: 22 },
    height: { type: [Number, String], default: 22 },
    className: { type: String, default: "" },
    color: { type: String, default: "white" }
  }
};
</script>