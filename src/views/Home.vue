<template>
  <div class="flex flex-col flex-grow">
    <div
      class="text-center flex-block lg:flex lg:justify-center lg:items-center
              text-4xl md:text-4xl xl:text-5xl text-primary font-bold leading-none
              py-10 lg:pt-16 lg:pb-12 xl:p-16 text-center"
    >
      Monitoring popular
      <br /><i class="fab fa-github px-0 lg:px-3"></i>
      projects
    </div>
    <div class="flex flex-col flex-grow items-center">
      <span class="text-lg lg:text-xl py-4 lg:py-6"
        >Find your favorite project ...</span
      >
      <div class="flex items-center w-5/6 lg:w-1/2">
        <Search
          class="py-2 px-4 border border-gray-500 rounded-full appearance-none leading-normal"
          @search="search"
        >
        </Search>
      </div>

      <span class="text-lg lg:text-xl py-4 lg:py-6">
        or just pick a popular one
      </span>
      <div
        v-if="repositories"
        class="flex flex-wrap justify-center w-full sm:w-5/6 md:w-4/6"
      >
        <a
          v-for="repo in repositories"
          :key="repo._id"
          class="flex border border-primary rounded m-1 sm:m-2 cursor-pointer"
          @click="select(repo)"
        >
          <div class="flex flex-grow items-center text-sm px-2">
            <span class="hidden lg:block leading-none">
              {{ repo.full_name }}
            </span>
            <span class="lg:hidden leading-none">
              {{ repo.full_name.match(/.+\/(.+)/)[1] }}
            </span>
          </div>
          <div
            class="flex flex-col bg-primary p-1 lg:p-2
             text-white font-bold text-xs sm:text-sm"
          >
            <span class="leading-normal sm:leading-none">
              <i class="fas fa-star"></i>
              {{ format(repo.stargazers_count) }}
            </span>
          </div>
        </a>
      </div>
    </div>
    <Love class="mt-12"></Love>
  </div>
</template>

<script>
import axios from "axios";
import numeral from "numeral";

import Love from "@/components/Love.vue";
import Search from "@/components/SearchBox.vue";

export default {
  name: "home",
  data() {
    return {
      repositories: null
    };
  },
  components: { Love, Search },
  mounted: function() {
    const cardsCount = window.innerWidth > 400 ? 12 : 9;
    axios
      .get(`/api/search/repos?limit=${cardsCount}&random=${this.random(1, 5)}`)
      .then((response) => (this.repositories = response.data.result));
  },
  methods: {
    select(repo) {
      this.$gtag.event("open_card", {
        event_category: this.$route.path,
        event_label: repo.full_name
      });
      this.$router.push(`/explore?open=${repo.full_name}`);
    },
    search(value) {
      this.$router.push(`/explore?query=${value || ""}`);
    },
    format: (v) => (v < 1000 ? v : numeral(v).format("0.0a")),
    random(min, max) {
      min = Math.ceil(min);
      max = Math.floor(max);
      return Math.floor(Math.random() * (max - min + 1)) + min;
    }
  }
};
</script>

<style lang="stylus" scoped></style>
