<template>
  <div class="explorer flex flex-col flex-grow items-center">
    <div v-if="filter" class="filter w-11/12 lg:w-4/6 py-2">
      <div class="inline-flex w-1/2 text-secondary text-sm md:text-base">
        <span class="py-1 pr-1 leading-tight">Language:</span>
        <select
          class="appearance-none py-1 leading-tight font-bold cursor-pointer overflow-hidden bg-transparent border-0"
          v-model="filter.language"
          @change="applyFilter()"
        >
          <option :value="undefined">All &#9662;</option>
          <option
            v-for="lang in languages"
            :key="lang.language"
            :value="lang.language || 'null'"
            >{{ lang.language || "_None_" }}</option
          >
        </select>
      </div>

      <div class="search flex w-1/2 md:w-1/3 float-right">
        <Search
          class="pl-1 sm:pl-2 text-sm md:text-base"
          ref="searchBar"
          :showClear="true"
          @search="applyFilter"
          @clear="
            reset();
            applyFilter();
          "
        ></Search>
      </div>
    </div>
    <div
      v-if="repositories && !repository"
      class="items flex-block w-11/12 lg:w-4/6"
    >
      <div
        v-if="!repositories.length"
        class="flex flex-col items-center text-center p-6 md:p-16"
      >
        <p>
          Sorry, we did not find any repositories matching with this query.
          <br />
          <a @click="showForm">Click here</a> to send us a request for adding
          this repository in our database.
        </p>
        <div
          v-if="request && !request.success"
          class="form flex-block w-full sm:w-2/3 md:pr-12 pt-6"
        >
          <div class="md:flex md:items-center mb-3">
            <div class="md:w-1/4 md:text-right">
              <label for="repository">Repository*</label>
            </div>
            <div class="md:w-3/4">
              <input
                id="repository"
                v-model="request.repository"
                placeholder="owner/name"
              />
            </div>
          </div>
          <div class="md:flex md:items-center mb-3">
            <div class="md:w-1/4 md:text-right">
              <label for="inline-username">Notify-me</label>
            </div>
            <div class="md:w-3/4">
              <input
                type="email"
                v-model="request.email"
                placeholder="my@email.com"
              />
            </div>
          </div>
          <div v-if="request.feedback" class="md:flex md:items-center">
            <div class="md:w-full text-right text-red-500">
              * {{ request.feedback }}
            </div>
          </div>
          <div class="md:flex md:items-center">
            <div class="md:w-1/4"></div>
            <div class="md:w-3/4 md:text-left">
              <button type="button" @click="sendRequest">
                <i
                  class="fas pr-1"
                  :class="{
                    'fa-paper-plane': !request.sending,
                    'fa-spinner fa-spin': request.sending
                  }"
                ></i>
                Send Request
              </button>
            </div>
          </div>
        </div>
        <a
          v-if="request && request.success"
          href="/authorize"
          target="_blank"
          class="pt-4"
        >
          Suggestion sent, please consider donate a GitHub access token :)
        </a>
      </div>
      <div
        v-for="repo in repositories"
        :key="repo._id"
        class="item flex flex-col"
        @click="showDetails(repo)"
      >
        <div class="flex info">
          <div class="icon flex flex-shrink-0 w-16 items-center justify-center">
            <object
              :data="
                `/icon?url=${repo.homepage || 'github.com'}&size=16..32..32`
              "
              type="image/png"
            >
              <img :src="`/icon?url=github.com&size=16..32..32`" />
            </object>
          </div>
          <div class="content flex-block flex-grow py-2 pr-3">
            <p class="font-bold text-secondary">{{ repo.full_name }}</p>
            <p class="text-sm text-secondary-lighter">{{ repo.description }}</p>
            <p class="counters flex text-sm text-secondary-lighter">
              <span v-if="repo.language" title="Primary programming language">
                <i class="fas fa-code"></i>
                {{ repo.language }}
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
    <div
      v-if="hasMore"
      class="paginator flex justify-center text-sm sm:text-base w-11/12 lg:w-4/6"
    >
      <button
        class="w-full sm:w-1/2 mt-4 py-2 rounded-lg border-2 border-gray-300 bg-primary text-white font-bold text-center leading-tight"
        @click="loadMore"
      >
        Load more
        <i
          class="fas fa-sync-alt pl-1"
          :class="{ 'fa-spin': filter.loading }"
        ></i>
      </button>
    </div>
    <Details
      v-if="repository"
      :id="repository._id"
      @dismiss="showDetails(null)"
      class="w-11/12 lg:w-4/6"
    ></Details>
    <Share></Share>
    <Love class="flex flex-grow items-end mt-10"></Love>
  </div>
</template>

<script>
import _ from "lodash";
import axios from "axios";
import numeral from "numeral";
import moment from "moment";
import qs from "querystring";

import Love from "@/components/Love.vue";
import Search from "@/components/SearchBox.vue";
import Share from "@/components/ShareButton.vue";
import Details from "@/components/explorer/RepositoryDetails.vue";

export default {
  name: "explorer",
  components: { Love, Details, Search, Share },
  data() {
    return {
      filter: null,
      languages: null,
      repositories: null,
      repository: null,
      request: null,
      meta: null
    };
  },
  async created() {
    await axios("/api/search/languages").then(
      ({ data: { result } }) => (this.languages = result)
    );
  },
  async mounted() {
    this.reset();

    const { open, query, language } = this.$route.query;
    this.filter = { ...this.filter, language, query: open || query };

    return this.applyFilter().then(() => {
      this.$refs.searchBar.query = this.filter.query;
      window.addEventListener("scroll", this.handleScroll);

      if (
        (query || open) &&
        (this.repositories.length === 1 ||
          this.repositories[0].full_name.toLowerCase() ===
            (open || "").toLowerCase())
      )
        this.showDetails(this.repositories[0]);
    });
  },
  methods: {
    searchQuery() {
      return qs.encode(
        _(this.filter)
          .omit(["loading"])
          .pickBy((v) => !!v)
          .value()
      );
    },
    reset() {
      this.repositories = this.repository = null;
      this.filter = { limit: 10, page: 0 };
    },
    async applyFilter(query) {
      this.filter.page = 0;
      this.repository = null;

      if (query) this.filter.query = query;

      return axios(`/api/search/repos?${this.searchQuery()}`).then(
        ({ data }) => {
          this.repositories = data.result;
          this.meta = data._meta;

          const queryParams = _(this.filter)
            .pick(["language", "query"])
            .pickBy((v) => v)
            .value();

          if (!_.isEqual(this.$route.query, queryParams))
            this.$router.replace({ query: queryParams });
        }
      );
    },
    async loadMore() {
      if (!this.hasMore || this.filter.loading) return;

      this.filter.page += 1;
      this.filter.loading = true;

      const { result, _meta } = (
        await axios(`/api/search/repos?${this.searchQuery()}`).finally(
          () => (this.filter.loading = false)
        )
      ).data;

      this.repositories = _.uniqBy(
        this.repositories.concat(result),
        (r) => r._id
      );
      this.meta = _meta;
    },
    async showDetails(repo) {
      this.repository = repo;
      if (repo) {
        const query = { ...this.$route.query, open: repo.full_name };
        this.$router.replace({ query });
        this.$ga.event(this.$route.path, "open", repo.full_name);
      } else {
        this.$router.replace({ query: _.omit(this.$route.query, "open") });
      }
    },
    formatNumber: (v, simple) => {
      if (v < 1000 || simple) return numeral(v).format("0,0");
      return numeral(v).format("0.0a");
    },
    formatTime: (t) => {
      return moment(t).fromNow();
    },
    async showForm() {
      this.request = {
        repository: null,
        email: null,
        feedback: null,
        sending: null,
        success: null
      };
    },
    async sendRequest() {
      if (!this.request.repository)
        return (this.request.feedback = "Repository is a mandatory field!");
      if (!/.+\/.+/gi.test(this.request.repository))
        return (this.request.feedback = "Invalid repository format!");

      this.request.sending = true;
      await axios(`https://api.github.com/repos/${this.request.repository}`)
        .catch((res) => {
          if (res.response && res.response.status !== 404)
            return Promise.resolve();
          throw res;
        })
        .then(() =>
          axios({
            method: "POST",
            url: "/api/requests",
            data: _.pick(this.request, ["repository", "email"]),
            timeout: 10000
          }).then(() => (this.request.success = true))
        )
        .catch((res) => {
          if (
            res.response &&
            res.response.status === 404 &&
            res.response.config.url.indexOf("api.github.com")
          )
            return (this.request.feedback =
              "Repository not found (only public are accepted).");
          return (this.request.feedback =
            "An error has occurred, please try later.");
        });

      this.request.sending = false;
    },
    handleScroll() {
      let distanceFromBottom =
        document.documentElement.offsetHeight -
        (document.documentElement.scrollTop + window.innerHeight);
      if (distanceFromBottom < 50) this.loadMore();
    }
  },
  destroyed() {
    window.removeEventListener("scroll", this.handleScroll);
  },
  computed: {
    hasMore() {
      return (
        !this.repository &&
        this.meta &&
        this.filter.page < this.meta.pages_count - 1
      );
    }
  },
  watch: {
    "$route.query": function(to) {
      if (
        _.isEmpty(to) &&
        (this.filter.query || this.filter.language || this.repository)
      ) {
        this.reset();
        this.applyFilter();
      }
    },
    "filter.language": function() {
      this.$ga.event(this.$route.path, "filter_language", this.filter.language);
    }
  }
};
</script>

<style lang="stylus" scoped>
.explorer {
  margin: 5vh auto 0px auto;

  .items {
    @apply: border border-secondary-200 rounded;

    .item {
      @apply: flex w-full border-b border-secondary-200;

      &:hover {
        @apply: cursor-pointer bg-primary-100;
      }

      .counters span {
        @apply: pr-2;
      }
    }

    a {
      @apply: text-primary underline cursor-pointer font-bold;
    }

    .form {
      input {
        @apply: bg-gray-200 appearance-none border-2 border-gray-200 rounded w-full py-1 px-4 text-gray-700 leading-tight;

        &:focus {
          @apply: border-primary bg-white;
        }
      }

      label {
        @apply: block text-gray-500 font-bold mb-0 pr-4;
      }

      button {
        @apply: shadow bg-primary-lighter text-white font-bold py-1 px-4 mt-2 rounded;

        &:hover {
          @apply: bg-primary;
        }
      }
    }
  }
}
</style>
