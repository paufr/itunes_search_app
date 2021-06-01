<template>
  <div class="container">
    <ErrorDisplayer :error="error"></ErrorDisplayer>
    <section>
      <h2 class="title is-2">Search an artist</h2>
      <b-autocomplete
        :data="matchingArtists"
        placeholder="e.g. Jack Johnson"
        field="name"
        :loading="isFetching"
        @typing="searchMatchingArtists"
        @select="option => select(option)"
        class="searchText">
      </b-autocomplete>
    </section>
    <section v-if="artistsHistory && artistsHistory.length > 0">
      <h2 class="title is-3">Recent searches</h2>
      <ArtistCard class="artistCard"
        v-for="(artist, idx) in artistsHistory"
        :key="idx"
        :artist="artist"
        @click.native="select(artist)">
      </ArtistCard>
    </section>
  </div>
</template>

<script>
import { mapState, mapActions, mapMutations } from 'vuex';
import ErrorDisplayer from '../components/ErrorDisplayer.vue';
import ArtistCard from '../components/ArtistCard.vue';

export default {
  name: 'Artists',
  data() {
    return {
      isFetching: false,
      name: '',
    };
  },
  components: { ErrorDisplayer, ArtistCard },
  computed: {
    ...mapState('artists', ['matchingArtists', 'artistsHistory', 'error']),
  },
  methods: {
    ...mapActions('artists', ['searchMatchingArtists']),
    ...mapMutations('artists', ['addArtistToHistory']),

    exploreAlbums(artistId) {
      if (Number.isInteger(artistId)) {
        this.$router.push({ name: 'Albums', params: { artistId } });
      }
    },
    select(option) {
      this.addArtistToHistory(option);
      this.exploreAlbums(option.id);
    },
  },
};
</script>
<style scoped>
  section {
    margin:3em;
  }
  .artistCard{
    cursor: pointer;
  }
</style>
