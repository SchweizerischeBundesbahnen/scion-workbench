import {Component, inject} from '@angular/core';
import {WorkbenchRouterLinkDirective} from '@scion/workbench';
import {TodoService} from '../todo.service';

@Component({
  selector: 'app-todos',
  templateUrl: './todos.component.html',
  imports: [
    WorkbenchRouterLinkDirective,
  ],
})
export default class TodosComponent {

  protected readonly todoService = inject(TodoService);
}
