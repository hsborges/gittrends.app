<template>
  <div
    v-if="repository"
    class="details flex flex-col border border-secondary-200 rounded"
  >
    <div class="header flex-block py-4 px-2 bg-primary text-center">
      <a
        class="relative float-right -mt-3 text-white cursor-pointer"
        @click="$emit('dismiss', true)"
      >
        <i class="fas fa-times"></i>
      </a>
      <p class="text-xl font-bold text-white">
        <i class="fab fa-github px-2"></i>
        {{ repository.full_name }}
      </p>
      <p class="text-sm md:text-base text-white pt-2 md:pt-0">
        {{ repository.description }}
      </p>
    </div>
    <div class="overview flex flex-col items-center">
      <h1>I. Overview</h1>
      <Overview v-if="repository" :repository="repository"></Overview>
    </div>
    <div class="stargazers flex flex-col flex-grow">
      <h1>II. Popularity</h1>
      <div class="flex flex-grow justify-center">
        <Stargazers
          v-if="repository._resources.stargazers"
          :repository="repository"
        ></Stargazers>
        <NotAvailable v-else></NotAvailable>
      </div>
    </div>
    <div class="stargazers flex flex-col flex-grow">
      <h1>III. Promotion on Social Media Sites</h1>
      <div class="flex flex-col items-center justify-center py-8">
        <i class="text-center fas fa-bullhorn text-4xl text-primary"></i>
        <p class="w-5/6 text-center pt-4">
          Promotion on social media sites is essentially important to achieve a
          large number of developers. We are currently processing posts on
          social media sites, such as HN and Reddit, to bring insights on the
          most effective posts (i.e., those with most upvotes).
        </p>
      </div>
    </div>
  </div>
  <Loading v-else class="flex flex-grow h-40"></Loading>
</template>

<script>
import axios from "axios";

import Loading from "@/components/Loading.vue";
import NotAvailable from "@/components/explorer/NotAvailable.vue";
import Overview from "@/components/explorer/OverviewSection.vue";
import Stargazers from "@/components/explorer/StargazersSection.vue";

export default {
  name: "repositoryDetails",
  props: ["id"],
  components: { Loading, NotAvailable, Overview, Stargazers },
  data() {
    return {
      repository: null,
      resources: null
    };
  },
  created() {
    axios(`/api/repos/${this.id}`).then(({ data }) => (this.repository = data));
  },
  mounted() {
    setTimeout(
      () => window.scrollTo({ top: 0, left: 0, behavior: "smooth" }),
      100
    );
  }
};
</script>

<style lang="stylus" scoped>
h1 {
  @apply: flex font-bold justify-center w-full px-4 bg-primary-100;
  @apply: border-b border-t border-secondary-200;
}
</style>
