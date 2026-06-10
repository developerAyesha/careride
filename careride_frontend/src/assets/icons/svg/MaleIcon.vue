<template>
  <svg
    :width="width"
    :height="height"
    viewBox="0 0 20 20"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    :class="className"
  >
    <path
      d="M2.5 12.5V17.5H7.5M2.91667 17.0833L8.75 11.25"
      :stroke="color"
      stroke-width="1.5"
      stroke-linecap="round"
      stroke-linejoin="round"
    />
    <path
      d="M17.5 7.5C17.5 10.2614 15.2614 12.5 12.5 12.5C9.73858 12.5 7.5 10.2614 7.5 7.5C7.5 4.73857 9.73858 2.5 12.5 2.5C15.2614 2.5 17.5 4.73857 17.5 7.5Z"
      :stroke="color"
      stroke-width="1.5"
      stroke-linecap="round"
      stroke-linejoin="round"
    />
  </svg>
</template>

<script>
export default {
  name: "MaleIcon",
  props: {
    width: {
      type: [String, Number],
      default: 20,
    },
    height: {
      type: [String, Number],
      default: 20,
    },
    color: {
      type: String,
      default: "#202020",
    },
    className: {
      type: String,
      default: "",
    },
  },
};
</script>