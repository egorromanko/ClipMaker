import { Component, OnInit } from '@angular/core';
import { ToastService, StateService, LyricsService } from 'app/services';

@Component({
  selector: 'app-enter-lyrics',
  templateUrl: './enter-lyrics.component.html',
  styleUrls: ['./enter-lyrics.component.scss']
})
export class EnterLyricsComponent implements OnInit {
  
  public lyrics: string;
  public youtubeLink: string;

  constructor(private lyricsService: LyricsService,
    private toast: ToastService,
    private state: StateService) { 
      this.lyrics = state.lyrics;
    }

  ngOnInit() {
    if (!this.state.title) {
      return;
    }

    this.lyricsService.getYoutubeLink(this.state.title).subscribe((res:any) => {
      if (res.items.length == 0) {
        this.toast.warning("Warning", "Error getting music for song, default one will be used in the resulting clip");
        return;
      }

      this.youtubeLink = `https://www.youtube.com/watch?v=${res.items[0].id.videoId}`;
      },
      err => {
        this.toast.error("Error", "Error getting youtube link for song");
      }
    )
  }

  onSubmit() {
    if (!this.lyrics) {
      this.toast.warning("Empty lyrics", "Please enter lyrics or find a song");
    }

    this.lyricsService.createClip(this.lyrics, this.youtubeLink).subscribe((res:any) => {
        console.log(res);
      },
      err => {
        this.toast.error("Error", "Error creating a clip");
      })
  }
}
