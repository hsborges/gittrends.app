<template>
  <div class="details flex flex-col w-full border border-secondary-200 rounded">
    <div class="header flex-block flex-grow py-4 px-2 bg-primary text-center">
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
      <Overview :repository="repository"></Overview>
    </div>
    <div class="stargazers flex flex-col">
      <h1>II. Popularity</h1>
      <div class="flex justify-center">
        <Stargazers :repository="repository"></Stargazers>
      </div>
    </div>
  </div>
</template>

<script>
import Overview from "@/components/explorer/OverviewSection.vue";
import Stargazers from "@/components/explorer/StargazersSection.vue";

export default {
  name: "repositoryDetails",
  props: ["repository"],
  components: { Overview, Stargazers }
};
</script>

<style lang="stylus" scoped>
h1
  @apply flex font-bold justify-center w-full px-4 bg-primary-100;
  @apply border-b border-t border-secondary-200;
</style>
