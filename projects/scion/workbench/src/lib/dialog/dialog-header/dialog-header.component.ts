/*
 * Copyright (c) 2018-2023 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 */

import {Component, inject} from '@angular/core';
import {ɵWorkbenchDialog} from '../ɵworkbench-dialog.model';
import {SciTextPipe} from '@scion/sci-components/text';
import {contributeMenu, SciToolbarComponent, SciToolbarFactory} from '@scion/sci-components/menu';
import {WorkbenchMenuContextKeys} from '@scion/workbench';
import {noop} from 'rxjs';

/**
 * Renders the dialog header with a close button and optional title.
 */
@Component({
  selector: 'wb-dialog-header',
  templateUrl: './dialog-header.component.html',
  styleUrls: ['./dialog-header.component.scss'],
  imports: [
    SciTextPipe,
    SciToolbarComponent,
  ],
})
export class DialogHeaderComponent {

  protected readonly dialog = inject(ɵWorkbenchDialog);

  constructor() {
    contributeMenu({location: 'toolbar:workbench.dialog.toolbar', position: 'end'}, toolbar => {
      this.contributeToolbarAdditionsMenu(toolbar);
      this.contributeCloseButton(toolbar);
    }, {requiredContext: new Map().set(WorkbenchMenuContextKeys.ViewId, undefined)}); // clear view constraint to contribute to parts with and without views

    // TODO [menu] only for illustration purpose
    contributeMenu('menu:workbench.dialog.toolbar', menu => menu
      .addMenuItem('Settings...', noop)
      .addGroup(group => group
        .addMenuItem({label: 'Auto Save', checked: true, onSelect: noop})
        .addMenuItem({label: 'Reset', onSelect: noop}),
      ),
    );
  }

  protected onToolbarMouseDown(event: Event): void {
    event.stopPropagation(); // Prevent dragging the dialog when pressing toolbar item, e.g., the close button.
  }

  protected onEscape(event: Event): void {
    event.stopPropagation(); // Prevent dialog from closing.
  }

  /**
   * Contributes a menu for the application to contribute to the dialog toolbar m.
   *
   * Public contribution point: 'menu:workbench.dialog.toolbar'
   */
  private contributeToolbarAdditionsMenu(toolbar: SciToolbarFactory): void {
    toolbar.addMenu({name: 'menu:workbench.dialog.toolbar', icon: 'more_vert', visualMenuHint: false}, menu => menu);
  }

  private contributeCloseButton(toolbar: SciToolbarFactory): void {
    if (this.dialog.closable()) {
      // tabindex="-1"
      toolbar.addToolbarItem({
        icon: 'close', // TODO [menu] icon ligature: workbench.close
        tooltip: '%scion.workbench.close.tooltip',
        cssClass: 'e2e-close',
        onSelect: () => {
          this.dialog.close();
        },
      });
    }
  }
}
