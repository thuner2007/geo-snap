/**
 * Snapshot Test for GeoCoordinateDisplay Component
 *
 * Contains exactly 1 snapshot test to verify UI consistency
 * @jest-environment jsdom
 */

import React from 'react';
import { render } from '@testing-library/react';
import { GeoCoordinateDisplay } from '../../components/GeoCoordinateDisplay';

describe('GeoCoordinateDisplay Component - Snapshot Test', () => {
  // SNAPSHOT TEST
  it('should match snapshot with decimal coordinates', () => {
    const { container } = render(
      <GeoCoordinateDisplay
        latitude={48.8566}
        longitude={2.3522}
        label="Paris, France"
        showDMS={false}
      />
    );

    expect(container.firstChild).toMatchSnapshot();
  });
});
