import { Injectable } from '@angular/core';
import { Http, Headers, RequestOptions, RequestMethod, Request } from '@angular/http';
// Compiler complains if this isnt included.
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/map'

@Injectable()
export class AppService {

  constructor( private http: Http ) {}

public fetchData(code: any) {
    return this.http.get('http://localhost:3000/img' ).map(
        (res) => res.json()
    );
}

public fetchImage(code: any) {
    return this.http.get('http://localhost:3000/imgfile' ).map(
        (res) => res.json()
    );
}

}
