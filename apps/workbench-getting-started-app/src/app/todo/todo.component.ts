import {Component, computed, effect, inject, input} from '@angular/core';
import {WorkbenchView} from '@scion/workbench';
import {TodoService} from '../todo.service';
import {DatePipe} from '@angular/common';

@Component({
  selector: 'app-todo',
  templateUrl: './todo.component.html',
  styleUrl: './todo.component.scss',
  imports: [
    DatePipe,
  ],
})
export default class TodoComponent {

  public readonly id = input.required<string>();

  private readonly todoService = inject(TodoService);

  protected todo = computed(() => this.todoService.getTodo(this.id()));

  constructor() {
    const view = inject(WorkbenchView);
    effect(() => view.title = this.todo().task);
  }
}
