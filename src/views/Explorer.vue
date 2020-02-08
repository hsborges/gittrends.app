<template>
  <div class="explorer flex flex-col w-11/12 lg:w-4/6 items-center">
    <div v-if="filter" class="filter w-full py-2">
      <div class="inline-flex text-secondary text-sm md:text-base">
        <span class="py-1 leading-tight">Language:</span>
        <select
          class="appearance-none pr-2 py-1 leading-tight font-bold cursor-pointer"
          v-model="filter.language"
          @change="update"
        >
          <option :value="undefined">All &#9662;</option>
          <option
            v-for="lang in languages"
            :key="lang.primary_language"
            :value="lang.primary_language"
            >{{ lang.primary_language }}</option
          >
        </select>
      </div>

      <div class="search w-3/6 md:w-2/6 px-2 float-right text-sm md:text-base">
        <input
          class="w-4/6"
          type="text"
          v-model="filter.query"
          @keypress.enter="update"
        />
        <a
          class="relative float-right cursor-pointer text-sm opacity-25 hover:opacity-100 pl-2"
        >
          <i class="fas fa-times py-1" @click="reset() && update()"></i>
        </a>
        <a
          class="relative float-right cursor-pointer text-sm opacity-25 hover:opacity-100"
        >
          <i class="fas fa-search py-1" @click="update"></i>
        </a>
      </div>
    </div>
    <div v-if="repositories && !repository" class="items block w-full">
      <div
        v-for="repo in repositories"
        :key="repo.id"
        class="item flex flex-col"
        @click="showDetails(repo)"
      >
        <div class="flex info">
          <div class="icon flex flex-shrink-0 w-16 items-center justify-center">
            <i v-if="!repo.homepage" class="fas fa-book"></i>
            <img
              v-else
              :src="`http://www.google.com/s2/favicons?domain=${repo.homepage}`"
            />
          </div>
          <div class="content flex-block flex-grow py-2 pr-3">
            <p class="font-bold text-secondary">{{ repo.full_name }}</p>
            <p class="text-sm text-secondary-lighter">{{ repo.description }}</p>
            <p class="counters flex text-sm text-secondary-lighter">
              <span
                v-if="repo.primary_language"
                title="Primary programming language"
              >
                <i class="fas fa-code"></i>
                {{ repo.primary_language }}
              </span>
              <span title="Number of stars">
                <i class="fas fa-star"></i>
                {{ formatNumber(repo.stargazers_count) }}
              </span>
              <span title="Number of forks">
                <i class="fas fa-code-branch"></i>
                {{ formatNumber(repo.forks_count) }}
              </span>
              <span title="Number of watchers" class="hidden md:inline">
                <i class="fas fa-eye"></i>
                {{ formatNumber(repo.watchers_count) }}
              </span>
              <span title="Last updated at" class="hidden md:inline">
                <i class="far fa-clock"></i>
                {{ formatTime(repo.updated_at) }}
              </span>
            </p>
          </div>
        </div>
      </div>
    </div>
    <div v-if="filter && !repository" class="paginator text-sm sm:text-lg">
      <span v-if="filter.page > 0" @click="update({ page: 0 })">&#171;</span>
      <span
        v-if="filter.page > 0"
        @click="update({ page: (filter.page -= 1) })"
      >
        &#8249;
      </span>
      <span
        v-if="filter.page > 0"
        @click="update({ page: (filter.page -= 1) })"
      >
        {{ filter.page }}
      </span>
      <span class="active">{{ filter.page + 1 }}</span>
      <span
        v-if="repositories && repositories.length == filter.limit"
        @click="update({ page: (filter.page += 1) })"
        >{{ filter.page + 2 }}</span
      >
      <span
        v-if="repositories && repositories.length == filter.limit"
        @click="update({ page: (filter.page += 1) })"
        >&#8250;</span
      >
    </div>
    <Details
      v-if="repository"
      :id="repository.id"
      @dismiss="showDetails(null)"
      class="w-full h-full"
    ></Details>
    <Love class="mt-10"></Love>
  </div>
</template>

<script>
import _ from "lodash";
import axios from "axios";
import numeral from "numeral";
import moment from "moment";
import qs from "querystring";

import Love from "@/components/Love.vue";
import Details from "@/components/explorer/RepositoryDetails.vue";

export default {
  name: "explorer",
  components: { Love, Details },
  data() {
    return {
      filter: null,
      languages: null,
      repositories: null,
      repository: null
    };
  },
  async created() {
    await axios("/api/search/languages").then(
      ({ data }) => (this.languages = data)
    );
  },
  async mounted() {
    this.reset();

    const { open, query, language } = this.$route.query;
    this.filter = { ...this.filter, language, query: open || query };

    return this.update().then(() => {
      if ((query || open) && this.repositories.length === 1)
        this.showDetails(this.repositories[0]);
    });
  },
  methods: {
    async reset() {
      this.repositories = this.repository = null;
      this.filter = { limit: 10, page: 0 };
    },
    async updateUrlQuery() {
      const queryParams = _(this.filter)
        .pick(["language", "query"])
        .pickBy((v) => v)
        .value();

      if (!_.isEqual(this.$route.query, queryParams))
        this.$router.replace({ query: queryParams });
    },
    async update({
      page = this.filter.page,
      language = this.filter.language,
      query = this.filter.query
    } = {}) {
      this.filter = { ...this.filter, page, language, query };
      this.updateUrlQuery();

      this.repositories = (
        await axios(`/api/search/repos?${qs.encode(this.filter)}`)
      ).data;

      setTimeout(
        () => window.scrollTo({ top: 0, left: 0, behavior: "smooth" }),
        150
      );
    },
    async showDetails(repo) {
      this.repository = repo;
      if (repo) this.$router.replace({ query: { open: repo.full_name } });
    },
    formatNumber: (v, simple) => {
      if (v < 1000 || simple) return numeral(v).format("0,0");
      return numeral(v).format("0.0a");
    },
    formatTime: (t) => {
      return moment(t).fromNow();
    }
  },
  watch: {
    "$route.query": function(to) {
      if (_.isEmpty(to)) this.reset() && this.update();
    }
  }
};
</script>

<style lang="stylus" scoped>
.explorer
  margin: 5vh auto 0px auto;
  .filter
    .search
      @apply: border border-secondary-200 rounded appearance-none leading-normal;

  .items
    @apply: border border-secondary-200 rounded;
    .item
      @apply: flex w-full border-b border-secondary-200;
      &:hover
        @apply: cursor-pointer bg-primary-100;
      .counters span
        @apply pr-2;

  .paginator
    @apply: pt-6;
    span
      @apply: border border-secondary-200 px-4 py-1 cursor-pointer;
      &:hover
        @apply: bg-primary-500 font-bold text-secondary;
    span.active
      @apply: bg-primary font-bold text-white;
</style>
