<template>
  <div class="explorer flex flex-col w-11/12 lg:w-4/6 items-center">
    <div class="filter w-full py-2">
      <div class="inline-flex text-secondary text-sm md:text-base">
        <span class="py-1 leading-tight">Language:</span>
        <select
          class="appearance-none pr-2 py-1 leading-tight font-bold cursor-pointer"
          v-model="filter.language"
          :value="filter.language"
          @change="update"
        >
          <option :value="null" selected>All &#9662;</option>
          <option
            v-for="lang in languages"
            :key="lang.primary_language"
            :value="lang.primary_language"
            >{{ lang.primary_language }}</option
          >
        </select>
      </div>

      <div
        class="search flex w-3/6 md:w-2/6 px-2 float-right text-sm md:text-base"
      >
        <input
          type="text"
          class="flex w-full"
          v-model="filter.query"
          @keypress.enter="update"
        />
        <a class="cursor-pointer text-sm opacity-25 hover:opacity-100">
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
    <div v-if="!repository" class="paginator">
      <span v-if="filter.page > 0" @click="updatePage(0)">&#171;</span>
      <span v-if="filter.page > 0" @click="updatePage((filter.page -= 1))">
        &#8249;
      </span>
      <span v-if="filter.page > 0" @click="updatePage((filter.page -= 1))">
        {{ filter.page }}
      </span>
      <span class="active">{{ filter.page + 1 }}</span>
      <span
        v-if="repositories && repositories.length == filter.limit"
        @click="updatePage((filter.page += 1))"
        >{{ filter.page + 2 }}</span
      >
      <span
        v-if="repositories && repositories.length == filter.limit"
        @click="updatePage((filter.page += 1))"
        >&#8250;</span
      >
    </div>
    <Details
      v-if="repository"
      :repository="repository"
      @dismiss="dismiss"
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
  beforeMount() {
    this.reset();
    axios("/api/search/languages").then(({ data }) => (this.languages = data));
  },
  mounted() {
    this.filter = {
      ...this.filter,
      ..._.pick(this.$route.query, ["query", "language"])
    };

    this.filter.query = this.$route.query.open || this.filter.query;

    this.update().then(() => {
      if (this.filter.query && this.repositories.length === 1)
        this.showDetails(this.repositories[0]);
    });
  },
  methods: {
    reset() {
      this.repository = null;
      this.repositories = null;
      this.filter = {
        language: null,
        query: null,
        limit: 10,
        page: 0,
        sort: "stargazers"
      };
    },
    async update() {
      window.scrollTo({ top: 0, left: 0, behavior: "smooth" });

      const query = _(this.filter)
        .pick(["language", "query"])
        .pickBy((v) => v)
        .value();

      if (!_.isEmpty(query) && !_.isEqual(this.$route.query, query))
        this.$router.replace({ query });

      await axios(`/api/search/repos?${qs.encode(this.filter)}`).then((res) => {
        this.repository = null;
        this.repositories = res.data;
      });
    },
    async updatePage(page) {
      this.filter.page = page;
      await this.update();
    },
    async showDetails(repo) {
      if (this.repository && this.repository.id === repo.id) return;

      this.filter.query = repo.full_name;
      this.filter.language = repo.primary_language;
      await this.update();

      await axios(`/api/repos/${repo.id}`).then(({ data }) => {
        this.repository = data;
      });
    },
    formatNumber: (v, simple) => {
      if (v < 1000 || simple) return numeral(v).format("0,0");
      return numeral(v).format("0.0a");
    },
    formatTime: (t) => {
      return moment(t).fromNow();
    },
    dismiss() {
      this.reset();
      this.update();
    }
  },
  watch: {
    "$route.query": function(to) {
      if (_.isEmpty(to)) {
        this.reset();
        this.update();
      }
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
    @apply: pt-6 text-lg;
    span
      @apply: border border-secondary-200 px-6 py-1 cursor-pointer;
      &:hover
        @apply: bg-primary-500 font-bold text-secondary;
    span.active
      @apply: bg-primary font-bold text-white;
</style>
