/* tslint:disable */
/* eslint-disable */
/* Custom function for public books endpoint */

import { HttpClient, HttpContext, HttpResponse } from '@angular/common/http';
import { Observable } from 'rxjs';
import { filter, map } from 'rxjs/operators';
import { StrictHttpResponse } from '../../strict-http-response';
import { RequestBuilder } from '../../request-builder';

import { PageResponseBookResponse } from '../../models/page-response-book-response';

export interface FindAllBooksPublic$Params {
  page?: number;
  size?: number;
}

export function findAllBooksPublic(http: HttpClient, rootUrl: string, params?: FindAllBooksPublic$Params, context?: HttpContext): Observable<StrictHttpResponse<PageResponseBookResponse>> {
  const rb = new RequestBuilder(rootUrl, findAllBooksPublic.PATH, 'get');
  if (params) {
    rb.query('page', params.page, {});
    rb.query('size', params.size, {});
  }

  return http.request(
    rb.build({ responseType: 'json', accept: 'application/json', context })
  ).pipe(
    filter((r: any): r is HttpResponse<any> => r instanceof HttpResponse),
    map((r: HttpResponse<any>) => {
      return r as StrictHttpResponse<PageResponseBookResponse>;
    })
  );
}

findAllBooksPublic.PATH = '/books/everyone';
