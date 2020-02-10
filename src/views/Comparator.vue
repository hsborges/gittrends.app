<template>
  <div class="flex flex-grow justify-center items-center">
    <span> <i class="far fa-hourglass"></i> Comming Soon</span>
  </div>
</template>

<script>
export default {};
</script>

<style lang="stylus" scoped>
span
  margin-bottom: 15vh
  @apply text-5xl font-bold text-primary border-t-4 border-b-4 border-primary px-4;

@media screen and (max-width: 400px)
  span
    @apply text-4xl  border-t-2 border-b-2;
</style>
