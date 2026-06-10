<template>
  <svg
    :width="width"
    :height="height"
    viewBox="0 0 20 20"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    :class="className"
  >
    <g :clip-path="`url(#${uid}-clip)`">
      <path
        d="M15 6.66797C15 9.42939 12.7614 11.668 10 11.668C7.23857 11.668 5 9.42939 5 6.66797C5 3.90654 7.23857 1.66797 10 1.66797C12.7614 1.66797 15 3.90654 15 6.66797Z"
        :stroke="color"
        stroke-width="1.5"
        stroke-linecap="round"
        stroke-linejoin="round"
      />
      <path
        d="M10 11.668V19.0015M7.5 17.5015L12.5 13.5015M12.5 17.5015L7.5 13.5015"
        :stroke="color"
        stroke-width="1.5"
        stroke-linecap="round"
        stroke-linejoin="round"
      />
    </g>

    <defs>
      <clipPath :id="`${uid}-clip`">
        <rect width="20" height="20" fill="white" />
      </clipPath>
    </defs>
  </svg>
</template>

<script>
let counter = 0;

export default {
  name: "NonBinaryIcon",
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
      default: "#747574",
    },
    className: {
      type: String,
      default: "",
    },
  },

  data() {
    return {
      uid: `non-binary-icon-${counter++}`,
    };
  },
};
</script>