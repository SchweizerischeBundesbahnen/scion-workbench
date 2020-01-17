/*
 * Copyright (c) 2018-2019 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 *  SPDX-License-Identifier: EPL-2.0
 */
import { $, ElementFinder } from 'protractor';
import { SwitchToIframeFn } from '../browser-outlet.po';

export class ConsolePanelPO {

  constructor(private _panelFinder: ElementFinder, private _switchToIframeFn: SwitchToIframeFn) {
  }

  public async open(): Promise<void> {
    await this._switchToIframeFn();

    if (!await this._panelFinder.isPresent()) {
      await $('testing-app').$('span.e2e-console').click();
    }
  }

  public async close(): Promise<void> {
    await this._switchToIframeFn();
    if (await this._panelFinder.isPresent()) {
      await this._panelFinder.$('button.e2e-close').click();
    }
  }

  /**
   * Returns the log displayed in the console.
   *
   * @param filterByType
   *        allows filtering the console logs by type.
   */
  public async getLog(filterByType?: string[]): Promise<ConsoleLog[]> {
    await this._switchToIframeFn();

    const logFinder = this._panelFinder.$('section.e2e-log');
    const timestampColumn: string[] = await logFinder.$$('span.e2e-timestamp').map(cell => cell.getText());
    const typeColumn: string[] = await logFinder.$$('span.e2e-type').map(cell => cell.getText());
    const messageColumn: string[] = await logFinder.$$('span.e2e-message').map(cell => cell.getText());

    const log: ConsoleLog[] = [];
    for (let rowIndex = 0; rowIndex < timestampColumn.length; rowIndex++) {
      const logEntry: ConsoleLog = {
        timestamp: timestampColumn[rowIndex],
        type: typeColumn[rowIndex],
        message: messageColumn[rowIndex],
      };

      if (!filterByType || filterByType.includes(logEntry.type)) {
        log.push(logEntry);
      }
    }
    return log;
  }

  public async clearLog(): Promise<void> {
    await this._switchToIframeFn();
    await this._panelFinder.$('button.e2e-clear').click();
  }
}

export interface ConsoleLog {
  timestamp: string;
  type: string;
  message: string;
}
