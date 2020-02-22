<template>
  <div
    class="flex w-full border border-secondary-200 rounded appearance-none leading-normal z-auto"
  >
    <input
      class="flex flex-grow overflow-hidden focus:outline-none"
      type="text"
      v-model="query"
      :id="id || 'search'"
      :placeholder="placeholder || 'e.g., twbs/bootstrap'"
      @keypress.enter="$emit('search', query)"
    />
    <a
      class="flex cursor-pointer text-sm px-1 text-secondary-400 hover:text-secondary"
    >
      <i class="fas fa-search py-1" @click="$emit('search', query)"></i>
    </a>
    <a
      class="flex cursor-pointer text-sm pr-1 sm:pr-2 text-secondary-400 hover:text-secondary"
      v-if="showClear"
    >
      <i class="fas fa-times py-1" @click="clear"></i>
    </a>
  </div>
</template>

<script>
// import axios from "axios";

export default {
  props: ["id", "placeholder", "showClear"],
  data() {
    return { query: null };
  },
  methods: {
    clear() {
      this.query = null;
      this.$emit("clear");
    }
  }
};
</script>

<style lang="stylus" scoped></style>
