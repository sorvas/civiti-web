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
    error: null,
    loading: false
  })),
  
  on(LocationActions.loadLocationFromStorage, (state) => ({
    ...state,
    loading: true
  })),
  
  on(LocationActions.loadLocationFromStorageComplete, (state) => ({
    ...state,
    loading: false
  })),
  
  on(LocationActions.loadLocationFromStorageFailure, (state, { error }) => ({
    ...state,
    loading: false,
    error
  })),
  
  on(LocationActions.clearLocation, () => initialLocationState)
);