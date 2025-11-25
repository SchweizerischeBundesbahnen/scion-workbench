/*
 * Copyright (c) 2018-2022 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 */

import {Component, effect, ElementRef, inject, Provider, viewChild} from '@angular/core';
import {CdkTrapFocus} from '@angular/cdk/a11y';
import {SciViewportComponent} from '@scion/components/viewport';
import {GLASS_PANE_BLOCKABLE, GLASS_PANE_OPTIONS, GlassPaneDirective, GlassPaneOptions} from '../glass-pane/glass-pane.directive';
import {trackFocus} from '../focus/workbench-focus-tracker.service';
import {ɵWorkbenchPopup} from './ɵworkbench-popup';
import {NgComponentOutlet} from '@angular/common';

/**
 * Renders the content of a workbench popup.
 */
@Component({
  selector: 'wb-popup',
  templateUrl: './workbench-popup.component.html',
  styleUrl: './workbench-popup.component.scss',
  imports: [
    CdkTrapFocus,
    SciViewportComponent,
    NgComponentOutlet,
  ],
  hostDirectives: [
    GlassPaneDirective,
  ],
  providers: [
    configurePopupGlassPane(),
  ],
  host: {
    '[attr.data-popupid]': 'popup.id',
    '[style.width]': 'popup.size?.width()',
    '[style.min-width]': 'popup.size?.minWidth()',
    '[style.max-width]': 'popup.size?.maxWidth()',
    '[style.height]': 'popup.size?.height()',
    '[style.min-height]': 'popup.size?.minHeight()',
    '[style.max-height]': 'popup.size?.maxHeight()',
    '[class]': 'popup.cssClass()',
  },
})
export class WorkbenchPopupComponent {

  private readonly _host = inject(ElementRef).nativeElement as HTMLElement;
  private readonly _cdkTrapFocus = viewChild.required('focus_trap', {read: CdkTrapFocus});

  protected readonly popup = inject(ɵWorkbenchPopup);

  constructor() {
    trackFocus(this._host, this.popup);
    this.focusInitialElement();
  }

  private focusInitialElement(): void {
    const effectRef = effect(() => {
      // [Angular 14] The initial focus must not be requested via `cdkTrapFocusAutoCapture` as this would restore
      // focus to the previously focused element when the `FocusTrap` is destroyed. This behavior is unwanted if the
      // popup is closed by losing focus. Otherwise, the newly focused element that caused the loss of focus and thus
      // the closing of the popup would immediately become unfocused again. This behavior could only be observed when
      // the popup loses focus by clicking on an element in a microfrontend.
      void this._cdkTrapFocus().focusTrap.focusInitialElementWhenReady();
      effectRef.destroy();
    });
  }
}

/**
 * Blocks this popup when dialog(s) overlay it.
 */
function configurePopupGlassPane(): Provider[] {
  return [
    {
      provide: GLASS_PANE_BLOCKABLE,
      useFactory: () => inject(ɵWorkbenchPopup),
    },
    {
      provide: GLASS_PANE_OPTIONS,
      useFactory: () => ({attributes: {'data-popupid': inject(ɵWorkbenchPopup).id}}) satisfies GlassPaneOptions,
    },
  ];
}
