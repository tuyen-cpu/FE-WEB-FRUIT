import { Injectable } from '@angular/core';
import { first, map } from 'rxjs';
import { SocketClientService } from './socket-client.service';

@Injectable({
  providedIn: 'root',
})
export class ChatRoomService {
  constructor(private socketClient: SocketClientService) {}
  findAll() {
    return this.socketClient.onMessage('/topic/room/get').pipe(
      first(),
      map((posts) => posts.map(ChatRoomService.getPostListing)),
    );
  }

  //   findOne(id: number) {
  //     return this.socketClient
  //       .onMessage(`/topic/posts/${id}/get`)
  //       .pipe(first(), map(post => ChatRoomService.getPostInfo(post)));
  //   }

  //   findByAuthor(username: string) {
  //     return this.socketClient
  //       .onMessage(`/topic/author/${username}/posts/get`)
  //       .pipe(first(), map(posts => posts.map(ChatRoomService.getPostListing)));
  //   }

  save(room: { createdBy: string }) {
    return this.socketClient.send('/topic/room/create', room);
  }

  onPost() {
    return this.socketClient.onMessage('/topic/room/created').pipe(map((post) => ChatRoomService.getPostListing(post)));
  }

  static getPostListing(post: any) {
    const postedAt = new Date(post['postedAt']);
    return { ...post, postedAt };
  }

  static getPostInfo(post: any) {
    const postedAt = new Date(post['createdAt']);
    const comments = post['comments'].map((comment) => ChatRoomService.getComment(comment));
    return { ...post, postedAt, comments };
  }

  static getComment(comment: any): Comment {
    const postedAt = new Date(comment['createdAt']);
    return { ...comment, postedAt };
  }
}
