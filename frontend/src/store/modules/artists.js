import axios from 'axios';

export default {
  namespaced: true,
  state: {
    matchingArtists: [],
    artistsHistory: [],
    error: {},
  },
  mutations: {
    updateMatchingArtists(state, artists) {
      state.matchingArtists = artists;
      state.error = {};
    },
    addArtistToHistory(state, artist) {
      if (artist) {
        state.artistsHistory = state.artistsHistory.filter((x) => x.name !== artist.name);
        state.artistsHistory.unshift(artist);
      }
      if (state.artistsHistory.length > 9) {
        state.artistsHistory = state.artistsHistory.slice(0, 9);
      }
    },
    clearArtistsHistory(state) {
      state.artistsHistory = [];
    },
    updateWithErrors(state, error) {
      state.matchingArtists = [];
      state.error = error;
    },
  },
  actions: {
    async searchMatchingArtists({ commit }, searchText) {
      if (searchText && searchText.trim().length !== 0) {
        await axios.get(`/api/artists/?searchText=${searchText.replace(' ', '+')}`)
          .then((result) => {
            commit('updateMatchingArtists', result.data);
          })
          .catch((error) => commit('updateWithErrors', error));
      } else {
        commit('updateMatchingArtists', []);
      }
    },
  },
};
