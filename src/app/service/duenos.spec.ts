import { TestBed } from '@angular/core/testing';

import { Duenos } from './duenos';

describe('Duenos', () => {
  let service: Duenos;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(Duenos);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
