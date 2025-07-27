import { createReducer, on } from '@ngrx/store';
import { LocationState } from './location.state';
import * as LocationActions from './location.actions';

export const initialLocationState: LocationState = {
  county: null,
  city: null,
  district: null,
  loading: false,
  error: null
};

export const locationReducer = createReducer(
  initialLocationState,
  
  on(LocationActions.setLocation, (state, { county, city, district }) => ({
    ...state,
    county,
    city,
    district,
    error: null
  })),
  
  on(LocationActions.loadLocationFromStorage, (state) => {
    const stored = sessionStorage.getItem('civica-location');
    if (stored) {
      try {
        const location = JSON.parse(stored);
        // Validate the parsed data has expected properties
        if (location && typeof location === 'object' && 
            'county' in location && 'city' in location && 'district' in location) {
          return {
            ...state,
            county: location.county,
            city: location.city,
            district: location.district,
            error: null
          };
        }
      } catch (error) {
        // If parsing fails or data is invalid, clear the corrupted storage
        console.error('Failed to parse location from storage:', error);
        sessionStorage.removeItem('civica-location');
      }
    }
    return state;
  }),
  
  on(LocationActions.clearLocation, () => {
    sessionStorage.removeItem('civica-location');
    return initialLocationState;
  })
);