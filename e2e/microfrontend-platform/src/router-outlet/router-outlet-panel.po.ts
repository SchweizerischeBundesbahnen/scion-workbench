/*
 * Copyright (c) 2018-2019 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 *  SPDX-License-Identifier: EPL-2.0
 */
import { ElementFinder } from 'protractor';
import { SwitchToIframeFn } from '../browser-outlet.po';

export class RouterOutletPanelPO {

  constructor(private _panelFinder: ElementFinder, private _switchToIframeFn: SwitchToIframeFn) {
  }

  public async open(): Promise<void> {
    await this._switchToIframeFn();
    if (await this._panelFinder.$('button.e2e-open').isPresent()) {
      await this._panelFinder.$('button.e2e-open').click();
    }
  }

  public async close(): Promise<void> {
    await this._switchToIframeFn();
    if (await this._panelFinder.$('button.e2e-close').isPresent()) {
      await this._panelFinder.$('button.e2e-close').click();
    }
  }

  public async getActivationLog(): Promise<OutletActivationLogEntry[]> {
    await this._switchToIframeFn();

    const logFinder = this._panelFinder.$('section.e2e-log');
    const timestampColumn: string[] = await logFinder.$$('span.e2e-timestamp').map(cell => cell.getText());
    const typeColumn: ('activate' | 'deactivate')[] = await logFinder.$$('span.e2e-type').map(cell => cell.getText());
    const urlColumn: string[] = await logFinder.$$('span.e2e-url').map(cell => cell.getText());

    const log: OutletActivationLogEntry[] = [];
    for (let rowIndex = 0; rowIndex < timestampColumn.length; rowIndex++) {
      log.push({
        timestamp: timestampColumn[rowIndex],
        type: typeColumn[rowIndex],
        url: urlColumn[rowIndex],
      });
    }

    return log;
  }

  public async clearActivationLog(): Promise<void> {
    await this._switchToIframeFn();
    await this._panelFinder.$('button.e2e-clear').click();
  }
}

export interface OutletActivationLogEntry {
  timestamp: string;
  type: 'activate' | 'deactivate';
  url: string;
}
