<template>
  <div class="page">
    <section class="content flex flex-col">
      <div class="flex justify-center pt-10">
        <img class="w-12 h-12" ca src="@/assets/images/logo-white.png" />
      </div>
      <div class="flex justify-center pt-1">
        <span class="text-3xl font-bold">GitTrends</span>
      </div>
      <div class="coming-soon flex flex-col flex-grow items-center">
        <span class="w-full text-center font-bold text-4xl sm:text-6xl">
          COMING SOON
        </span>
        <span class="w-full sm:-m-4 text-center text-lg sm:text-4xl">
          with information on open-source projects
        </span>
      </div>
    </section>
    <footer class="flex content-center flex-wrap">
      <span class="w-full text-center text-sm sm:text-xl">
        can't wait? contact at hsborges [at] facom.ufms.br
      </span>
    </footer>
  </div>
</template>

<script>
export default {};
</script>

<style lang="stylus" scoped>
section.content
  height: 90vh
  color: white
  background-color: background-color

  .coming-soon
    padding-top: 15vh
footer
  height: 10vh
</style>
