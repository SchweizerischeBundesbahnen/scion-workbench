import {Component} from '@angular/core';
import {contributeMenu} from '@scion/sci-components/menu';

@Component({
  selector: 'app-notification-1',
  imports: [],
  templateUrl: './notification-1.component.html',
  styleUrl: './notification-1.component.scss',
})
export class Notification1Component {

  constructor() {
    contributeMenu('menu:additions', menu => menu
      .addGroup(group => group
        .addMenuItem({label: 'Settings...', onSelect: () => this.onAction()}),
      )
      .addGroup(group => group
        .addMenuItem({label: 'Don\'t Show Again', onSelect: () => this.onAction()}),
      ),
    )
  }

  private onAction(): void {
    console.log('>>> click');
  }
}
