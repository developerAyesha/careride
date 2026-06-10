<template>
  <svg
    :width="width"
    :height="height"
    viewBox="0 0 22 22"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    :class="className"
  >
    <rect
      x="1"
      y="8.49622"
      width="20"
      height="3.5"
      rx="1.75"
      :stroke="color"
      stroke-width="1.5"
      stroke-linecap="round"
    />

    <path
      d="M7 18.5C7 19.3284 6.32843 20 5.5 20C4.67157 20 4 19.3284 4 18.5C4 17.6716 4.67157 17 5.5 17C6.32843 17 7 17.6716 7 18.5Z"
      :stroke="color"
      stroke-width="1.5"
    />

    <path
      d="M18 18.5C18 19.3284 17.3284 20 16.5 20C15.6716 20 15 19.3284 15 18.5C15 17.6716 15.6716 17 16.5 17C17.3284 17 18 17.6716 18 18.5Z"
      :stroke="color"
      stroke-width="1.5"
    />

    <rect
      x="4.92773"
      y="2"
      width="7.23914"
      height="3.42004"
      rx="1.71002"
      transform="rotate(34.6868 4.92773 2)"
      :stroke="color"
      stroke-width="1.5"
      stroke-linecap="round"
    />

    <line
      x1="0.75"
      y1="-0.75"
      x2="11.1578"
      y2="-0.75"
      transform="matrix(0.863779 -0.503871 0.393919 0.919145 6.71289 18.4961)"
      :stroke="color"
      stroke-width="1.5"
      stroke-linecap="round"
    />

    <line
      x1="0.75"
      y1="-0.75"
      x2="11.1578"
      y2="-0.75"
      transform="matrix(-0.863779 -0.503871 -0.393919 0.919145 15.2852 18.4961)"
      :stroke="color"
      stroke-width="1.5"
      stroke-linecap="round"
    />

    <line
      x1="4.20801"
      y1="6.53628"
      x2="3.04006"
      y2="8.2882"
      :stroke="color"
      stroke-width="1.5"
      stroke-linecap="round"
    />
  </svg>
</template>

<script>
export default {
  name: "GurneyIcon",
  props: {
    width: { type: [Number, String], default: 22 },
    height: { type: [Number, String], default: 22 },
    className: { type: String, default: "" },
    color: { type: String, default: "#202020" }
  }
};
</script>