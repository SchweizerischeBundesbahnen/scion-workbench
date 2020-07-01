/*
 * Copyright (c) 2018-2019 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 *  SPDX-License-Identifier: EPL-2.0
 */

import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { Manifest } from '@scion/workbench-application.core';

@Component({
  selector: 'app-application-list-item',
  templateUrl: './application-list-item.component.html',
  styleUrls: ['./application-list-item.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ApplicationListItemComponent {

  @Input()
  public manifest: Manifest;

  public get intentCount(): number {
    return this.manifest.intents.length;
  }

  public get capabilityCount(): number {
    return this.manifest.capabilities.length;
  }
}
