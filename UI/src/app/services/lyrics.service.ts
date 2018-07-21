import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable()
export class LyricsService {
  constructor(private http:HttpClient) { }

  public getYoutubeLink(title: string): Observable<Object> {
    const address = `https://www.googleapis.com/youtube/v3/search?part=snippet&q=${title}&key=AIzaSyDhYsNFsIhWBA5zBUYu3Gg-ycyS9s6YQ1I`;
    return this.http.get(address);
  }

  public createClip(lyrics: string, youtubeLink: string): Observable<Object> {
    const address = `http://localhost:60877/api/clipmaker/CreateClip`;
    const data = new ClipData(lyrics, youtubeLink);
    return this.http.post(address, data);
  }
}

class ClipData {
  Lyrics: string;
  YoutubeLink: string;

  constructor(lyrics: string, youtubeLink: string) {
    this.Lyrics = lyrics;
    this.YoutubeLink = youtubeLink;
  }
}