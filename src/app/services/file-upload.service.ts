import { Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class FileUploadService {
  private REST_API = 'http://localhost:3000/api/file-upload';
  private urlImage = 'http://localhost:3000/api/file-upload/files';
  constructor(private httpClient: HttpClient) {}

  getLink() {
    return this.urlImage;
  }
}
