import axios from 'axios';

export default {
  namespaced: true,
  state: {
    albums: [],
    artist: {},
    error: {},
    loaded: false,
  },
  mutations: {
    updateAlbumsByArtist(state, results) {
      state.albums = results.albums;
      state.artist = results.artist;
      state.error = {};
    },
    updateWithErrors(state, error) {
      state.albums = [];
      state.error = error;
    },
    setLoaded(state, loaded) {
      state.loaded = loaded;
    },
  },
  actions: {
    fetchAlbumsByArtist({ commit }, artistId) {
      commit('setLoaded', false);
      axios.get(`/api/artists/${artistId}/albums`)
        .then((result) => commit('updateAlbumsByArtist', result.data))
        .catch((error) => commit('updateWithErrors', error))
        .finally(() => commit('setLoaded', true));
    },
  },
};
