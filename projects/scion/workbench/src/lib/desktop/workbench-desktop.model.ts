/*
 * Copyright (c) 2018-2025 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 */
import {Injectable, signal, TemplateRef} from '@angular/core';
import {WbComponentPortal} from '../portal/wb-component-portal';
import {DesktopSlotComponent} from './desktop-slot/desktop-slot.component';

/**
 * A desktop is a visual workbench element for displaying content when the layout is empty (no view and no navigated part).
 */
@Injectable({providedIn: 'root'})
export class WorkbenchDesktop {

  public readonly template = signal<TemplateRef<void> | undefined>(undefined);
  public readonly slot: {portal: WbComponentPortal<DesktopSlotComponent>};

  constructor() {
    this.slot = {portal: this.createPortal()};
  }

  private createPortal(): WbComponentPortal<DesktopSlotComponent> {
    return new WbComponentPortal(DesktopSlotComponent, {
      providers: [
        {provide: WorkbenchDesktop, useValue: this},
      ],
    });
  }
}
