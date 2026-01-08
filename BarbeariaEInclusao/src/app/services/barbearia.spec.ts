import { TestBed } from '@angular/core/testing';

import { Barbearia } from '../model/barbearia';

describe('Barbearia', () => {
  let service: Barbearia;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(Barbearia);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
