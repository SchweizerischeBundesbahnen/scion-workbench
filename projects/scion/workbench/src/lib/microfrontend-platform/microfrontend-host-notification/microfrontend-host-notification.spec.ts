/*
 * Copyright (c) 2018-2026 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 */

import {TestBed} from '@angular/core/testing';
import {Component} from '@angular/core';
import {provideRouter} from '@angular/router';
import {waitUntilStable, waitUntilWorkbenchStarted} from '../../testing/testing.util';
import {provideWorkbenchForTest} from '../../testing/workbench.provider';
import {WorkbenchComponent} from '../../workbench.component';
import {WorkbenchCapabilities, WorkbenchNotificationCapability, WorkbenchNotificationService} from '@scion/workbench-client';
import {canMatchWorkbenchNotificationCapability} from '../microfrontend-host/microfrontend-host-routes';
import {WorkbenchNotificationRegistry} from '../../notification/workbench-notification.registry';
import {LogLevel} from '../../logging/logging.model';
import {styleFixture} from '../../testing/testing.util';
import {throwError} from '../../common/throw-error.util';
import {WorkbenchNotification} from '../../notification/workbench-notification.model';

describe('Microfrontend Host Notification', () => {

  it('should destroy host notification when closing notification', async () => {
    TestBed.configureTestingModule({
      providers: [
        provideWorkbenchForTest({
          logging: {logLevel: LogLevel.DEBUG},
          microfrontendPlatform: {
            host: {
              manifest: {
                name: 'Host',
                capabilities: [
                  {
                    type: WorkbenchCapabilities.Notification,
                    qualifier: {component: 'notification'},
                    properties: {
                      path: '',
                    },
                  } satisfies WorkbenchNotificationCapability,
                ],
              },
            },
            applications: [],
          },
        }),
        provideRouter([
          {path: '', canMatch: [canMatchWorkbenchNotificationCapability({component: 'notification'})], component: SpecNotificationComponent},
        ]),
      ],
    });

    styleFixture(TestBed.createComponent(WorkbenchComponent));
    await waitUntilWorkbenchStarted();
    spyOn(console, 'debug').and.callThrough();

    await TestBed.inject(WorkbenchNotificationService).show({component: 'notification'}, {cssClass: 'testee', duration: 'infinite'});

    const notification = getNotification({cssClass: 'testee'});
    expect(console.debug).toHaveBeenCalledWith(jasmine.stringContaining(`Constructing MicrofrontendHostNotification [notificationId=${notification.id}]`));

    notification.close();
    await waitUntilStable();
    expect(console.debug).toHaveBeenCalledWith(jasmine.stringContaining(`Destroying MicrofrontendHostNotification [notificationId=${notification.id}]`));
  });
});

function getNotification(locator: {cssClass: string}): WorkbenchNotification {
  return TestBed.inject(WorkbenchNotificationRegistry).elements().find(notification => notification.cssClass().includes(locator.cssClass)) ?? throwError('[NullNotificationError]');
}

@Component({
  selector: 'spec-notification',
  template: '',
})
class SpecNotificationComponent {
}
