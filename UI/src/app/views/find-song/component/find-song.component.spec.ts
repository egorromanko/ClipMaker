import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';

import { FindSongComponent } from './find-song.component';

describe('FindSongComponent', () => {
  let component: FindSongComponent;
  let fixture: ComponentFixture<FindSongComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [
        FindSongComponent,
      ],
      schemas: [
        NO_ERRORS_SCHEMA,
        CUSTOM_ELEMENTS_SCHEMA
      ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(FindSongComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
