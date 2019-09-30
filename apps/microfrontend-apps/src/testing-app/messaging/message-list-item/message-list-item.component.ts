import { Component, Input } from '@angular/core';
import { IntentMessage, TopicMessage } from '@scion/microfrontend-platform';

@Component({
  selector: 'app-message-list-item',
  templateUrl: './message-list-item.component.html',
  styleUrls: ['./message-list-item.component.scss'],
})
export class MessageListItemComponent {

  @Input()
  public isTopicMessage: boolean;

  @Input()
  public message: TopicMessage | IntentMessage;
}
