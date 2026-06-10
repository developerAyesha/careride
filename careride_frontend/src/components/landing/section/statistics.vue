<template>
  <section class="section-statistics">
    <div class="container-fluid">
      <h1 class="section-title text-center text-lg-left">
        Current <i>statistics</i>
      </h1>
      <div class="statistics-list">
        <div
          v-for="(stat, i) in statistics"
          :key="i"
          class="statistics-list-item"
        >
          <div class="statistics-list-item-val">{{ stat.val }}</div>
          <div class="statistics-list-item-title">{{ stat.title }}</div>
        </div>
      </div>
      <div class="section-statistics-notice">
        * Bureau of Transportation Statistics. ** US Department of
        Transportation. *** Center for Disease Control and Prevention
      </div>
    </div>
  </section>
</template>

<script>
export default {
  data() {
    return {
      statistics: [
        {
          val: "2M",
          title:
            "new wheelchair users in the USA are expected to appear every year*",
        },
        {
          val: "3.6M",
          title:
            "is the number of Americans with travel-limited disabilities do not leave their homes*",
        },
        {
          val: "8.5%",
          title:
            "of the USA population ages 5 and older have disabilities that make traveling outside the home difficult **",
        },
        {
          val: "13.7%",
          title:
            "of people with a disability in the US have serious difficulty walking or climbing stairs ***",
        },
        {
          val: "4%",
          title:
            "is an expected year-to-year growth of the need for NEMT (non-emergency medical transportation)",
        },
        {
          val: "1 in 4",
          title:
            "US adults have a disability that impacts major life activities ***",
        },
      ],
    };
  },
};
</script>

<style lang="scss" scoped></style>
