import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable()
export class SearchMicService {
    constructor(private http:HttpClient) { }
  
    public searchByMic(data: File): Observable<Object> {
        let input = new FormData();
        input.append('file', data, data.name);

        const address = `http://localhost:60877/api/clipmaker/recognize`;
        return this.http.post(address, input);
    }
  }