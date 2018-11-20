/*
 * Copyright (c) 2018 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms from the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 *  SPDX-License-Identifier: EPL-2.0
 */

import { $ } from 'protractor';
import { checkCheckbox, switchToIFrameContext } from '../util/testing.util';
import { ActivityActionPO, HostAppPO } from './host-app.po';

export class ActivityActionsPanelPo {

  private _panel = $('app-activity-actions-panel');

  constructor(public iframeContext: string[]) {
  }

  public async checkShowUrlOpenActivityAction(check: boolean): Promise<void> {
    await switchToIFrameContext(this.iframeContext);
    await checkCheckbox(check, this._panel.$('input#show-url-open-activity-action'));
  }

  public async checkCustomActivityAction(check: boolean): Promise<void> {
    await switchToIFrameContext(this.iframeContext);
    await checkCheckbox(check, this._panel.$('input#show-custom-activity-action'));
  }

  public async findUrlOpenActivityAction(): Promise<ActivityActionPO> {
    return new HostAppPO().findActivityAction('e2e-url-open-activity-action');
  }

  public async findCustomActivityAction(): Promise<ActivityActionPO> {
    return new HostAppPO().findActivityAction('e2e-custom-activity-action');
  }
}
