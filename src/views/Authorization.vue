<template>
  <div class="content flex flex-col w-full">
    <article v-if="success" class="flex flex-col flex-grow items-center">
      <div
        class="flex flex-grow items-center max-w-lg text-4xl font-bold pb-24"
      >
        <span class="text-center">
          Hey {{ login }}, thank you very much for your contribution
          <i class="far fa-smile-wink"></i>.
        </span>
      </div>
      <img class="float-none" src="@/assets/images/github-robot.png" />
    </article>
    <article v-else class="flex flex-col md:flex-row flex-grow items-center">
      <div class="flex flex-col flex-grow items-center pb-32">
        <span class="text-4xl max-w-2md pb-6 text-center">
          Could you donate an access token?
        </span>
        <span class="text-xl max-w-md opacity-75 text-center">
          We make thousands of GitHub API requests to keep our database updated.
          By donating an access token we can add more projects to our dataset
          and speedup the process.
        </span>
        <a
          class="btn text-xl my-8 hvr-grow"
          v-bind:href="authorization_url"
          target="_blank"
        >
          <i class="fab fa-github"></i> Authorize
        </a>
        <span class="text-sm max-w-md opacity-75 text-center">
          * you can revoke this authorization later on the GitHub website
        </span>
      </div>
      <img
        class="float-right sm:float-none"
        src="@/assets/images/github-robot.png"
      />
    </article>
  </div>
</template>

<script>
import { stringify } from "querystring";

export default {
  data() {
    return {
      success: this.$route.query.success,
      login: this.$route.query.login,
      authorization_url: `https://github.com/login/oauth/authorize?${stringify({
        client_id: process.env.VUE_APP_GITHUB_CLIENT_ID,
        scope: "public_repo read:org read:user user:email"
      })}`
    };
  }
};
</script>

<style lang="stylus" scoped>
div.content
  height: 100vh
header
  background-color: background-color
article > img
  @apply flex-shrink opacity-50 max-w-sm
.btn
  background-color: background-color
  @apply rounded text-white font-bold py-2 px-8
</style>
