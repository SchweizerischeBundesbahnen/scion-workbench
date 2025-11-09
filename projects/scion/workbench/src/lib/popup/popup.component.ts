/*
 * Copyright (c) 2018-2022 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 */

import {Component, effect, ElementRef, inject, Injector, Provider, viewChild} from '@angular/core';
import {CdkPortalOutlet, ComponentPortal} from '@angular/cdk/portal';
import {CdkTrapFocus} from '@angular/cdk/a11y';
import {SciViewportComponent} from '@scion/components/viewport';
import {GLASS_PANE_BLOCKABLE, GLASS_PANE_OPTIONS, GlassPaneDirective, GlassPaneOptions} from '../glass-pane/glass-pane.directive';
import {trackFocus} from '../focus/workbench-focus-tracker.service';
import {ɵWorkbenchPopup} from './ɵworkbench-popup';

/**
 * Displays the configured popup component in the popup overlay.
 *
 * The component is added to a viewport so that it scrolls when it exceeds the maximum allowed popup overlay size.
 * A focus trap is installed and the initial focus is set.
 */
@Component({
  selector: 'wb-popup',
  templateUrl: './popup.component.html',
  styleUrls: ['./popup.component.scss'],
  imports: [
    CdkTrapFocus,
    CdkPortalOutlet,
    SciViewportComponent,
  ],
  hostDirectives: [
    GlassPaneDirective,
  ],
  providers: [
    configurePopupGlassPane(),
  ],
  host: {
    '[attr.data-popupid]': 'popup.id',
    '[style.width]': `popup.size?.width`,
    '[style.min-width]': `popup.size?.minWidth`,
    '[style.max-width]': `popup.size?.maxWidth`,
    '[style.height]': `popup.size?.height`,
    '[style.min-height]': `popup.size?.minHeight`,
    '[style.max-height]': `popup.size?.maxHeight`,
    '[attr.class]': `popup.cssClasses.join(' ')`,
  },
})
export class PopupComponent {

  private readonly _host = inject(ElementRef).nativeElement as HTMLElement;
  private readonly _cdkTrapFocus = viewChild.required('focus_trap', {read: CdkTrapFocus});

  protected readonly popup = inject(ɵWorkbenchPopup);
  protected readonly portal = new ComponentPortal(this.popup.component, this.popup.viewContainerRef, inject(Injector));

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
