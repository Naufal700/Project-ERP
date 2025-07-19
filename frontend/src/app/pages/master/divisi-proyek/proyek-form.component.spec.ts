import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProyekFormComponent } from './proyek-form.component';

describe('ProyekFormComponent', () => {
  let component: ProyekFormComponent;
  let fixture: ComponentFixture<ProyekFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ProyekFormComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ProyekFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
