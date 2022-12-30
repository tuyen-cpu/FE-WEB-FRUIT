import { Injectable } from '@angular/core';
import { first, map } from 'rxjs';
import { SocketClientService } from './socket-client.service';

@Injectable({
  providedIn: 'root',
})
export class MessageRoomService {
  constructor(private socketClient: SocketClientService) {}

  save(message: { content: string; createdBy: string; chatRoomId: number }): void {
    this.socketClient.send(`/topic/message-room/create`, message);
  }
  onMessage() {
    return this.socketClient.onMessage('/topic/message-room/created').pipe(map((post) => post));
  }
  findAll(roomId: number) {
    return this.socketClient.onMessage(`/topic/room/${roomId}/get`).pipe(
      first(),
      map((posts) => posts),
    );
  }

  //   onComment(postId: number): Observable<Comment> {
  //     return this.socketClient.onMessage(`/topic/posts/${postId}/created`);
  //   }
}
