<template>
  <div class="container" v-if="loaded">
    <ErrorDisplayer :error="error"></ErrorDisplayer>
    <section>
      <div class="columns">
        <div class="column is-one-fifth">
          <router-link to="/artists">Search another artist</router-link>
        </div>
        <div class="column is-three-fifths">
          <h2 class="title is-2">
            {{ artist ? `Albums from ${artist.name}` : "Albums list" }}
          </h2>
        </div>
        <div class="column is-one-fifth">
          <b-field class="searchBox">
            <b-input
              placeholder="Filter results..."
              type="search"
              icon="magnify"
              v-model="searchText"
              icon-clickable
              icon-right="close-circle"
              icon-right-clickable
              @icon-right-click="clearIconClick"
            >
            </b-input>
          </b-field>
        </div>
      </div>
    </section>
    <section>
      <AlbumCard
        v-for="(album, idx) in pageAlbums"
        :key="idx"
        :album="album"
        class="albumCard"
      >
      </AlbumCard>
      <b-message v-if="pageAlbums.length === 0">
        No album found for the artist and filters specified.
      </b-message>
    </section>
    <section>
      <b-pagination
        :total="totalAlbums"
        v-model="currentPage"
        range-before:3
        range-after:1
        simple:false
        rounded:false
        :per-page="itemsPerPage"
        icon-prev="chevron-left"
        icon-next="chevron-right"
        aria-next-label="Next page"
        aria-previous-label="Previous page"
        aria-page-label="Page"
        aria-current-label="Current page"
      >
      </b-pagination>
    </section>
  </div>
</template>

<script>
import { mapState, mapActions } from 'vuex';
import AlbumCard from '../components/AlbumCard.vue';
import ErrorDisplayer from '../components/ErrorDisplayer.vue';

function belongsToPage(itemIndex, page, maxItemsPerPage) {
  return (
    itemIndex >= (page - 1) * maxItemsPerPage
    && itemIndex < page * maxItemsPerPage
  );
}

export default {
  name: 'Albums',
  props: {
    artistId: {
      type: [Number, String],
      validator(value) {
        return Number.isInteger(Number(value));
      },
    },
  },
  data() {
    return {
      searchText: '',
      currentPage: 1,
      itemsPerPage: 9,
      isLoaded: false,
    };
  },
  created() {
    this.fetchAlbumsByArtist(this.artistId);
    this.isLoaded = true;
  },
  methods: {
    ...mapActions('albums', ['fetchAlbumsByArtist']),
    clearIconClick() {
      this.searchText = '';
    },
  },
  computed: {
    ...mapState('albums', ['albums', 'error', 'artist', 'loaded']),
    filteredAlbums() {
      const lowerSearchText = this.searchText.trim().toLowerCase();
      return lowerSearchText.length !== 0
        ? this.albums.filter((album) => (album.collectionName + (album.genre || ''))
          .toLowerCase()
          .includes(lowerSearchText))
        : this.albums;
    },
    pageAlbums() {
      return this.filteredAlbums
        .filter((value, index) => belongsToPage(index, this.currentPage, this.itemsPerPage));
    },
    totalAlbums() {
      return this.filteredAlbums.length;
    },
  },
  components: { AlbumCard, ErrorDisplayer },
};
</script>
<style scoped>
section {
  margin: 3em;
}
</style>
