/*
 * Copyright (c) 2018-2026 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 */

import {Component, computed, inject, Signal} from '@angular/core';
import {WorkbenchPart} from '../workbench-part.model';
import {IconComponent} from '../../icon/icon.component';

/**
 * Renders a chevron with the hidden view tab count.
 *
 * This component is designed to be used as a toolbar icon in a toolbar.
 */
@Component({
  selector: 'wb-view-list-toolbar-icon',
  templateUrl: './view-list-toolbar-icon.component.html',
  styleUrls: ['./view-list-toolbar-icon.component.scss'],
  imports: [
    IconComponent,
  ],
})
export class ViewListToolbarIconComponent {

  protected readonly scrolledOutOfViewTabCount = this.computeScrolledOutOfViewTabCount();

  private computeScrolledOutOfViewTabCount(): Signal<number> {
    const part = inject(WorkbenchPart);
    return computed(() => part.views().reduce((count, view) => view.scrolledIntoView() ? count : count + 1, 0));
  }
}
