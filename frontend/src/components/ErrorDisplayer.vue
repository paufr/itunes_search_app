<template>
  <section class="error-section"
    v-if="validError">
    <b-message type="is-danger"  has-icon>
      {{ error.message }}
    </b-message>
  </section>
</template>

<script>
export default {
  props: {
    error: {
      type: Object,
      required: false,
    },
  },
  name: 'ErrorDisplayer',
  data() {
    return {};
  },
  computed: {
    validError() {
      return this.error && this.error.message && this.error.message !== '';
    },
  },
};
</script>

<style scoped>
.error-section {
  margin:3em;
}
</style>
