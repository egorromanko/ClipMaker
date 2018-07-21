export class SearchResult<T> {
    header: {
        status_code: number;
        available: number;
    }
    body: {
        track_list: Array<T>;
        lyrics: T;
    }
}