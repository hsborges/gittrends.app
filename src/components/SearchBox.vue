<template>
  <div
    class="flex w-full text-base border border-secondary-200 rounded appearance-none leading-normal"
  >
    <input
      class="flex flex-grow overflow-hidden"
      type="text"
      v-model="query"
      :id="id || 'search'"
      :placeholder="placeholder || 'e.g., twbs/bootstrap'"
      @keypress.enter="$emit('search', query)"
    />
    <a class="flex cursor-pointer text-sm opacity-25 hover:opacity-100 px-1">
      <i class="fas fa-search py-1" @click="$emit('search', query)"></i>
    </a>
    <a
      class="flex cursor-pointer text-sm opacity-25 hover:opacity-100 pl-1 md:pl-2"
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
    }
  }
};
</script>

<style lang="stylus" scoped></style>
