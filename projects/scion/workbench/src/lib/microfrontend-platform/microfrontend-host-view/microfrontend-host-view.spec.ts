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
import {styleFixture, waitUntilStable, waitUntilWorkbenchStarted} from '../../testing/testing.util';
import {provideWorkbenchForTest} from '../../testing/workbench.provider';
import {WorkbenchComponent} from '../../workbench.component';
import {canMatchWorkbenchViewCapability} from '../microfrontend-host/microfrontend-host-routes';
import {WorkbenchViewRegistry} from '../../view/workbench-view.registry';
import {LogLevel} from '../../logging/logging.model';
import {ManifestService} from '@scion/microfrontend-platform';
import {throwError} from '../../common/throw-error.util';
import {WorkbenchView} from '../../view/workbench-view.model';
import {WorkbenchPerspectiveService} from '../../perspective/workbench-perspective.service';
import {WorkbenchCapabilities, WorkbenchPartCapability, WorkbenchRouter as WorkbenchClientRouter, WorkbenchViewCapability} from '@scion/workbench-client';
import {WorkbenchRouter} from '../../routing/workbench-router.service';
import {WorkbenchLayoutFactory} from '../../layout/workbench-layout.factory';

describe('Microfrontend Host View', () => {

  it('should destroy host view when closing view', async () => {
    TestBed.configureTestingModule({
      providers: [
        provideWorkbenchForTest({
          logging: {logLevel: LogLevel.DEBUG},
          microfrontendPlatform: {
            host: {
              manifest: {
                name: 'Host',
              },
            },
            applications: [],
          },
        }),
        provideRouter([
          {path: '', canMatch: [canMatchWorkbenchViewCapability({component: 'view'})], component: SpecViewComponent},
        ]),
      ],
    });

    styleFixture(TestBed.createComponent(WorkbenchComponent));
    await waitUntilWorkbenchStarted();
    spyOn(console, 'debug').and.callThrough();

    const viewCapabilityId = (await TestBed.inject(ManifestService).registerCapability({
      type: WorkbenchCapabilities.View,
      qualifier: {component: 'view'},
      properties: {
        path: '',
      },
    }))!;

    await TestBed.inject(WorkbenchClientRouter).navigate({component: 'view'}, {cssClass: 'testee'});
    const view = getView({cssClass: 'testee'});
    expect(console.debug).toHaveBeenCalledWith(jasmine.stringContaining(`Constructing MicrofrontendHostView [viewId=${view.id}, capabilityId=${viewCapabilityId}]`));

    await view.close();
    expect(console.debug).toHaveBeenCalledWith(jasmine.stringContaining(`Destroying MicrofrontendHostView [viewId=${view.id}, capabilityId=${viewCapabilityId}]`));
  });

  it('should destroy host view when unregistering capability', async () => {
    TestBed.configureTestingModule({
      providers: [
        provideWorkbenchForTest({
          logging: {logLevel: LogLevel.DEBUG},
          microfrontendPlatform: {
            host: {
              manifest: {
                name: 'Host',
              },
            },
            applications: [],
          },
        }),
        provideRouter([
          {path: '', canMatch: [canMatchWorkbenchViewCapability({component: 'view'})], component: SpecViewComponent},
        ]),
      ],
    });

    styleFixture(TestBed.createComponent(WorkbenchComponent));
    await waitUntilWorkbenchStarted();

    const viewCapabilityId = (await TestBed.inject(ManifestService).registerCapability({
      type: WorkbenchCapabilities.View,
      qualifier: {component: 'view'},
      properties: {
        path: '',
      },
    }))!;

    spyOn(console, 'debug').and.callThrough();

    await TestBed.inject(WorkbenchClientRouter).navigate({component: 'view'}, {cssClass: 'testee'});
    const view = getView({cssClass: 'testee'});
    expect(console.debug).toHaveBeenCalledWith(jasmine.stringContaining(`Constructing MicrofrontendHostView [viewId=${view.id}, capabilityId=${viewCapabilityId}]`));

    await TestBed.inject(ManifestService).unregisterCapabilities({id: viewCapabilityId});
    await waitUntilStable();
    expect(console.debug).toHaveBeenCalledWith(jasmine.stringContaining(`Destroying MicrofrontendHostView [viewId=${view.id}, capabilityId=${viewCapabilityId}]`));
  });

  it('should destroy host view when clearing view navigation', async () => {
    TestBed.configureTestingModule({
      providers: [
        provideWorkbenchForTest({
          logging: {logLevel: LogLevel.DEBUG},
          microfrontendPlatform: {
            host: {
              manifest: {
                name: 'Host',
              },
            },
            applications: [],
          },
        }),
        provideRouter([
          {path: '', canMatch: [canMatchWorkbenchViewCapability({component: 'view'})], component: SpecViewComponent},
        ]),
      ],
    });

    styleFixture(TestBed.createComponent(WorkbenchComponent));
    await waitUntilWorkbenchStarted();

    const viewCapabilityId = (await TestBed.inject(ManifestService).registerCapability({
      type: WorkbenchCapabilities.View,
      qualifier: {component: 'view'},
      properties: {
        path: '',
        cssClass: 'testee',
      },
    } satisfies WorkbenchViewCapability))!;

    await TestBed.inject(ManifestService).registerCapability({
      type: WorkbenchCapabilities.Part,
      qualifier: {component: 'part'},
      properties: {
        views: [{
          qualifier: {component: 'view'},
        }],
      },
    } satisfies WorkbenchPartCapability);

    const perspectiveCapabilityId = (await TestBed.inject(ManifestService).registerCapability({
      type: WorkbenchCapabilities.Perspective,
      qualifier: {perspective: 'perspective'},
      properties: {
        parts: [
          {
            id: 'part.1',
            qualifier: {component: 'part'},
          },
        ],
      },
    }))!;

    spyOn(console, 'debug').and.callThrough();

    await TestBed.inject(WorkbenchPerspectiveService).switchPerspective(perspectiveCapabilityId);
    const view = getView({cssClass: 'testee'});
    expect(console.debug).toHaveBeenCalledWith(jasmine.stringContaining(`Constructing MicrofrontendHostView [viewId=${view.id}, capabilityId=${viewCapabilityId}]`));

    // Navigate to new layout with the same viewId to clear navigation of view.
    await TestBed.inject(WorkbenchRouter).navigate(() => TestBed.inject(WorkbenchLayoutFactory).addPart('part.1').addView(view.id, {partId: 'part.1'}));
    expect(console.debug).toHaveBeenCalledWith(jasmine.stringContaining(`Destroying MicrofrontendHostView [viewId=${view.id}, capabilityId=${viewCapabilityId}]`));
  });
});

function getView(locator: {cssClass: string}): WorkbenchView {
  return TestBed.inject(WorkbenchViewRegistry).elements().find(view => view.classList.asList().includes(locator.cssClass)) ?? throwError('[NullViewError]');
}

@Component({
  selector: 'spec-view',
  template: '',
})
class SpecViewComponent {
}
