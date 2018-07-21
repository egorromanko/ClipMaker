
import { EnterLyricsComponent } from './views/enter-lyrics/component/enter-lyrics.component';
import { RouterModule, Route } from '@angular/router';
import { ModuleWithProviders } from '@angular/core';
import { NotFoundComponent } from './views/errors/not-found/not-found.component';
import { FindSongComponent } from './views/find-song/component/find-song.component';


const routes: Route[] = [
  { path: '', pathMatch: 'full', redirectTo: 'find-song' },
  { path: 'find-song', component: FindSongComponent },
  { path: 'enter-lyrics', component: EnterLyricsComponent },
  { path: '**', component: NotFoundComponent }
];

export const AppRoutes: ModuleWithProviders = RouterModule.forRoot(routes);
