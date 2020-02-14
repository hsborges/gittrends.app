<template>
  <div class="flex flex-col md:flex-row w-full py-5 md:py-10 h-full">
    <div
      v-if="stargazers"
      class="flex flex-col justify-center items-center w-full md:w-4/6"
    >
      <div id="timeline" class="flex w-full h-40 md:h-64"></div>
      <div class="flex text-sm">
        <fieldset>
          <span class="font-bold">Stargazers:</span>
          <input
            id="typeAbs"
            type="radio"
            name="type"
            class="mx-2"
            checked
            @change="loadGained"
          />
          <label for="typeAbs" class="pr-2">Gained</label>
          <input
            id="typeCum"
            type="radio"
            name="type"
            class="mx-2"
            @change="loadCumulative"
          />
          <label for="typeCum">Cumulative</label>
        </fieldset>
      </div>
    </div>
    <div
      v-if="stargazers && stargazers.length"
      class="flex w-full md:w-2/6 justify-center items-center md:items-stretch pt-6"
    >
      <table class="flex table table-auto w-11/12 text-base">
        <tbody>
          <tr class="border-b">
            <td class="border-r font-bold align-top">Last week</td>
            <td v-if="stargazers" class="px-2">
              {{ formatNumber(getStargazersLastWeek()) }} stars
            </td>
          </tr>
          <tr class="border-b">
            <td class="border-r font-bold align-top">Last month</td>
            <td v-if="stargazers" class="px-2">
              {{ formatNumber(getStargazersLastMonth()) }} stars
            </td>
          </tr>
          <tr v-if="peak" class="border-b">
            <td class="border-r font-bold align-top">Peak (week)</td>
            <td class="px-2">
              {{ formatNumber(peak.stargazers) }} stars
              <br />
              <small>({{ formatDate(peak.date) }})</small>
            </td>
          </tr>
          <tr v-if="first" class="border-b">
            <td class="border-r font-bold align-top">Oldest</td>
            <td class="flex flex-shrink-0">
              <img
                :src="
                  `https://avatars2.githubusercontent.com/u/${first.user._id}`
                "
                class="rounded mr-2 opacity-80 m-1 w-12 h-12"
              />
              <div class="flex-grow">
                <a
                  :href="`https://github.com/${first.user.login}`"
                  target="_blank"
                  class="block"
                >
                  {{ first.user.login }}
                </a>
                <small class="block">
                  {{ formatDate(first.starred_at, true) }}
                </small>
              </div>
            </td>
          </tr>
          <tr v-if="last">
            <td class="border-r font-bold align-top">Newest</td>
            <td class="flex flex-shrink-0">
              <img
                :src="
                  `https://avatars2.githubusercontent.com/u/${last.user._id}`
                "
                class="rounded mr-2 opacity-80 m-1 w-12 h-12"
              />
              <div class="flex-grow">
                <a
                  :href="`https://github.com/${last.user.login}`"
                  target="_blank"
                  class="block"
                >
                  {{ last.user.login }}
                </a>
                <small class="block">
                  {{ formatDate(last.starred_at, true) }}
                </small>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
    <Loading v-else class="flex flex-grow h-40"></Loading>
  </div>
</template>

<script>
import _ from "lodash";
import moment from "moment";
import numeral from "numeral";
import axios from "axios";
import c3 from "c3";

import Loading from "@/components/Loading.vue";

export default {
  name: "stargazersTimeline",
  props: ["repository"],
  components: { Loading },
  data() {
    return {
      baseUrl: `/api/repos/${this.repository._id}`,
      stargazers: null,
      first: null,
      last: null,
      peak: null,
      graph: null
    };
  },
  async mounted() {
    await axios(`${this.baseUrl}/stargazers`).then(({ data }) => {
      if (!(data && data.stargazers.length)) return;

      // prettier-ignore
      this.stargazers = data.stargazers.map(([d, c]) => [moment.parseZone(d).toDate(), c]);
      this.first = data.first;
      this.last = data.last;

      const [date, stargazers] = _.maxBy(this.stargazers, (s) => s[1]);
      this.peak = { date, stargazers };

      this.$nextTick(() => {
        this.graph = c3.generate({
          bindto: "#timeline",
          padding: { right: 25 },
          data: { columns: [] },
          axis: {
            x: {
              type: "timeseries",
              tick: { format: "%Y-%m-%d", count: 5 },
              label: { text: "Date (end of week)" }
            },
            y: {
              min: 0,
              padding: 0,
              tick: { format: (v) => numeral(Math.round(v)).format("0,0") },
              label: { text: "Stargazers" }
            }
          },
          point: { show: false },
          legend: { show: false },
          transition: { duration: 500 }
        });

        this.loadGained();
      });
    });
  },
  methods: {
    formatDate: (d, f) => moment.parseZone(d).format(`ll${f ? "l" : ""}`),
    formatNumber: (n) => numeral(n).format("0,0"),
    getStargazersLastWeek() {
      return this.stargazers[this.stargazers.length - 1][1];
    },
    getStargazersLastMonth() {
      const length = this.stargazers.length;
      return this.stargazers.slice(length - 4).reduce((m, v) => m + v[1], 0);
    },
    loadCumulative() {
      this.graph.load({
        json: this.stargazers.reduce(
          (m, s) =>
            m.concat({
              date: s[0],
              stargazers: s[1] + (m.length ? m[m.length - 1].stargazers : 0)
            }),
          []
        ),
        keys: { x: "date", value: ["stargazers"] },
        unload: true
      });

      this.graph.axis.types({ y: "linear" });
    },
    loadGained() {
      this.graph.load({
        json: this.stargazers.reduce(
          (m, s) => m.concat({ date: s[0], stargazers: s[1] }),
          []
        ),
        keys: { x: "date", value: ["stargazers"] },
        unload: true
      });
    }
  }
};
</script>

<style lang="stylus" scoped>
a
  @apply text-primary-dark font-bold font-bold underline;
</style>
