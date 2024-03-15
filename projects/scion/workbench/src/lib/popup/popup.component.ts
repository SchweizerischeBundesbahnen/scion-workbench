/*
 * Copyright (c) 2018-2022 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 */

import {Component, HostBinding, inject, Injector, OnInit, Provider, ViewChild} from '@angular/core';
import {ɵPopup} from './popup.config';
import {ComponentPortal, PortalModule} from '@angular/cdk/portal';
import {A11yModule, CdkTrapFocus} from '@angular/cdk/a11y';
import {noop} from 'rxjs';
import {SciViewportComponent} from '@scion/components/viewport';
import {GLASS_PANE_BLOCKABLE, GLASS_PANE_OPTIONS, GlassPaneDirective, GlassPaneOptions} from '../glass-pane/glass-pane.directive';

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
  standalone: true,
  imports: [
    A11yModule,
    PortalModule,
    SciViewportComponent,
  ],
  hostDirectives: [
    GlassPaneDirective,
  ],
  providers: [
    configurePopupGlassPane(),
  ],
})
export class PopupComponent implements OnInit {

  public portal: ComponentPortal<any>;

  @ViewChild('focus_trap', {static: true, read: CdkTrapFocus})
  private _cdkTrapFocus!: CdkTrapFocus;

  @HostBinding('style.width')
  public get popupWidth(): string | undefined {
    return this._popup.size?.width;
  }

  @HostBinding('style.min-width')
  public get popupMinWidth(): string | undefined {
    return this._popup.size?.minWidth;
  }

  @HostBinding('style.max-width')
  public get popupMaxWidth(): string | undefined {
    return this._popup.size?.maxWidth;
  }

  @HostBinding('style.height')
  public get popupHeight(): string | undefined {
    return this._popup.size?.height;
  }

  @HostBinding('style.min-height')
  public get popupMinHeight(): string | undefined {
    return this._popup.size?.minHeight;
  }

  @HostBinding('style.max-height')
  public get popupMaxHeight(): string | undefined {
    return this._popup.size?.maxHeight;
  }

  @HostBinding('attr.class')
  public get cssClasses(): string {
    return this._popup.cssClasses.join(' ');
  }

  @HostBinding('attr.data-popupid')
  public get id(): string {
    return this._popup.id;
  }

  constructor(private _popup: ɵPopup, injector: Injector) {
    this.portal = new ComponentPortal(this._popup.component, this._popup.viewContainerRef, injector);
  }

  public ngOnInit(): void {
    // [Angular 14] The initial focus must not be requested via `cdkTrapFocusAutoCapture` as this would restore
    // focus to the previously focused element when the `FocusTrap` is destroyed. This behavior is unwanted if the
    // popup is closed by losing focus. Otherwise, the newly focused element that caused the loss of focus and thus
    // the closing of the popup would immediately become unfocused again. This behavior could only be observed when
    // the popup loses focus by clicking on an element in a microfrontend.
    this._cdkTrapFocus.focusTrap.focusInitialElementWhenReady().then(noop);
  }
}

/**
 * Blocks this popup when dialog(s) overlay it.
 */
function configurePopupGlassPane(): Provider[] {
  return [
    {
      provide: GLASS_PANE_BLOCKABLE,
      useExisting: ɵPopup,
    },
    {
      provide: GLASS_PANE_OPTIONS,
      useFactory: (): GlassPaneOptions => ({attributes: {'data-popupid': inject(ɵPopup).id}}),
    },
  ];
}
