/*
 * Copyright (c) 2018-2019 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 *  SPDX-License-Identifier: EPL-2.0
 */
import { ChangeDetectionStrategy, Component, EventEmitter, HostBinding, Input, Output } from '@angular/core';

@Component({
  selector: 'app-router-outlet-panel',
  templateUrl: './router-outlet-panel.component.html',
  styleUrls: ['./router-outlet-panel.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RouterOutletPanelComponent {

  @HostBinding('class.open')
  public panelOpen = false;

  @Input()
  public activationLog: OutletActivationLogEntry[];

  @Output()
  public clearLog = new EventEmitter<void>();

  public onLogClearClick(): void {
    this.clearLog.emit();
  }

  public onPanelOpen(): void {
    this.panelOpen = true;
  }

  public onPanelCloseClick(): void {
    this.panelOpen = false;
  }
}

export interface OutletActivationLogEntry {
  timestamp: number;
  type: 'activate' | 'deactivate';
  url: string;
}
