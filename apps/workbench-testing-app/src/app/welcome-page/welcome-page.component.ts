import { Component, Optional } from '@angular/core';
import { WorkbenchView } from '@scion/workbench';

@Component({
  selector: 'app-welcome-page',
  templateUrl: './welcome-page.component.html',
  styleUrls: ['./welcome-page.component.scss'],
})
export class WelcomePageComponent {

  constructor(@Optional() view: WorkbenchView) {
    if (view) {
      view.title = 'Welcome';
      view.cssClass = 'e2e-welcome-page';
    }
  }
}
