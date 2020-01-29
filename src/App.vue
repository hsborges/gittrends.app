<template>
  <div id="app" class="flex flex-col lg:flex-row">
    <Menu></Menu>
    <router-view />
  </div>
</template>

<script>
import Menu from "@/components/NavigationBar.vue";

export default {
  name: "app",
  components: { Menu }
};
</script>

<style lang="stylus">
@import url('https://fonts.googleapis.com/css?family=PT+Sans:400,400i,700,700i&display=swap');

#app
  @apply text-secondary;
  width: 100vw;
  min-height: 100vh;
  font-family: 'PT Sans', sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
</style>
