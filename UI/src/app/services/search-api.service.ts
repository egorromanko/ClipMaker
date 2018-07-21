import { Injectable } from '@angular/core';
import { Jsonp } from '@angular/http';
import { Observable } from 'rxjs';
import { map } from "rxjs/operators";
import { Track, SearchResult, Lyrics } from 'app/models';

@Injectable()
export class SearchApiService {
    private readonly apiKey: string = 'b46ce3856bfb01d9f0d1e469dd0d8a81';

    constructor(private jsonp: Jsonp) { }
  
    public searchByText(query: string, page: number): Observable<SearchResult<Track>> {
        const address = `https://api.musixmatch.com/ws/1.1/track.search?page_size=20&page=${page}&q_track_artist=${query}&apikey=${this.apiKey}&s_track_rating=desc&f_has_lyrics=1&format=jsonp&callback=JSONP_CALLBACK`;
        return this.jsonp.request(address).pipe(map((x) => x.json().message)); 
    }

    public getLyrics(trackId: string): Observable<SearchResult<Lyrics>> {
        const address = `https://api.musixmatch.com/ws/1.1/track.lyrics.get?track_id=${trackId}&apikey=${this.apiKey}&format=jsonp&callback=JSONP_CALLBACK`;
        return this.jsonp.request(address).pipe(map((x) => x.json().message)); 
    }
  }