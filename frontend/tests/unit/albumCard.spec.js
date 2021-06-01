/* eslint-disable no-unused-expressions */

import { expect } from 'chai';
import { shallowMount } from '@vue/test-utils';
import AlbumCard from '@/components/AlbumCard.vue';

describe('AlbumCard.vue', () => {
  it('renders props.album when passed', () => {
    const albumPassed = {
      collectionName: 'collection_name',
      collectionId: 'collection_id',
      artistName: 'artist_name',
      artistId: 'artist_id',
      genre: 'sample_genre',
      country: 'sample_country',
      releaseDate: 'release_date',
    };

    const wrapper = shallowMount(AlbumCard, {
      propsData: { album: albumPassed },
    });

    expect(wrapper.text()).to.include(albumPassed.collectionName);
    expect(wrapper.text()).to.include(albumPassed.artistName);
    expect(wrapper.text()).to.include(albumPassed.country);
    expect(wrapper.text()).to.include(albumPassed.genre);
    expect(wrapper.text()).to.include(new Date(albumPassed.releaseDate).toLocaleDateString());
  });

  it('renders thumbnail when passed', () => {
    const albumPassed = {
      collectionName: 'collection_name',
      collectionId: 'collection_id',
      artistName: 'artist_name',
      artistId: 'artist_id',
      genre: 'sample_genre',
      country: 'sample_country',
      releaseDate: 'release_date',
      thumbnail: 'https://thumbnailexample/pic.png',
    };

    const wrapper = shallowMount(AlbumCard, {
      propsData: { album: albumPassed },
    });

    expect(wrapper.find('img').attributes('src').match(albumPassed.thumbnail));
  });

  it('does not display any thumbnail if not given', () => {
    const albumPassed = {
      collectionName: 'collection_name',
      collectionId: 'collection_id',
      artistName: 'artist_name',
      artistId: 'artist_id',
      genre: 'sample_genre',
      country: 'sample_country',
      releaseDate: 'release_date',
    };

    const wrapper = shallowMount(AlbumCard, {
      propsData: { album: albumPassed },
    });

    expect(wrapper.find('img').exists()).to.be.false;
  });
});
