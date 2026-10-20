import { TestBed } from '@angular/core/testing';

import { BikeRepairApiService } from './bike-repair-api.service';

describe('BikeRepairApiService', () => {
  let service: BikeRepairApiService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(BikeRepairApiService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
