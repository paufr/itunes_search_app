/* eslint-disable no-unused-expressions */

import { expect } from 'chai';
import { mount, shallowMount } from '@vue/test-utils';
import ErrorDisplayer from '@/components/ErrorDisplayer.vue';

describe('ErrorDisplayer.vue', () => {
  it('renders props.error when passed', () => {
    const errorPassed = {
      message: 'message',
    };

    const wrapper = shallowMount(ErrorDisplayer, {
      propsData: { error: errorPassed },
    });

    expect(wrapper.find('.error-section').text().includes(errorPassed.message)).to.be.true;
  });

  it('should not display the error section if error is empty', () => {
    const errorPassed = {};

    const wrapper = mount(ErrorDisplayer, {
      propsData: { error: errorPassed },
    });

    expect(wrapper.find('.error-section').exists()).to.be.false;
  });

  it('should not display the error section if error message is empty', () => {
    const errorPassed = { message: '' };

    const wrapper = mount(ErrorDisplayer, {
      propsData: { error: errorPassed },
    });

    expect(wrapper.find('.error-section').exists()).to.be.false;
  });
});
