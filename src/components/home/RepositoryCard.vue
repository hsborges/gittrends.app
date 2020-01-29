<template>
  <router-link
    class="flex border border-primary rounded"
    :to="`/explorer?open=${repository.full_name}`"
  >
    <div class="flex flex-grow items-center text-sm px-2 py-1">
      <span class="hidden lg:block leading-none">
        {{ repository.full_name }}
      </span>
      <span class="lg:hidden leading-none">
        {{ repository.full_name.match(/.+\/(.+)/)[1] }}
      </span>
    </div>
    <div
      class="flex flex-col bg-primary p-1 lg:p-2
             text-white font-bold text-xs xl:text-sm"
    >
      <span
        v-for="(metric, index) in metrics"
        v-bind:key="metric.name"
        :class="{ hidden: index !== show }"
        class="leading-none"
      >
        <i :class="metric.class"></i> {{ format(metric.value) }}
      </span>
    </div>
  </router-link>
</template>

<script>
import _ from "lodash";
import numeral from "numeral";

export default {
  name: "repository-card",
  props: ["repository"],
  data() {
    return {
      show: -1,
      metrics: [
        {
          name: "stargazers",
          value: this.repository.stargazers_count,
          class: "fas fa-star"
        }
        // {
        //   name: "forks",
        //   value: this.repository.forks_count,
        //   class: "fas fa-code-branch"
        // },
        // {
        //   name: "watchers",
        //   value: this.repository.watchers_count,
        //   class: "far fa-eye"
        // }
      ]
    };
  },
  methods: {
    format: (v) => (v < 1000 ? v : numeral(v).format("0.0a"))
  },
  mounted() {
    this.$nextTick(function() {
      (function _update(scope) {
        // scope.show = (scope.show + 1) % scope.metrics.length;
        scope.show = _.random(0, scope.metrics.length - 1);
        if (scope.metrics.length > 1)
          setTimeout(() => _update(scope), _.random(5, 10) * 1000);
      })(this);
    });
  }
};
</script>

<style lang="stylus" scoped></style>
