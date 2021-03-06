<template>
  <div class="flex flex-col w-full">
    <canvas id="chart" :height="height"></canvas>
    <div class="flex justify-center w-full pt-2">
      <span class="font-bold">Stargazers:</span>
      <select v-model="type" class="bg-transparent border-transparent">
        <option value="cumulative">Cumulative</option>
        <option value="gained">Gained</option>
      </select>
      <span class="px-1 sm:px-4">-</span>
      <span class="font-bold">Scale:</span>
      <select v-model="scale" class="bg-transparent border-transparent">
        <option value="linear">Linear</option>
        <option value="logarithmic">Log</option>
      </select>
    </div>
  </div>
</template>

<script>
import Chart from "chart.js";
import axios from "axios";
import qs from "querystring";

import "chartjs-plugin-colorschemes/src/plugins/plugin.colorschemes";
import { SetTwo8 } from "chartjs-plugin-colorschemes/src/colorschemes/colorschemes.brewer";

SetTwo8[0] = "#68b2b1";

export default {
  props: ["repo", "hideLegend"],
  data() {
    return {
      chart: null,
      repositories: [],
      type: "cumulative",
      scale: "linear"
    };
  },
  async created() {
    Chart.Legend.prototype.afterFit = function() {
      this.height = this.height + 15;
    };
  },
  async mounted() {
    this.chart = new Chart("chart", {
      type: "line",
      data: {
        datasets: []
      },
      options: {
        legend: {
          display: !this.hideLegend,
          labels: { boxWidth: 20, fontSize: this.fontSize }
        },
        scales: {
          xAxes: [
            {
              type: "time",
              time: {
                displayFormats: { unit: "day" },
                tooltipFormat: "ll"
              },
              gridLines: { drawOnChartArea: false }
            }
          ],
          yAxes: [
            {
              type: this.scale,
              ticks: { min: 0 },
              gridLines: { drawOnChartArea: false }
            }
          ]
        },
        elements: { point: { radius: 0, hitRadius: 0.5 } },
        tooltips: {
          mode: "x",
          intersect: false,
          position: "nearest",
          itemSort: (a, b) => b.value - a.value
        },
        plugins: {
          colorschemes: { scheme: SetTwo8 }
        }
      }
    });

    if (this.repo) {
      this.type = "gained";
      this.scale = "logarithmic";
      this.addRepository(this.repo);
    }
  },
  methods: {
    async addRepository(repo) {
      if (Array.isArray(repo))
        return _repo.forEach((r) => this.addRepository(r));

      let _repo =
        typeof repo === "number"
          ? await axios(`/api/repos/${repo}`).then((res) => res.data)
          : { ...repo };

      if (!_repo.stargazers)
        _repo.stargazers = await axios(`/api/repos/${repo._id}/stargazers`)
          .then((res) => res.data.stargazers)
          .catch((err) => {
            if (err.response.status !== 404) throw err;
            this.$emit("notFound", repo._id);
            return null;
          });

      if (_repo.stargazers) this.repositories.push(_repo);
    },
    async removeRepository(repo) {
      if (Array.isArray(repo))
        return repo.forEach((r) => this.removeRepository(r));
      else
        this.repositories = this.repositories.filter(
          (r) => r._id !== (typeof repo === "number" ? repo : repo._id)
        );
    },
    async updateDatasets() {
      while (this.chart.data.datasets.length) this.chart.data.datasets.pop();
      this.repositories.forEach((repo) =>
        this.chart.data.datasets.push({
          label: repo.name,
          fill: false,
          data: this.transform(repo.stargazers)
        })
      );
    },
    transform(stargazers) {
      return stargazers
        .reduce(
          (m, s) =>
            m.concat({
              x: new Date(s[0]),
              y:
                s[1] +
                (this.type === "cumulative" && m.length > 0
                  ? m[m.length - 1].y
                  : 0)
            }),
          []
        )
        .slice(0, this.type === "cumulative" ? stargazers.length : -1);
    },
    track() {
      this.$ga.event(
        this.$route.path,
        "chart_update",
        qs.encode({ type: this.type, scale: this.scale })
      );
    }
  },
  computed: {
    height() {
      return window.innerWidth < 400 ? "250px" : "";
    },
    fontSize() {
      return window.innerWidth < 400 ? 10 : 12;
    }
  },
  watch: {
    scale() {
      this.chart.options.scales.yAxes[0].type = this.scale;
      this.chart.update();
      this.track();
    },
    type() {
      this.updateDatasets();
      this.chart.update();
      this.track();
    },
    repositories() {
      this.updateDatasets();
      this.chart.update();
    }
  }
};
</script>
