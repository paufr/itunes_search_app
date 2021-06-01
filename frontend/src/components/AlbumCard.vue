<template>
  <div class="card">
    <div class="card-content">
      <div class="content">
        <p class="title is-5">{{album.collectionName}}</p>
      </div>
      <div class="media">
        <div class="media-left" v-if="album.thumbnail">
          <figure class="image is-100x100">
          <img :src="album.thumbnail" alt="Image not available">
          </figure>
        </div>
        <div class="media-content">
          <div class="subtitle is-6">
            <div><b>Artist:</b> {{album.artistName}}</div>
            <div v-if="album.genre"><b>Genre:</b> {{album.genre}}</div>
            <div v-if="album.releaseDate"><b>Released:</b>
              {{new Date(album.releaseDate).toLocaleDateString()}}
            </div>
            <div v-if="album.country"><b>Country:</b> {{album.country}}</div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  props: {
    album: {
      type: Object,
      required: true,
      validator(value) {
        return value && value.collectionName && value.collectionId
        && value.artistName && value.artistId;
      },
    },
  },
  name: 'AlbumCard',
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
    height: 20em;
    min-width:25em;
  }
  .content {
    overflow:hidden;
    max-height:3em;
  }
  .media-content {
    text-align: left;
  }
</style>
