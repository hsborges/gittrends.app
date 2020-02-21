<template>
  <div class="flex flex-col flex-grow justify-center items-center">
    <div
      class="flex flex-col w-11/12 sm:w-1/2 pt-6 pb-8"
      :class="{ 'flex-grow justify-center': !hasRepositories }"
    >
      <label
        class="text-center text-2xl sm:text-3xl text-primary font-bold leading-normal pb-4"
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
      <span class="text-center text-red-400" v-if="message">{{ message }}</span>
      <span
        class="flex text-center text-sm text-secondary-500"
        :class="`pt-${repositories.length ? 2 : 4}`"
        v-if="hasSuggestions"
      >
        <div class="flex flex-grow flex-wrap justify-center">
          <span class="font-bold pr-1">Suggestions:</span>
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
                  <br class="sm:hidden" />
                  <a
                    title="Remove"
                    class="text-sm cursor-pointer text-red-400 pl-1"
                    @click="remove(repo._id)"
                  >
                    <i class="fas fa-trash-alt"></i>
                  </a>
                </span>
              </div>
            </th>
            <th v-if="loading" :class="`w-1/${repositories.length}`">
              <i class="fas fa-spinner"></i>
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
              <span v-if="repo">{{ field.value(repo) }}</span>
            </td>
          </tr>
          <tr>
            <td class="text-right pr-4 py-2 border-r font-bold">
              <i class="fas fa-chart-line"></i>
              <span class="hidden sm:inline pl-2">Popularity</span>
            </td>
            <td class="border-t border py-8" :colspan="repositories.length">
              <div id="timeseries" class="flex w-full h-40 md:h-64"></div>
              <div
                class="flex justify-center items-center text-xs sm:text-sm pt-4"
              >
                <div class="flex">
                  <span class="font-bold">Stargazers:</span>
                  <select v-model="chartType" @change="loadChart">
                    <option value="cumulative">Cumulative</option>
                    <option value="gained">Gained</option>
                  </select>
                </div>
                <span class="px-2 sm:px-4">-</span>
                <div class="flex">
                  <span class="font-bold">Scale:</span>
                  <select v-model="chartScale" @change="changeScale">
                    <option value="linear">Linear</option>
                    <option value="log">Log</option>
                  </select>
                </div>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
    <Love class="flex flex-grow items-end mt-10"></Love>
  </div>
</template>

<script>
import Promise from "bluebird";
import _ from "lodash";
import numeral from "numeral";
import moment from "moment";
import axios from "axios";
import c3 from "c3";
import qs from "querystring";

import Love from "@/components/Love.vue";
import Search from "@/components/SearchBox.vue";

export default {
  components: { Love, Search },
  data() {
    return {
      languages: null,
      repositories: [],
      chart: null,
      chartType: "cumulative",
      chartScale: "linear",
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
          value: (r) => moment(r.created_at).fromNow()
        },
        {
          text: "Last push",
          icon: "fas fa-arrow-alt-circle-up",
          value: (r) => moment(r.pushed_at).fromNow()
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
  async created() {
    this.languages = await axios("/api/search/languages").then(({ data }) =>
      data.result.map((l) => l.language)
    );
  },
  async mounted() {
    this.$nextTick(() => {
      this.chart = c3.generate({
        bindto: "#timeseries",
        padding: { right: 25 },
        data: { columns: [] },
        axis: {
          x: {
            type: "timeseries",
            tick: { format: "%Y-%m-%d", count: 5 },
            label: { text: "Date" }
          },
          y: {
            min: 0,
            padding: 0,
            tick: { format: (v) => numeral(Math.round(v)).format("0,0") },
            label: { text: "Stargazers" }
          }
        },
        point: { show: false },
        legend: {
          position: screen.width > 400 ? "inset" : "bottom",
          inset: { anchor: "top-left", x: 20 }
        },
        transition: { duration: 500 }
      });
    });
    this.suggest();
  },
  computed: {
    hasRepositories() {
      return this.repositories && this.repositories.length > 0;
    },
    hasSuggestions() {
      return this.suggestions && this.suggestions.length > 0;
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
          for (let i = 0; i < 3; i++) {
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
    async add(id) {
      if (_.isArray(id)) return Promise.mapSeries(id, (i) => this.add(i));

      if (this.repositories.find((r) => r._id === id))
        return this.showMessage("Repository already added!");

      if (this.repositories.length === 4)
        return this.showMessage(
          "Remove one repository before adding new ones."
        );

      this.suggestions = this.message = null;
      this.loading = true;

      const repo = await axios(`/api/repos/${id}`).then(({ data }) => ({
        ...data,
        name: _.startCase(data.name)
      }));

      const stargazers = await axios(`/api/repos/${id}/stargazers`)
        .then(({ data }) =>
          data.stargazers.map(([d, c]) => [moment.parseZone(d).toDate(), c])
        )
        .catch((err) => {
          if (err.response.status === 404) return null;
          throw err;
        });

      this.repositories.push({ ...repo, stargazers });
      this.$refs.searchBar.clear();
      this.loading = false;
      this.$nextTick(() => this.loadSeries({ ...repo, stargazers }));
    },
    remove(id) {
      this.repositories = this.repositories.filter((r) => r._id !== id);
      this.chart.unload({ ids: [`${id}`] });
      if (!this.repositories.length) this.suggest();
    },
    showMessage(text) {
      this.message = text;
      setTimeout(() => (this.message = null), 10000);
    },
    async find(v) {
      this.suggestions = this.message = null;

      if (!v || v.length < 4)
        return this.showMessage("You must provide at least 4 characters");

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
    },
    loadSeries(repo) {
      if (!repo.stargazers) return;

      this.chart.load({
        json: repo.stargazers
          .reduce(
            (m, s) =>
              m.concat({
                date: s[0],
                [repo._id]:
                  s[1] +
                  (m.length > 0 && this.chartType === "cumulative"
                    ? m[m.length - 1][repo._id]
                    : 0)
              }),
            []
          )
          .slice(0, -1),
        keys: { x: "date", value: [`${repo._id}`] },
        names: { [repo._id]: repo.name }
      });
    },
    loadChart() {
      this.chart.unload({
        done: () =>
          this.repositories.forEach((repo) => {
            if (!repo.stargazers) return;
            this.loadSeries(repo);
          })
      });
    },
    changeScale() {
      this.chart.axis.types({ y: this.chartScale });
    }
  }
};
</script>

<style lang="stylus" scoped>
select {
  @apply: block border border-gray-200 text-gray-700;
}
</style>
