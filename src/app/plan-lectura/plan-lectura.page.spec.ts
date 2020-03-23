import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PlanLecturaPage } from './plan-lectura.page';

describe('PlanLecturaPage', () => {
  let component: PlanLecturaPage;
  let fixture: ComponentFixture<PlanLecturaPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PlanLecturaPage ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PlanLecturaPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
