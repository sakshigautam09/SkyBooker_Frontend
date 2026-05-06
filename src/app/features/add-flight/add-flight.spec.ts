import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddFlight } from './add-flight';

describe('AddFlight', () => {
  let component: AddFlight;
  let fixture: ComponentFixture<AddFlight>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AddFlight],
    }).compileComponents();

    fixture = TestBed.createComponent(AddFlight);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
