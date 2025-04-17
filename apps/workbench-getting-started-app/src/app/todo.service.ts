/*
 * Copyright (c) 2018-2024 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 */

import {Injectable} from '@angular/core';

@Injectable({providedIn: 'root'})
export class TodoService {

  public readonly todos: Todo[] = [
    {
      id: '1',
      dueDate: nextDueDate(),
      task: 'Buy groceries',
      description: 'Pick up essentials from the supermarket.',
    },
    {
      id: '2',
      dueDate: nextDueDate(),
      task: 'Read a book',
      description: 'Finish reading "1984" by George Orwell.',
    },
    {
      id: '3',
      dueDate: nextDueDate(),
      task: 'Call mom',
      description: 'Catch up with mom over the phone.',
    },
    {
      id: '4',
      dueDate: nextDueDate(),
      task: 'Plan vacation',
      description: 'Research destinations for summer holiday.',
    },
    {
      id: '5',
      dueDate: nextDueDate(),
      task: 'Gym workout',
      description: 'Attend a fitness class at the gym.',
    },
    {
      id: '6',
      dueDate: nextDueDate(),
      task: 'Clean garage',
      description: 'Organize and tidy up the garage space.',
    },
    {
      id: '7',
      dueDate: nextDueDate(),
      task: 'Cook dinner',
      description: 'Prepare a new recipe for dinner tonight.',
    },
    {
      id: '8',
      dueDate: nextDueDate(),
      task: 'Meditate',
      description: 'Spend 15 minutes in meditation.',
    },
    {
      id: '9',
      dueDate: nextDueDate(),
      task: 'Water plants',
      description: 'Ensure all houseplants are well watered.',
    },
    {
      id: '10',
      dueDate: nextDueDate(),
      task: 'Write blog post',
      description: 'Draft a new entry for the personal blog.',
    },
    {
      id: '11',
      dueDate: nextDueDate(),
      task: 'Attend seminar',
      description: 'Participate in the online business seminar.',
    },
    {
      id: '12',
      dueDate: nextDueDate(),
      task: 'Update CV',
      description: 'Revise resume with recent work experience.',
    },
    {
      id: '13',
      dueDate: nextDueDate(),
      task: 'Art class',
      description: 'Join the local painting class.',
    },
    {
      id: '14',
      dueDate: nextDueDate(),
      task: 'Fix bike',
      description: 'Repair the bicycle\'s flat tire.',
    },
    {
      id: '15',
      dueDate: nextDueDate(),
      task: 'Volunteer',
      description: 'Spend the afternoon volunteering at the shelter.',
    },
    {
      id: '16',
      dueDate: nextDueDate(),
      task: 'Bake cookies',
      description: 'Make chocolate chip cookies for the family.',
    },
    {
      id: '17',
      dueDate: nextDueDate(),
      task: 'Yoga session',
      description: 'Attend the evening yoga session downtown.',
    },
    {
      id: '18',
      dueDate: nextDueDate(),
      task: 'Grocery list',
      description: 'Create a list for next week\'s groceries.',
    },
    {
      id: '19',
      dueDate: nextDueDate(),
      task: 'Email boss',
      description: 'Send project updates to your manager.',
    },
    {
      id: '20',
      dueDate: nextDueDate(),
      task: 'Walk dog',
      description: 'Take the dog for a walk in the park.',
    },
  ];

  public getTodo(id: string): Todo {
    const todo = this.todos.find(todo => todo.id === id);
    if (!todo) {
      throw Error(`No todo found with id '${id}'.`);
    }
    return todo;
  }
}

export interface Todo {
  id: string;
  dueDate: number;
  task: string;
  description: string;
}

function nextDueDate(): number {
  return Date.now() + Math.random() * 1000 * 60 * 60 * 24;
}
