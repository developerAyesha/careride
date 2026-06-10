<template>
  <svg
    :width="width"
    :height="height"
    viewBox="0 0 30 30"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    :class="className"
  >
    <foreignObject x="-24" y="-24" width="77.4355" height="77.4387">
      <div
        xmlns="http://www.w3.org/1999/xhtml"
        :style="`backdrop-filter:blur(12px);clip-path:url(#${uid}-bgblur);height:100%;width:100%`"
      />
    </foreignObject>
    <path
      d="M14.7178 0.5C22.5523 0.500073 28.9355 6.88434 28.9355 14.7197C28.9353 22.569 22.5519 28.9384 14.7178 28.9385H14.7109L14.3271 28.9336H14.3203C6.65556 28.7227 0.500215 22.4358 0.5 14.7197C0.5 6.88462 6.86911 0.5 14.7178 0.5Z"
      fill="#FFCCCC"
      fill-opacity="0.1"
      :stroke="`url(#${uid}-grad0)`"
      stroke-linecap="round"
      stroke-linejoin="round"
    />
    <path
      d="M19.4548 21.4746C20.2093 21.5157 20.791 20.9011 20.791 20.1924V18.5649C20.7909 17.83 20.2061 17.3109 19.585 17.2217C19.0467 17.1444 18.5418 16.9769 18.205 16.8446C17.7273 16.657 17.144 16.7371 16.7457 17.1353C15.6897 18.1914 14.0293 18.4728 12.9003 17.4952C12.4976 17.1466 12.1203 16.7693 11.7716 16.3666C10.7941 15.2377 11.0759 13.5775 12.1322 12.5219C12.5305 12.1236 12.6106 11.5403 12.4229 11.0626C12.2907 10.7258 12.1232 10.2209 12.0459 9.68261C11.9566 9.06145 11.4375 8.47668 10.7027 8.47656H9.07519C8.36646 8.47656 7.75181 9.05832 7.79297 9.81274C8.13704 16.0965 13.171 21.1305 19.4548 21.4746Z"
      :fill="`url(#${uid}-grad1)`"
    />

    <defs>
      <clipPath :id="`${uid}-bgblur`" transform="translate(24 24)">
        <path d="M14.7178 0.5C22.5523 0.500073 28.9355 6.88434 28.9355 14.7197C28.9353 22.569 22.5519 28.9384 14.7178 28.9385H14.7109L14.3271 28.9336H14.3203C6.65556 28.7227 0.500215 22.4358 0.5 14.7197C0.5 6.88462 6.86911 0.5 14.7178 0.5Z" />
      </clipPath>
      <linearGradient :id="`${uid}-grad0`" x1="5.36725" y1="4.19664" x2="22.8706" y2="25.8723" gradientUnits="userSpaceOnUse">
        <stop stop-color="white" stop-opacity="0.25" />
        <stop offset="1" stop-color="white" stop-opacity="0" />
      </linearGradient>
      <linearGradient :id="`${uid}-grad1`" x1="20.791" y1="8.47656" x2="11.6248" y2="19.1969" gradientUnits="userSpaceOnUse">
        <stop stop-color="#FF9696" />
        <stop offset="1" stop-color="#E52323" />
      </linearGradient>
    </defs>
  </svg>
</template>

<script>
let counter = 0

export default {
  name: 'PhoneIcon',
  props: {
    width: { default: 30 },
    height: { default: 30 },
    className: { default: '' }
  },
  data() {
    return {
      uid: `phone-icon-${counter++}`
    }
  }
}
</script>