<template>
 <div class="card">
  <div class="card-content">
      <div class="media-content">
        <p class="title is-4">{{ artist.name }}</p>
        <p class="subtitle is-6" v-if="artist.genre">Main genre: {{ artist.genre }}</p>
      </div>
  </div>
</div>
</template>

<script>
export default {
  props: {
    artist: {
      type: Object,
      required: true,
      validator(value) {
        return value && value.name && value.id;
      },
    },
  },
  name: 'ArtistCard',
  data() {
    return {};
  },
};
</script>

<style scoped>
 .card {
    display:inline-block;
    margin:0.5em;
    max-width:30em;
    width:20%;
    overflow: hidden;
    padding:1em;
    height: 10em;
    min-width:20em;
  }
  .media-content {
    text-align: left;
  }
</style>
