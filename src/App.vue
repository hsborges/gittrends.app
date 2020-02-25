<template>
  <div id="app" class="flex flex-col flex-grow">
    <div
      v-if="showAlert"
      class="flex justify-center w-full h-6 bg-secondary-dark z-50"
    >
      <router-link
        class="text-white text-center font-bold hover:cursor-pointer"
        to="/authorize"
      >
        <i class="fas fa-bullhorn px-1"></i>
        <span class="hidden md:inline leading-normal">
          Hey, we need your support to expand our database. Click here to donate
          a GitHub access token
        </span>
        <span class="md:hidden text-sm leading-normal">
          Enjoying? Donate a access token
        </span>
        \o/
      </router-link>
      <i
        class="fas fa-times text-white absolute right-0 leading-normal px-2 cursor-pointer"
        @click="closeAlert"
      ></i>
    </div>
    <div class="flex flex-col flex-grow lg:flex-row max-w-full">
      <Menu></Menu>
      <router-view @dismissAlert="closeAlert" />
    </div>
  </div>
</template>

<script>
import Menu from "@/components/NavigationBar.vue";

export default {
  name: "app",
  components: { Menu },
  data() {
    return {
      showAlert: !this.$cookies.get("token-donated")
    };
  },
  methods: {
    closeAlert() {
      this.showAlert = false;
    }
  }
};
</script>

<style lang="stylus">
@import url('https://fonts.googleapis.com/css?family=PT+Sans:400,700&display=swap');

#app
  @apply text-secondary;
  max-width: 100vw;
  min-height: 100vh;
  font-family: 'PT Sans', sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  scroll-behavior: smooth;
</style>
