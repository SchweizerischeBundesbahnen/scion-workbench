/*
 * Copyright (c) 2018-2024 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 */

import {Component, computed, inject, isDevMode} from '@angular/core';
import {WorkbenchView} from '../view/workbench-view.model';
import {WorkbenchDesktop} from '../desktop/workbench-desktop.model';
import {UrlSegment} from '@angular/router';

@Component({
  selector: 'wb-page-not-found',
  templateUrl: './page-not-found.component.html',
  styleUrls: ['./page-not-found.component.scss'],
  standalone: true,
})
export default class PageNotFoundComponent {

  protected isDevMode = isDevMode();

  /**
   * Context in which opened this component.
   */
  protected context = {
    view: inject(WorkbenchView, {optional: true}),
    desktop: inject(WorkbenchDesktop, {optional: true}),
  };

  protected urlSegments = computed(() => {
    if (this.context.view) {
      return formatURL(this.context.view.urlSegments());
    }
    if (this.context.desktop) {
      return formatURL(this.context.desktop.urlSegments());
    }
    return [];
  });
}

function formatURL(segments: UrlSegment[]): string {
  return segments.map(segment => `${segment}`).join('/');
}
