import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PlanDetallePage } from './plan-detalle.page';

describe('PlanDetallePage', () => {
  let component: PlanDetallePage;
  let fixture: ComponentFixture<PlanDetallePage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PlanDetallePage ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PlanDetallePage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
