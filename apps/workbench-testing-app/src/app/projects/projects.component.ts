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
    contributeMenu('toolbar:workbench.part.tools.end', menu => menu
      .addMenu({label: 'File'}, menu => menu
        .addMenuItem({label: 'New', icon: 'article', accelerator: ['Ctrl', 'N']}, () => this.onAction())
        .addMenuItem({label: 'Open', icon: 'folder'}, () => this.onAction())
        .addMenuItem({label: 'Make a Copy', icon: 'file_copy'}, () => this.onAction())
        .addMenu({label: 'Share', name: 'menu:share', icon: 'person_add'}, menu => menu
          .addMenuItem({label: 'Share with others', icon: 'person_add', name: 'menuitem:share-with-others'}, () => this.onAction())
          .addMenuItem({label: 'Publish to web', icon: 'public'}, () => this.onAction()),
        )
        .addMenuItem({label: 'Download', icon: 'download'}, () => this.onAction())
        .addMenuItem({label: 'Print', icon: 'print'}, () => this.onAction()),
      ),
    )
  }

  private onAction(): void {
    console.log('>>> click');
  }
}
