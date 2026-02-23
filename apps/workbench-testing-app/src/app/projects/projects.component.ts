import {Component} from '@angular/core';
import {contributeMenu} from '@scion/sci-components/menu';

@Component({
  selector: 'app-projects',
  imports: [],
  templateUrl: './projects.component.html',
  styleUrl: './projects.component.scss',
})
export class ProjectsComponent {

  constructor() {
    contributeMenu('toolbar:workbench.part.toolbar', menu => menu
      .addMenu({label: 'File'}, menu => menu
        .addMenuItem({label: 'New', icon: 'article', accelerator: {ctrl: true, key: 'N'}, onSelect: () => this.onAction()})
        .addMenuItem({label: 'Open', icon: 'folder', onSelect: () => this.onAction()})
        .addMenuItem({label: 'Make a Copy', icon: 'file_copy', onSelect: () => this.onAction()})
        .addMenu({label: 'Share', name: 'menu:share', icon: 'person_add'}, menu => menu
          .addMenuItem({label: 'Share with others', icon: 'person_add', name: 'menuitem:share-with-others', onSelect: () => this.onAction()})
          .addMenuItem({label: 'Publish to web', icon: 'public', onSelect: () => this.onAction()}),
        )
        .addMenuItem({label: 'Download', icon: 'download', onSelect: () => this.onAction()})
        .addMenuItem({label: 'Print', icon: 'print', onSelect: () => this.onAction()}),
      ),
    )
  }

  private onAction(): void {
    console.log('>>> click');
  }
}
