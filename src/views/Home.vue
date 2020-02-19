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
      <div
        class="flex items-center py-2 px-4 w-5/6 lg:w-1/2
               border border-gray-500 rounded appearance-none leading-normal"
      >
        <input
          class="flex flex-grow w-full"
          placeholder="owner/name"
          v-model="query"
          v-on:keyup.enter="onEnter"
        />
        <a class="cursor-pointer opacity-50 hover:opacity-100" @click="onEnter">
          <i class="fas fa-search"></i>
        </a>
      </div>

      <span class="text-lg lg:text-xl py-4 lg:py-6">
        or just pick a popular one
      </span>
      <div
        v-if="repositories"
        class="repositories-cloud flex flex-wrap justify-center w-full md:w-5/6 lg:w-4/6"
      >
        <Card
          v-for="(item, index) in repositories"
          :repository="item"
          :key="index"
          class="mx-1 my-2 lg:mx-3 lg:my-3"
        ></Card>
      </div>
    </div>
    <Love class="mt-24"></Love>
  </div>
</template>

<script>
import { random } from "lodash";
import axios from "axios";

import Love from "@/components/Love.vue";
import Card from "@/components/home/RepositoryCard.vue";

export default {
  name: "home",
  data() {
    return {
      query: null,
      repositories: null
    };
  },
  components: { Love, Card },
  mounted: function() {
    axios
      .get(`/api/search/repos?limit=9&random=${random(10)}`)
      .then((response) => {
        this.repositories = response.data.result;
      });
  },
  methods: {
    onEnter: function() {
      this.$router.push(`/explore?query=${this.query}`);
    }
  }
};
</script>

<style lang="stylus" scoped></style>
