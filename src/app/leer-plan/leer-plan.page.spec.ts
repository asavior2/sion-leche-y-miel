import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { LeerPlanPage } from './leer-plan.page';

describe('LeerPlanPage', () => {
  let component: LeerPlanPage;
  let fixture: ComponentFixture<LeerPlanPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ LeerPlanPage ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(LeerPlanPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
