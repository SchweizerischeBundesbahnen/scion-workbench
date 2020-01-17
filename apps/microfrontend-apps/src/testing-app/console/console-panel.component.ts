/*
 * Copyright (c) 2018-2019 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 *  SPDX-License-Identifier: EPL-2.0
 */
import { ChangeDetectionStrategy, Component, EventEmitter, Output } from '@angular/core';
import { ConsoleService } from './console.service';

@Component({
  selector: 'app-console-panel',
  templateUrl: './console-panel.component.html',
  styleUrls: ['./console-panel.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ConsolePanelComponent {

  @Output()
  public close = new EventEmitter<void>();

  constructor(public consoleService: ConsoleService) {
  }

  public onClearClick(): void {
    this.consoleService.clear();
  }

  public onCloseClick(): void {
    this.close.emit();
  }
}

