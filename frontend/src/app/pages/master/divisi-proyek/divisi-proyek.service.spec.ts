import { TestBed } from '@angular/core/testing';

import { DivisiProyekService } from './divisi-proyek.service';

describe('DivisiProyekService', () => {
  let service: DivisiProyekService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(DivisiProyekService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
