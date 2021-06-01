import Vue from 'vue';
import Vuex from 'vuex';

import albumsModule from './modules/albums';
import artistsModule from './modules/artists';

Vue.use(Vuex);

export default new Vuex.Store({
  state: {
  },
  mutations: {
  },
  actions: {
  },
  modules: {
    albums: albumsModule,
    artists: artistsModule,
  },
});
