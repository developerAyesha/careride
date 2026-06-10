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
      d="M12.1083 7.89166L7.8916 12.1083C7.34994 11.5667 7.0166 10.825 7.0166 10C7.0166 8.35 8.34993 7.01666 9.99993 7.01666C10.8249 7.01666 11.5666 7.35 12.1083 7.89166Z"
      :stroke="color"
      stroke-width="1.5"
      stroke-linecap="round"
      stroke-linejoin="round"
    />

    <path
      d="M14.8499 4.8087C13.3915 3.7087 11.7249 3.1087 9.99987 3.1087C7.0582 3.1087 4.31654 4.84204 2.4082 7.84204C1.6582 9.01704 1.6582 10.992 2.4082 12.167C3.06654 13.2004 3.8332 14.092 4.66654 14.8087"
      :stroke="color"
      stroke-width="1.5"
      stroke-linecap="round"
      stroke-linejoin="round"
    />

    <path
      d="M7.0166 16.2748C7.9666 16.6748 8.97493 16.8914 9.99993 16.8914C12.9416 16.8914 15.6833 15.1581 17.5916 12.1581C18.3416 10.9831 18.3416 9.00809 17.5916 7.83309C17.3166 7.39976 17.0166 6.99143 16.7083 6.60809"
      :stroke="color"
      stroke-width="1.5"
      stroke-linecap="round"
      stroke-linejoin="round"
    />

    <path
      d="M12.9252 10.5833C12.7085 11.7583 11.7502 12.7166 10.5752 12.9333"
      :stroke="color"
      stroke-width="1.5"
      stroke-linecap="round"
      stroke-linejoin="round"
    />

    <path
      d="M7.89199 12.1086L1.66699 18.3336"
      :stroke="color"
      stroke-width="1.5"
      stroke-linecap="round"
      stroke-linejoin="round"
    />

    <path
      d="M18.3334 1.66669L12.1084 7.89169"
      :stroke="color"
      stroke-width="1.5"
      stroke-linecap="round"
      stroke-linejoin="round"
    />
  </svg>
</template>

<script>
export default {
  name: "EyeSlashIcon",

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
};
</script>