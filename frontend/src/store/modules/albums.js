import axios from 'axios';

export default {
  namespaced: true,
  state: {
    albums: [],
    artist: {},
    error: {},
  },
  mutations: {
    updateAlbumsByArtist(state, results) {
      state.albums = results.albums;
      state.artist = results.artist;
      state.error = {};
    },
    updateWithErrors(state, error) {
      state.matchingArtists = [];
      state.error = error;
    },
  },
  actions: {
    fetchAlbumsByArtist({ commit }, artistId) {
      axios.get(`/api/artists/${artistId}/albums`)
        .then((result) => commit('updateAlbumsByArtist', result.data))
        .catch((error) => commit('updateWithErrors', error));
    },
  },
};
