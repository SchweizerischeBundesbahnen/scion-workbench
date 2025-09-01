import {Component, inject} from '@angular/core';
import {WorkbenchPart} from '@scion/workbench-client';

@Component({
  selector: 'app-bookmarks',
  template: 'Bookmarks Part',
})
export default class BookmarksComponent {

  constructor() {
    inject(WorkbenchPart).signalReady();
  }
}
