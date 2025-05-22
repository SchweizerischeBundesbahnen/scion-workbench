import {Component, inject} from '@angular/core';
import {TodoService} from '../todo.service';

@Component({
  selector: 'app-overview',
  templateUrl: './overview.component.html',
  styleUrl: './overview.component.scss',
})
export default class OverviewComponent {

  protected readonly todoService = inject(TodoService);
}
