import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AnalyticdataComponent } from './analyticdata.component';

describe('AnalyticdataComponent', () => {
  let component: AnalyticdataComponent;
  let fixture: ComponentFixture<AnalyticdataComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [AnalyticdataComponent]
    });
    fixture = TestBed.createComponent(AnalyticdataComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
