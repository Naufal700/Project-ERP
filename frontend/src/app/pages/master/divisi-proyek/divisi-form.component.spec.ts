import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DivisiFormComponent } from './divisi-form.component';

describe('DivisiFormComponent', () => {
  let component: DivisiFormComponent;
  let fixture: ComponentFixture<DivisiFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ DivisiFormComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DivisiFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
