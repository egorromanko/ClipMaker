import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { EnterLyricsComponent } from './enter-lyrics.component';

describe('EnterLyricsComponent', () => {
  let component: EnterLyricsComponent;
  let fixture: ComponentFixture<EnterLyricsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ EnterLyricsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(EnterLyricsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
