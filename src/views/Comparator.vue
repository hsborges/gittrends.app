<template>
  <div class="flex flex-col flex-grow justify-center items-center">
    <div
      class="flex flex-col w-11/12 sm:w-1/2 pt-6 pb-8"
      :class="{ 'flex-grow justify-center': !hasRepositories }"
    >
      <label
        class="text-center text-2xl sm:text-3xl text-primary font-bold leading-normal pb-2"
        :class="{ 'pb-8': !hasRepositories }"
        for="search-box"
      >
        Find a repository to compare
      </label>
      <Search
        class="h-10 py-2 px-4 rounded-lg"
        ref="searchBar"
        :id="'search-box'"
        :placeholder="'Project\' name (e.g., twbs/bootstrap)'"
        @search="find"
      ></Search>
      <span class="text-center text-red-300" v-if="message">{{ message }}</span>
      <span
        class="flex text-center text-sm sm:text-base text-secondary-500 sm:-mx-12"
        :class="`pt-${hasRepositories ? 2 : 4}`"
        v-if="hasSuggestions"
      >
        <div
          class="flex flex-grow flex-wrap justify-center"
          :class="{ 'flex-col pt-8': hasExamples }"
        >
          <span class="font-bold pr-1">
            {{ hasExamples ? "Examples:" : "Suggestions:" }}
          </span>
          <span
            v-for="(suggestion, i) in suggestions"
            :key="i"
            class="cursor-pointer hover:underline px-1"
            v-html="suggestion.text"
            @click="add(suggestion.id)"
          >
          </span>
        </div>
      </span>
    </div>
    <div
      class="flex w-11/12 sm:w-5/6"
      :class="{ hidden: !hasRepositories && !loading }"
    >
      <table class="table-fixed w-full">
        <thead>
          <tr>
            <th class="w-8 sm:w-32"></th>
            <th
              v-for="(repo, i) in repositories"
              :key="i"
              class="py-1 pr-1 sm:py-2 text-base leading-loose"
              :class="`w-1/${repositories.length}`"
            >
              <div
                class="flex flex-col justify-center items-center"
                :title="repo.full_name"
                v-if="repo"
              >
                <object
                  :data="
                    `/icon?url=${repo.homepage || 'github.com'}&size=16..32..32`
                  "
                  type="image/png"
                  class="w-8 h-auto"
                >
                  <img :src="`/icon?url=github.com&size=16..32..32`" />
                </object>
                <span class="text-sm sm:text-base leading-none py-2">
                  {{ repo.name }}
                  <br />
                  <a
                    title="Go to repository details"
                    class="text-sm cursor-pointer pl-1"
                    :href="`/explore?open=${repo.full_name}`"
                    :target="repo._id"
                  >
                    <i class="pt-1 fas fa-external-link-alt"></i>
                  </a>
                  <a
                    title="Remove"
                    class="text-sm cursor-pointer text-red-400 pl-1"
                    @click="remove(repo._id)"
                  >
                    <i class="pt-1 fas fa-trash-alt"></i>
                  </a>
                </span>
              </div>
            </th>
            <th v-if="loading" :class="`w-1/${repositories.length}`">
              <i class="fas fa-spinner fa-spin"></i>
            </th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="field in fields" :key="field.text">
            <td class="text-right pr-4 py-2 border-r font-bold">
              <i :class="field.icon"></i>
              <span class="hidden sm:inline pl-2">{{ field.text }}</span>
            </td>
            <td
              v-for="(repo, i) in repositories"
              :key="i"
              class="text-center border text-sm sm:text-base"
            >
              <span v-if="repo" :title="field.title && field.title(repo)">
                {{ field.value(repo) }}
              </span>
            </td>
          </tr>
          <tr>
            <td class="text-right pr-4 py-2 border-r font-bold">
              <i class="fas fa-chart-line"></i>
              <span class="hidden sm:inline pl-2">Popularity</span>
            </td>
            <td
              class="border-t border py-8 h-24"
              :colspan="repositories.length"
            >
              <Timeseries
                ref="stargazersChart"
                @notFound="showMessage('Stargazers timeseries missing :(')"
              ></Timeseries>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
    <Share></Share>
    <Love class="flex flex-grow items-end mt-10"></Love>
  </div>
</template>

<script>
import Promise from "bluebird";
import numeral from "numeral";
import moment from "moment";
import axios from "axios";
import _ from "lodash";
import qs from "querystring";

import Love from "@/components/Love.vue";
import Search from "@/components/SearchBox.vue";
import Share from "@/components/ShareButton.vue";
import Timeseries from "@/components/StargazersTimeseries.vue";

export default {
  components: { Love, Search, Timeseries, Share },
  data() {
    return {
      languages: null,
      repositories: [],
      query: null,
      message: null,
      suggestions: [],
      loading: false,
      fields: [
        {
          text: "Language",
          icon: "fas fa-code",
          value: (r) => r.language || "-"
        },
        {
          text: "Stargazers",
          icon: "fas fa-star",
          value: (r) => numeral(r.stargazers_count).format("0,0")
        },
        {
          text: "Forks",
          icon: "fas fa-network-wired",
          value: (r) => numeral(r.forks_count).format("0,0")
        },
        {
          text: "Archived",
          icon: "fas fa-archive",
          value: (r) => (r.archived ? "Yes" : "No")
        },
        {
          text: "Created",
          icon: "fas fa-rocket",
          value: (r) => moment(r.created_at).fromNow(),
          title: (r) => moment(r.created_at).format("LLL")
        },
        {
          text: "Last push",
          icon: "fas fa-arrow-alt-circle-up",
          value: (r) => moment(r.pushed_at).fromNow(),
          title: (r) => moment(r.pushed_at).format("LLL")
        },
        {
          text: "License",
          icon: "far fa-copyright",
          value: (r) => (r.license ? _.toUpper(r.license) : "-")
        },
        {
          text: "Code of Conduct",
          icon: "fas fa-hands-helping",
          value: (r) =>
            r.code_of_conduct ? _.startCase(r.code_of_conduct) : "-"
        }
      ]
    };
  },
  async mounted() {
    this.languages = await axios("/api/search/languages").then(({ data }) =>
      data.result.map((l) => l.language).slice(0, 5)
    );

    const names = _.reduce(
      this.$route.query,
      (a, v, k) => {
        if (k.indexOf("repo") === 0) return a.concat(v);
        return a;
      },
      []
    );

    this.$nextTick(() => {
      if (names && names.length)
        return Promise.mapSeries(names, (name) => this.find(name));
      else return this.suggest();
    });
  },
  computed: {
    hasRepositories() {
      return this.repositories && this.repositories.length > 0;
    },
    hasSuggestions() {
      return this.suggestions && this.suggestions.length > 0;
    },
    hasExamples() {
      return this.suggestions && this.suggestions[0].id.length > 1;
    }
  },
  methods: {
    async suggest() {
      const query = {
        limit: 6,
        random: _.random(5),
        language: _.sample(this.languages)
      };

      this.suggestions = await axios
        .get(`/api/search/repos?${qs.encode(query)}`)
        .then((response) => {
          const repos = _.shuffle(response.data.result);
          const suggestions = [];
          for (let i = 0; i < Math.ceil(repos.length / 2); i++) {
            const r1 = repos[i];
            const r2 = repos[repos.length - i - 1];

            suggestions.push({
              text: `${r1.full_name} &#8644; ${r2.full_name}`,
              id: [r1._id, r2._id]
            });
          }

          return suggestions.sort((a, b) => a.text.length - b.text.length);
        });
    },
    async updateUrl() {
      const query = this.repositories.reduce(
        (m, r, i) => ({ ...m, [`repo${i + 1}`]: r.full_name }),
        {}
      );
      if (!_.isEqual(query, this.$route.query)) this.$router.replace({ query });
    },
    async add(id) {
      if (_.isArray(id)) return Promise.mapSeries(id, (i) => this.add(i));

      if (this.repositories.find((r) => r._id === id))
        return this.showMessage("Repository already added!");

      if (this.repositories.length === 6)
        return this.showMessage(
          "Remove one repository before adding new ones."
        );

      this.suggestions = this.message = null;
      this.loading = true;

      const repo = await axios(`/api/repos/${id}`).then(({ data }) => ({
        ...data,
        name: _.startCase(data.name)
      }));

      this.$gtag.event("select_content", {
        content_type: "comparator",
        content_id: repo.full_name
      });

      this.loading = false;
      this.repositories.push(repo);
      this.$refs.searchBar.clear();
      this.$refs.stargazersChart.addRepository(repo);
      this.updateUrl();
    },
    remove(id) {
      this.repositories = this.repositories.filter((r) => r._id !== id);
      this.$refs.stargazersChart.removeRepository(id);
      this.updateUrl();
      if (!this.repositories.length) this.suggest();
    },
    showMessage(text) {
      this.message = text;
      setTimeout(() => (this.message = null), 3000);
    },
    async find(v) {
      this.$gtag.event("search", { search_term: v, path: this.$route.path });

      if (!v) return;
      else if (v.length < 3)
        return this.showMessage("You must provide at least 4 characters");

      this.suggestions = this.message = null;
      const name = v.trim().toLowerCase();

      const { result } = await axios(
        `/api/search/repos?${qs.encode({ query: name, limit: 5 })}`
      ).then(({ data }) => data);

      if (!result.length) {
        this.showMessage("No repositories found for this query :(");
      } else if (name === result[0].full_name.toLowerCase()) {
        await this.add(result[0]._id);
        this.$refs.searchBar.clear();
      } else {
        this.suggestions = result
          .sort((a, b) => a.full_name.length - b.full_name.length)
          .map((r) => ({ text: r.full_name, id: [r._id] }));
      }
    }
  }
};
</script>

<style lang="stylus" scoped></style>
