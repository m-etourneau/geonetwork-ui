import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../environements/environement';

@Injectable({
  providedIn: 'root',
})
export class RedmineService {
  // private apiUrl = 'https://redmine.hautsdefrance.fr/issues/7085.json';
  private apiUrl = '/redmine-api/issues/7084.json';
  private username = environment.redmineUsername;
  private password = environment.redminePassword;

  constructor(private http: HttpClient) {}

  getIssueData() {
    // const encodedCredentials = Buffer.from(`${this.username}:${this.password}`).toString('base64');

    // const headers = new HttpHeaders({
    //     'Authorization': `Basic ${encodedCredentials}`,
    //     'Content-Type': 'application/json',
    // });

    const headers = new HttpHeaders({
        'Authorization': 'Basic ' + btoa(`${this.username}:${this.password}`),
        'Content-Type': 'application/json',
      });

    return this.http.get(this.apiUrl, { headers });
  }
}
