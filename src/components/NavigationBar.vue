<template>
  <nav class="navbar flex lg:flex-grow-0 lg:flex-col bg-primary text-white">
    <div class="beta">BETA</div>
    <header
      class="logo flex flex-grow md:flex-grow-0 justify-center md:justify-start lg:block py-3 px-4 lg:pt-10 lg:pb-12"
    >
      <router-link :to="{ name: 'home' }" class="flex justify-center lg:block">
        <span class="flex justify-center pr-2 lg:pr-0">
          <img
            class="h-10 lg:h-12 xl:h-16"
            src="@/assets/images/logo-white.png"
          />
        </span>
        <span
          class="block text-center text-2xl lg:text-2xl xl:text-3xl font-bold leading-relaxed"
        >
          GitTrends
        </span>
      </router-link>
    </header>
    <section
      class="options hidden md:flex lg:flex-col justify-end lg:justify-start lg:content-center flex-grow"
    >
      <router-link
        v-for="(option, index) in options"
        :key="index"
        class="option flex items-center lg:h-16 px-2 lg:px-0
               text-lg xl:text-xl leading-none border-solid lg:border-b-2 border-white"
        :class="{
          first: index === 0,
          active: $route.name === option.name.toLowerCase()
        }"
        :to="option.url"
      >
        <i :class="option.class" class="px-2"></i>
        <span
          class="lg:block "
          :class="{ hidden: !($route.name === option.name.toLowerCase()) }"
        >
          {{ option.name }}
        </span>
      </router-link>
    </section>
    <footer class="footer hidden lg:flex justify-center">
      <div class="social bottom-0">
        <a :href="urls.github" target="_blank">
          <i class="fab fa-github"></i>
        </a>
        <a href="#"><i class="fab fa-twitter"></i> </a>
        <a href="mailto:hsborges@facom.ufms.br">
          <i class="fas fa-envelope"></i>
        </a>
      </div>
    </footer>
  </nav>
</template>

<script>
export default {
  data() {
    return {
      urls: {
        github: "http://www.github.com/hsborges/gittrends.app"
      },
      options: [
        {
          name: "Home",
          class: "fas fa-home",
          url: "/",
          active: this.$route.name === "home"
        },
        {
          name: "Explore",
          class: "fas fa-th",
          url: "/explore",
          active: this.$route.name === "explore"
        },
        {
          name: "Compare",
          class: "fas fa-exchange-alt",
          url: "/compare",
          active: this.$route.name === "compare"
        },
        {
          name: "About",
          class: "fas fa-info-circle",
          url: "/about",
          active: this.$route.name === "about"
        }
      ]
    };
  }
};
</script>

<style lang="stylus" scoped>
div.beta
  @apply: absolute;
  @apply: text-xl bg-secondary font-bold text-white text-center;
  @apply: w-48 -mx-24 pl-10 pt-8;
  transform: rotate(-45deg);

.navbar
  min-width: 15vw;
  .options
    .option:hover
      @apply: font-bold;
      span
         @apply: block
    .option.first
      @apply: border-t-2;
    .option.active
      @apply: font-bold text-primary bg-white;
  footer > .social > a
    @apply: text-white font-bold text-xl;
    @apply: px-3;

@media (max-width: 1024px)
  .navbar > .options:hover > span
    @apply: hidden;
</style>
