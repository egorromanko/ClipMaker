import { NgModule, NO_ERRORS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

import { CalendarModule } from 'angular-calendar';

import { SharedModule } from '../shared/shared.module';

import { FooterComponent } from '../main-layout/footer/footer.component';
import { TypographyComponent } from './css/typography/typography.component';
import { IconsComponent } from './css/icons/icons.component';
import { FindSongComponent } from './find-song/component/find-song.component';
import { GridComponent } from './css/grid/grid.component';
import { MediaObjectComponent } from './css/media-object/media-object.component';
import { UtilitiesComponent } from './css/utilities/utilities.component';
import { ImagesComponent } from './css/images/images.component';
import { ColorsComponent } from './css/colors/colors.component';
import { ShadowComponent } from './css/shadow/shadow.component';
import { EnterLyricsComponent } from './enter-lyrics/component/enter-lyrics.component';


@NgModule({
  imports: [
    CommonModule,
    RouterModule,
    FormsModule,
    BrowserModule,
    BrowserAnimationsModule,
    SharedModule,
    CalendarModule.forRoot()
  ],
  declarations: [
    FooterComponent,
    TypographyComponent,
    IconsComponent,
    FindSongComponent,
    GridComponent,
    MediaObjectComponent,
    UtilitiesComponent,
    ImagesComponent,
    ColorsComponent,
    ShadowComponent,
    EnterLyricsComponent
  ],
  exports: [
    FooterComponent,
    TypographyComponent,
    IconsComponent,
    FindSongComponent,
    GridComponent,
    MediaObjectComponent,
    UtilitiesComponent,
    ImagesComponent,
    ColorsComponent,
    ShadowComponent,

  ],
  schemas: [NO_ERRORS_SCHEMA]
})
export class ViewsModule { }
