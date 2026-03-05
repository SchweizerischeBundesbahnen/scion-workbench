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
    // contributeMenu('toolbar:workbench.notification', menu => menu
    //   .addMenu({icon: 'more_vert'}, menu => menu
    //     .addMenuItem({label: 'Settings...'}, () => this.onAction())
    //     .addGroup(group => group
    //       .addMenuItem({label: 'Don\'t Show Again For This Project'}, () => this.onAction())
    //       .addMenuItem({label: 'Don\'t Show Again'}, () => this.onAction()),
    //     ),
    //   ),
    // )
    contributeMenu('menu:additions', menu => menu
      .addGroup(group => group
        .addMenuItem({label: 'Settings...'}, () => this.onAction()),
      )
      .addGroup(group => group
        .addMenuItem({label: 'Don\'t Show Again'}, () => this.onAction()),
      ),
    )
  }

  private onAction(): void {
    console.log('>>> click');
  }
}
