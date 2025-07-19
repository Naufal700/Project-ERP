import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DivisiProyekComponent } from './divisi-proyek.component';

describe('DivisiProyekComponent', () => {
  let component: DivisiProyekComponent;
  let fixture: ComponentFixture<DivisiProyekComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ DivisiProyekComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DivisiProyekComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
