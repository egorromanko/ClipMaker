import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { interval } from 'rxjs';
import { SearchApiService, StateService, ToastService, SearchMicService } from 'app/services';
import { SearchResult, Track, Lyrics } from 'app/models';

declare var MediaRecorder: any;

@Component({
  selector: 'app-find-song',
  templateUrl: './find-song.component.html',
  styleUrls: ['./find-song.component.scss']
})
export class FindSongComponent {

  public searchQuery: string;
  public pageNumber: number = 1;
  public searchResults: Array<Track> = new Array<Track>();
  public hasMoreResults: boolean = false;

  public mediaRecorder: any;
  public isRecording: boolean = false;

  constructor(
    private searchService: SearchApiService,
    private searchMicService: SearchMicService,
    private toast: ToastService,
    private state: StateService,
    private router: Router) { }

  public onSearch(pageNumber: number) {
    if (!this.searchQuery) {
      this.toast.warning('Invalid search term', 'Please enter a search term.');
      return;
    }
    
    this.searchService.searchByText(this.searchQuery, pageNumber).subscribe((res:SearchResult<Track>) => {
      if (res.header.status_code != 200) {
        this.toast.error('Search error', 'Error searching for songs');
        return;
      }

      if (res.header.available == 0) {
        this.toast.warning('No results', 'Could not find any songs matching your search criteria');
        return;
      }

      if (res.header.available > this.searchResults.length + res.body.track_list.length) {
        ++this.pageNumber;
        this.hasMoreResults = true;
      } else {
        this.pageNumber = 1;
        this.hasMoreResults = false;
      }

      if (pageNumber == 1) {
        this.searchResults = res.body.track_list;
      } else {
        this.searchResults.push(... res.body.track_list);
      }
    }, err => {
      this.toast.error('Search error', 'Error searching for songs');
    })
  }

  public async onRecord() {
    if (this.isRecording) {
      this.mediaRecorder.stop();
      return;
    }

    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    this.mediaRecorder = new MediaRecorder(stream);
    const audioChunks = [];

    this.mediaRecorder.addEventListener("dataavailable", event => {
      audioChunks.push(event.data);
    });

    this.mediaRecorder.addEventListener("stop", () => {
      this.isRecording = false;
      let audioBlob = new Blob(audioChunks);
      let file:any = audioBlob;
      file.lastModifiedDate = new Date();
      file.name = 'upload.mp3';

      this.searchMicService.searchByMic(<File>file).subscribe((res:any) => {
        if (res.status != "Success") {
          this.toast.warning('No results', 'Could not find any songs matching your recording');
          return;
        }

        this.searchQuery = res.metadata.music[0].title;
        this.onSearch(0);
      }, err => {
        this.toast.error('Recognize error', 'Error recognizing song');
      });
    });

    this.mediaRecorder.start();
    this.isRecording = true;

    const subscription = interval(15000).subscribe(i => { 
        if (this.isRecording) {
          this.mediaRecorder.stop();
          subscription.unsubscribe();
        }
    })
  }

  public onSelect(trackId: string, trackTitle: string) {
    this.searchService.getLyrics(trackId).subscribe((res:SearchResult<Lyrics>) => {
      if (res.header.status_code != 200) {
        this.toast.error('Error', 'Error searching for lyrics');
        return;
      }

      if (!res.body.lyrics.lyrics_body) {
        this.toast.warning('No results', 'Could not find lyrics for the selected song');
        return;
      }

      this.state.lyrics = res.body.lyrics.lyrics_body;
      this.state.title = trackTitle;
      this.router.navigate(['enter-lyrics']);
    }, err => {
      this.toast.error('Error', 'Error searching for lyrics');
    })
  }
}
