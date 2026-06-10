<template>
  <Layout>
    <div class="mx-w mx-auto mb-3">
      <h1 class="display-3 mb-3">FAQ</h1>

      <div v-for="(quest, i) in faq" :key="quest.id" class="card card-faq">
        <div class="card-body">
          <div class="card-faq-title" v-b-toggle="`card-faq-body-${quest.id}`">
            {{ i + 1 }}. {{ quest.title }}
            <span class="material-symbols-rounded card-faq-title-ico">
              expand_more
            </span>
          </div>
          <b-collapse
            class="card-faq-body"
            :id="`card-faq-body-${quest.id}`"
            :visible="i === 0"
          >
            <div class="pt-3" v-html="quest.text"></div>
          </b-collapse>
        </div>
      </div>
    </div>
  </Layout>
</template>

<script>
import Layout from "@/views/layouts/main";
import faqData from "@/components/data/faq";

export default {
  metaInfo() {
    return {
      title: this.$appConfig.title + " | FAQ",
    };
  },
  components: {
    Layout,
  },
  data() {
    return {
      faq: faqData,
    };
  },
  created() {},
  methods: {},
};
</script>
<style scoped lang="scss">
.card-faq {
  &-title {
    font-size: 24px;
    font-weight: 600;
    color: #293331;
    padding: 0 40px 0 0;

    .card-faq-title-ico {
      position: absolute;
      top: 24px;
      right: 24px;
      font-size: 38px;
      color: #199f97;
      transform: rotateX(0);
      transition: transform 0.3s linear;
    }

    &.not-collapsed .card-faq-title-ico {
      transform: rotateX(180deg);
    }
  }

  &-body {
    font-size: 20px;
    font-weight: 400;
    color: #505655;

    :deep {
      b {
        font-weight: 600;
      }

      p {
        padding: 0;
        margin: 16px 0 0 0;
      }

      p:first-child {
        margin-top: 0;
      }
    }
  }
}
</style>
