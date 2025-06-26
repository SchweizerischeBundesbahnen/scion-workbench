/*
 * Copyright (c) 2018-2024 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 */

import {ChangeDetectionStrategy, Component, computed, inject, isDevMode} from '@angular/core';
import {TextPipe} from '../text/text.pipe';
import {WorkbenchService} from '../workbench.service';
import {WORKBENCH_OUTLET} from '../routing/workbench-auxiliary-route-installer.service';
import {Routing} from '../routing/routing.util';
import {Router} from '@angular/router';
import {WorkbenchView} from '../view/workbench-view.model';
import {WorkbenchPart} from '../part/workbench-part.model';
import {WorkbenchDialog} from '../dialog/workbench-dialog';
import {Popup} from '../popup/popup.config';

@Component({
  selector: 'wb-page-not-found',
  templateUrl: './page-not-found.component.html',
  styleUrls: ['./page-not-found.component.scss'],
  imports: [
    TextPipe,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class PageNotFoundComponent {

  private readonly _router = inject(Router);

  protected readonly isDevMode = isDevMode();
  protected readonly Routing = Routing;
  protected readonly workbenchService = inject(WorkbenchService);

  protected readonly outlet = inject(WORKBENCH_OUTLET);
  protected readonly view = inject(WorkbenchView, {optional: true});
  protected readonly part = inject(WorkbenchPart, {optional: true});
  protected readonly dialog = inject(WorkbenchDialog, {optional: true});
  protected readonly popup = inject(Popup, {optional: true});

  protected readonly path = computed(() => {
    // Track the URL.
    this.workbenchService.layout();

    const urlTree = this._router.parseUrl(this._router.url);
    const outlets = Routing.parseOutlets(urlTree, {
      view: Routing.isViewOutlet(this.outlet) || undefined,
      part: Routing.isPartOutlet(this.outlet) || undefined,
      dialog: Routing.isDialogOutlet(this.outlet) || undefined,
      messagebox: Routing.isMessageBoxOutlet(this.outlet) || undefined,
      popup: Routing.isPopupOutlet(this.outlet) || undefined,
    });
    return outlets.get(this.outlet)?.map(segment => `${segment}`).join('/') ?? '';
  });
}
