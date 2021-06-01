/* eslint-disable no-unused-vars */
/* eslint-disable no-unused-expressions */
/* eslint-disable import/no-extraneous-dependencies */
import Vuex from 'vuex';
import sinon from 'sinon';
import { createLocalVue, mount } from '@vue/test-utils';
import Artists from '@/views/Artists.vue';
import Buefy from 'buefy';
import VueRouter from 'vue-router';
import { expect } from 'chai';

const localVue = createLocalVue();

localVue.use(Vuex);
localVue.use(Buefy);
localVue.use(VueRouter);
describe('Artists.vue', () => {
  let actions;
  let state;
  let store;
  let mutations;

  function getStoreOptions() {
    return {
      modules: {
        artists: {
          actions,
          mutations,
          state,
          namespaced: true,
        },
      },
    };
  }
  beforeEach(() => {
    actions = {
      searchMatchingArtists: sinon.spy(),
    };
    state = {
      matchingArtists: [{
        id: 1234,
        name: 'artist_name',
        genre: 'main_genre',
      }],
      artistsHistory: [{
        id: 1234,
        name: 'artist_name',
        genre: 'main_genre',
      }],
      error: {},
    };
    mutations = {
      addArtistToHistory: sinon.spy(),
    };
    store = new Vuex.Store(getStoreOptions());
  });

  it('calls store action "searchMatchingArtists" when typing the input', () => {
    const wrapper = mount(Artists, { store, localVue });
    const inputSearch = wrapper.find('input');
    inputSearch.element.value = 'name';
    inputSearch.trigger('input');

    sinon.assert.calledOnce(actions.searchMatchingArtists);
  });

  it('calls store mutation "addArtistToHistory" when selecting a name', () => {
    const router = new VueRouter();
    router.push = sinon.stub();
    const wrapper = mount(Artists, { store, localVue, router });
    const inputSearch = wrapper.find('.dropdown-item');
    inputSearch.trigger('click');

    sinon.assert.calledOnce(mutations.addArtistToHistory);
  });

  it('should navigate to album router when selecting a name', () => {
    const router = new VueRouter();
    router.push = sinon.spy();

    const wrapper = mount(Artists, { store, localVue, router });
    const inputSearch = wrapper.find('.dropdown-item');
    inputSearch.trigger('click');

    sinon.assert.calledOnce(mutations.addArtistToHistory);
    router.push.calledOnceWith({ name: 'Albums', params: { artistId: 1234 } })
      .should.equal(true);
  });

  it('should display an error if any', () => {
    const error = { message: 'error message' };
    state.error = error;
    store = new Vuex.Store(getStoreOptions());
    const wrapper = mount(Artists, { store, localVue });
    expect(wrapper.text()).to.include(error.message);
  });

  it('should display recent searches if any', () => {
    const wrapper = mount(Artists, { store, localVue });
    expect(wrapper.findAll('.card')).lengthOf(1);
    expect(wrapper.text()).to.include('artist_name');
    expect(wrapper.text()).to.include('main_genre');
  });

  it('should navigate to album route when clicking an artist card', () => {
    const router = new VueRouter();
    router.push = sinon.spy();
    const wrapper = mount(Artists, { store, localVue, router });
    const artistCard = wrapper.find('.card');
    artistCard.trigger('click');
    router.push.calledOnceWith({ name: 'Albums', params: { artistId: 1234 } })
      .should.equal(true);
  });
});
