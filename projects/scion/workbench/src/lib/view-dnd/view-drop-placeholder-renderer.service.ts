/*
 * Copyright (c) 2018-2023 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 */

import {inject, Injectable} from '@angular/core';
import {createElement, setAttribute, setStyle} from '../common/dom.util';
import {VIEW_DROP_ZONE_OVERLAY_HOST} from '../workbench-element-references';

/**
 * Renders the visual placeholder when dragging a view over a valid drop zone.
 *
 * To animate the transition of the placeholder, we use a single HTML element for the placeholder and
 * adjust its position when the drop zone changes.
 */
@Injectable({providedIn: 'root'})
export class ViewDropPlaceholderRenderer {

  private readonly _dropPlaceholderOverlayHost = inject(VIEW_DROP_ZONE_OVERLAY_HOST);

  private _dropPlaceholder: HTMLElement | null = null;

  /**
   * Identifies the drop zone displaying the placeholder.
   *
   * This id is used to guard disposal, so that only the drop zone displaying the placeholder can remove it.
   */
  private _dropZoneId: string | null = null;

  /**
   * Renders the placeholder.
   *
   * @param dropZoneId - Identifies the drop zone which renders the placeholder.
   * @param rect - Specifies position and size of the placeholder. Passing `null` removes the placeholder.
   */
  public render(dropZoneId: string, rect: DOMRect | null): void {
    if (rect) {
      this._dropZoneId = dropZoneId;
      this._dropPlaceholder ??= this.createDropPlaceholder();

      setStyle(this._dropPlaceholder, {
        top: `${rect.top}px`,
        left: `${rect.left}px`,
        width: `${rect.width}px`,
        height: `${rect.height}px`,
      });
      setAttribute(this._dropPlaceholder, {
        'data-dropzoneid': this._dropZoneId,
      });
    }
    else if (dropZoneId === this._dropZoneId) {
      this._dropPlaceholder?.remove();
      this._dropPlaceholder = null;
      this._dropZoneId = null;
    }
  }

  private createDropPlaceholder(): HTMLElement {
    return createElement('div', {
      parent: this._dropPlaceholderOverlayHost()!.element.nativeElement as HTMLElement,
      cssClass: 'e2e-drop-placeholder',
      style: {
        'position': 'fixed',
        'background-color': 'var(--sci-workbench-part-dropzone-background-color)',
        'border': '1px var(--sci-workbench-part-dropzone-border-style) var(--sci-workbench-part-dropzone-border-color)',
        'border-radius': 'var(--sci-workbench-part-dropzone-border-radius)',
        'pointer-events': 'none',
        'transition-duration': '125ms',
        'transition-property': 'top,left,width,height',
        'transition-timing-function': 'ease-out',
      },
    });
  }
}
