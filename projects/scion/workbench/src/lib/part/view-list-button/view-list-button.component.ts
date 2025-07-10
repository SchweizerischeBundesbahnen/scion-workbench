/*
 * Copyright (c) 2018-2023 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 */

import {Component, computed, DestroyRef, ElementRef, HostListener, inject, Injector, signal, Signal} from '@angular/core';
import {ConnectedPosition, Overlay, OverlayConfig, OverlayRef} from '@angular/cdk/overlay';
import {ComponentPortal} from '@angular/cdk/portal';
import {ViewListComponent} from '../view-list/view-list.component';
import {WorkbenchPart} from '../workbench-part.model';
import {IconComponent} from '../../icon/icon.component';

@Component({
  selector: 'wb-view-list-button',
  templateUrl: './view-list-button.component.html',
  styleUrls: ['./view-list-button.component.scss'],
  host: {
    '[class.menu-open]': `menuState() === 'open'`,
    '[attr.tabindex]': '0',
  },
  imports: [
    IconComponent,
  ],
})
export class ViewListButtonComponent {

  private static readonly SOUTH: ConnectedPosition = {originX: 'end', originY: 'bottom', overlayX: 'end', overlayY: 'top', panelClass: 'wb-south'};
  private static readonly NORTH: ConnectedPosition = {originX: 'end', originY: 'top', overlayX: 'end', overlayY: 'bottom', panelClass: 'wb-north'};

  private readonly _host = inject(ElementRef);
  private readonly _overlay = inject(Overlay);
  private readonly _injector = inject(Injector);
  private readonly _destroyRef = inject(DestroyRef);

  /** Number of views that are scrolled out of the tab bar. */
  protected readonly scrolledOutOfViewTabCount: Signal<number>;
  protected readonly menuState = signal<'open' | 'closed'>('closed');

  constructor() {
    const part = inject(WorkbenchPart);
    this.scrolledOutOfViewTabCount = computed(() => part.views().reduce((count, view) => view.scrolledIntoView() ? count : count + 1, 0));
  }

  @HostListener('click')
  @HostListener('keydown.enter')
  @HostListener('keydown.space')
  protected onClick(): void {
    this.menuState.set('open');
    void this.openMenu().finally(() => this.menuState.set('closed'));
  }

  private openMenu(): Promise<void> {
    const positionStrategy = this._overlay.position()
      .flexibleConnectedTo(this._host)
      .withFlexibleDimensions(false)
      .withPositions([ViewListButtonComponent.SOUTH, ViewListButtonComponent.NORTH]);

    const overlayRef = this._overlay.create(new OverlayConfig({
      scrollStrategy: this._overlay.scrollStrategies.noop(),
      disposeOnNavigation: true,
      panelClass: 'wb-view-list-menu',
      positionStrategy,
    }));

    const componentRef = overlayRef.attach(new ComponentPortal(ViewListComponent, null, Injector.create({
      parent: this._injector,
      providers: [{provide: OverlayRef, useValue: overlayRef}],
    })));

    this._destroyRef.onDestroy(() => overlayRef.dispose());
    return new Promise<void>(resolve => componentRef.onDestroy(resolve));
  }
}
