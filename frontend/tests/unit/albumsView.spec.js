/* eslint-disable no-unused-vars */
/* eslint-disable no-unused-expressions */
/* eslint-disable import/no-extraneous-dependencies */
import Vuex from 'vuex';
import sinon from 'sinon';
import { shallowMount, createLocalVue, mount } from '@vue/test-utils';
import Albums from '@/views/Albums.vue';
import Buefy from 'buefy';
import VueRouter from 'vue-router';
import should from 'should';
import { expect } from 'chai';

const localVue = createLocalVue();

localVue.use(Vuex);
localVue.use(Buefy);
localVue.use(VueRouter);
describe('Albums.vue', () => {
  let state;
  let actions;
  let store;

  function getStoreOptions() {
    return {
      modules: {
        albums: {
          actions,
          state,
          namespaced: true,
        },
      },
    };
  }
  beforeEach(() => {
    actions = {
      fetchAlbumsByArtist: sinon.spy(),
    };
    state = {
      error: {},
      artist: {
        id: 1234456,
        name: 'ArtistName',
        genre: 'genre',
      },
      albums: [
        {
          collectionId: 123456,
          collectionName: 'album sample',
          artistName: 'pau',
          artistId: 1234456,
        },
      ],
      loaded: true,
    };

    // additional albums
    for (let i = 0; i < 15; i += 1) {
      state.albums.push({
        collectionId: 123456,
        collectionName: 'collection name',
        artistName: 'ArtistName',
        artistId: 1234456,
      });
    }

    store = new Vuex.Store(getStoreOptions());
  });

  it('calls store action "fetchAlbumsByArtist" when created', () => {
    const wrapper = shallowMount(Albums, { store, localVue, propsData: { artistId: 1234 } });
    sinon.assert.calledOnce(actions.fetchAlbumsByArtist);
  });

  it('should not display more than 9 albums per page', () => {
    const wrapper = shallowMount(Albums, { store, localVue, propsData: { artistId: 1234 } });
    expect(wrapper.findAll('.albumCard').length).to.be.equal(9);
  });

  it('should display artist name', () => {
    const router = new VueRouter();
    const wrapper = mount(Albums, {
      store, localVue, propsData: { artistId: 1234 }, router,
    });
    expect(wrapper.text()).to.include('ArtistName');
  });

  it('filters albums displayed when search text is passed', async () => {
    const router = new VueRouter();
    router.push = sinon.stub();
    const wrapper = mount(Albums, {
      store, localVue, propsData: { artistId: 1234 }, router,
    });
    const inputSearch = wrapper.find('input');

    inputSearch.trigger('input');
    expect(wrapper.findAll('.albumCard').length).to.be.equal(9);

    await inputSearch.setValue('album');
    expect(wrapper.findAll('.albumCard').length).to.be.equal(1);
  });

  it('should navigate to artists route when clicking go-back link', () => {
    const router = new VueRouter({
      mode: 'history',
    });
    router.push = sinon.stub();

    const wrapper = mount(Albums, {
      store, localVue, propsData: { artistId: 1234 }, router,
    });

    const link = wrapper.find('a');
    expect(link.attributes('href')).to.be.equal('/artists');
  });
});
