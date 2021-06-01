/* eslint-disable no-unused-expressions */

import { expect } from 'chai';
import { shallowMount } from '@vue/test-utils';
import ArtistCard from '@/components/ArtistCard.vue';

describe('ArtistCard.vue', () => {
  it('renders props.artist when passed', () => {
    const artistPassed = {
      name: 'artist_name',
      id: 'artist_id',
      genre: 'main_genre',
    };

    const wrapper = shallowMount(ArtistCard, {
      propsData: { artist: artistPassed },
    });

    expect(wrapper.text()).to.include(artistPassed.name);
    expect(wrapper.text()).to.include(artistPassed.genre);
  });

  it('only renders the name if genre not passed', () => {
    const artistPassed = {
      name: 'artist_name',
      id: 'artist_id',
    };

    const wrapper = shallowMount(ArtistCard, {
      propsData: { artist: artistPassed },
    });

    expect(wrapper.text()).to.include(artistPassed.name);
    expect(wrapper.text()).to.not.include('Main genre:');
  });
});
