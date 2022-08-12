/*
 * Copyright (c) 2018-2022 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 */

import {Page} from '@playwright/test';
import {firstValueFrom, timer} from 'rxjs';

/**
 * Installs a handler that automatically accepts displayed browser dialogs.
 */
export function installDialogAutoAcceptHandler(page: Page, options?: {confirmDelay?: number}): BrowserDialogs {
  const browserDialogCollector: BrowserDialogs = new BrowserDialogs();
  page.on('dialog', async dialog => {
    if (options.confirmDelay) {
      await firstValueFrom(timer(options.confirmDelay));
    }

    await dialog.accept();
    browserDialogCollector.add({type: dialog.type() as DialogType, message: dialog.message()});
  });
  return browserDialogCollector;
}

/**
 * Dialogs opened in the browser.
 */
export class BrowserDialogs {
  private _dialogs: Dialog[] = [];

  public add(dialog: Dialog): void {
    this._dialogs.push(dialog);
  }

  public get(): Dialog[] {
    return this._dialogs;
  }
}

export interface Dialog {
  type: DialogType;
  message: string;
}

/**
 * @see Dialog#type
 */
export type DialogType = 'alert' | 'beforeunload' | 'confirm' | 'prompt';
