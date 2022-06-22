import { TestBed } from '@angular/core/testing';

import { BibliaService } from './biblia.service';

describe('BibliaService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: BibliaService = TestBed.inject(BibliaService);
    expect(service).toBeTruthy();
  });
});
