/*
 * Copyright (c) 2018-2024 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 */

import {Component} from '@angular/core';
import {AsyncPipe, NgClass} from '@angular/common';
import {SciListComponent, SciListItemDirective} from '@scion/components.internal/list';
import {SciMaterialIconDirective} from '@scion/components.internal/material-icon';
import {WorkbenchSelectionService, WorkbenchView} from '@scion/workbench';

@Component({
  selector: 'app-selection-list-page',
  templateUrl: './selection-list-page.component.html',
  styleUrls: ['./selection-list-page.component.scss'],
  standalone: true,
  imports: [
    AsyncPipe,
    SciListComponent,
    SciListItemDirective,
    SciMaterialIconDirective,
    NgClass,
  ],
})
export default class SelectionListPageComponent {

  public selectedItems = new Set<string>();
  public items = ITEMS;

  constructor(private _selectionService: WorkbenchSelectionService,
              public view: WorkbenchView) {
    this._selectionService.selection$
      .subscribe(selection => {
        const workbenchElements = selection?.['workbench'];
        if (workbenchElements) {
          this.clearSelection();
          workbenchElements.forEach(item => this.onSelect(item as string));
        }
      });
  }

  public onSelect(item: string): void {
    this.selectedItems.add(item);
    this._selectionService.setSelection({workbench: Array.from(this.selectedItems)});
  }

  public onUnselect(item: string): void {
    this.selectedItems.delete(item);
    this._selectionService.setSelection({workbench: Array.from(this.selectedItems)});
  }

  public clearSelection(): void {
    this.selectedItems.clear();
    this._selectionService.setSelection({workbench: Array.from(this.selectedItems)});
  }

  public isSelected(item: string): boolean {
    return this.selectedItems.has(item);
  }

  public toggleSelection(item: string): void {
    if (!this.isSelected(item)) {
      this.onSelect(item);
    }
    else {
      this.onUnselect(item);
    }
  }
}

export const ITEMS: Item[] = [
  {
    id: 'SCION Workbench',
    description: 'SCION Microfrontend Platform is a TypeScript-based open-source library that helps to implement a microfrontend architecture using iframes.',
  },
  {
    id: 'SCION Microfrontend Platform',
    description: 'SCION provides fundamental building blocks for implementing a microfrontend architecture and facilitates the development of Angular web applications that require a complex workbench layout of multiple views and windows.',
  },
  {
    id: 'SCION Toolkit',
    description: 'SCION Toolkit is a collection of UI components and utilities designed primarily for use in SCION libraries and their demo and test applications.',
  },
  {
    id: 'Angular',
    description: 'Angular is an application design framework and development platform for creating efficient and sophisticated single-page apps.',
  },
  {
    id: 'Angular CDK',
    description: 'The Component Dev Kit (CDK) is a set of tools that implement common interaction patterns whilst being unopinionated about their presentation.',
  },
  {
    id: 'Angular Material',
    description: 'Angular Material comprises a range of components which implement common interaction patterns according to the Material Design specification.',
  },
  {
    id: 'Angular Schematics',
    description: 'A schematic is a template-based code generator that supports complex logic. It is a set of instructions for transforming a software project by generating or modifying code.',
  },
];

export interface Item {
  id: string;
  description: string;
}
