import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PelangganComponent } from './pelanggan.component';

describe('PelangganComponent', () => {
  let component: PelangganComponent;
  let fixture: ComponentFixture<PelangganComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PelangganComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PelangganComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
