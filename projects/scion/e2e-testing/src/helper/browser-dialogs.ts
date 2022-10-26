/*
 * Copyright (c) 2018-2022 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 */

import {Dialog as PWDialog, Page} from '@playwright/test';
import {firstValueFrom, timer} from 'rxjs';

/**
 * Captures dialogs opened in the browser and closes them automatically.
 */
export class BrowserDialogs {

  private _dialogs: Dialog[] = [];

  constructor(private _page: Page, private _options?: {confirmDelay?: number}) {
    this._page.on('dialog', this.onDialog);
  }

  public get(): Dialog[] {
    return this._dialogs;
  }

  public dispose(): void {
    this._page.off('dialog', () => this.onDialog);
  }

  private onDialog = async (dialog: PWDialog): Promise<void> => {
    if (this._options?.confirmDelay) {
      await firstValueFrom(timer(this._options.confirmDelay));
    }

    await dialog.accept();
    this._dialogs.push({type: dialog.type() as DialogType, message: dialog.message()});
  };
}

export interface Dialog {
  type: DialogType;
  message: string;
}

/**
 * @see Dialog#type
 */
export type DialogType = 'alert' | 'beforeunload' | 'confirm' | 'prompt';
