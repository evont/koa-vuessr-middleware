<template>
    <div id="app">
        <h1>vue-ssa</h1>
        <router-view class="view"></router-view>
    </div>
</template>

<script>
export default {
  title: 'home',

  asyncData ({ store, route }) {
    return store.dispatch('fetchItem', route.params.id)
  },

  computed: {
    item () {
      return this.$store.state.items[this.$route.params.id]
    }
  }
}
</script>
