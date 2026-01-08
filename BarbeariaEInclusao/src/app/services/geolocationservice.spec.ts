import { TestBed } from '@angular/core/testing';

import { Geolocationservice } from './geolocationservice';

describe('Geolocationservice', () => {
  let service: Geolocationservice;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(Geolocationservice);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
