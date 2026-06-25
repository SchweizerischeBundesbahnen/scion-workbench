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
import {provideWorkbenchForTest} from '../../testing/workbench.provider';
import {provideRouter} from '@angular/router';
import {Component} from '@angular/core';
import {canMatchWorkbenchPartCapability} from '../microfrontend-host/microfrontend-host-routes';
import {LogLevel} from '../../logging';
import {styleFixture, waitUntilStable, waitUntilWorkbenchStarted} from '../../testing/testing.util';
import {WorkbenchPerspectiveService} from '../../perspective/workbench-perspective.service';
import {ManifestService} from '@scion/microfrontend-platform';
import {MAIN_AREA, WorkbenchPerspectiveCapability, WorkbenchCapabilities} from '@scion/workbench-client';
import {WorkbenchComponent} from '../../workbench.component';
import {WorkbenchRouter} from '../../routing/workbench-router.service';
import {WorkbenchLayoutFactory} from '../../layout/workbench-layout.factory';

describe('Microfrontend Host Part', () => {

  it('should destroy host part when removing part', async () => {
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
          {path: '', loadComponent: () => SpecPartComponent, canMatch: [canMatchWorkbenchPartCapability({component: 'part'})]},
        ]),
      ],
    });

    styleFixture(TestBed.createComponent(WorkbenchComponent));
    await waitUntilWorkbenchStarted();

    const partCapabilityId = (await TestBed.inject(ManifestService).registerCapability({
      type: WorkbenchCapabilities.Part,
      qualifier: {component: 'part'},
      properties: {
        path: '',
      },
    }))!;

    await TestBed.inject(ManifestService).registerCapability({
      type: WorkbenchCapabilities.Part,
      qualifier: {component: 'main-area'},
    });

    const perspectiveCapabilityId = (await TestBed.inject(ManifestService).registerCapability({
      type: WorkbenchCapabilities.Perspective,
      qualifier: {perspective: 'perspective'},
      properties: {
        parts: [
          {
            id: MAIN_AREA,
            qualifier: {component: 'main-area'},
          },
          {
            id: 'part.1',
            qualifier: {component: 'part'},
            position: {align: 'left'},
          },
        ],
      },
    } satisfies WorkbenchPerspectiveCapability))!;

    spyOn(console, 'debug').and.callThrough();
    await TestBed.inject(WorkbenchPerspectiveService).switchPerspective(perspectiveCapabilityId);
    expect(console.debug).toHaveBeenCalledWith(jasmine.stringContaining(`Constructing MicrofrontendHostPart [partId=part.1, capabilityId=${partCapabilityId}]`));

    await TestBed.inject(WorkbenchRouter).navigate(layout => layout.removePart('part.1'));
    expect(console.debug).toHaveBeenCalledWith(jasmine.stringContaining(`Destroying MicrofrontendHostPart [partId=part.1, capabilityId=${partCapabilityId}]`));
  });

  it('should destroy host part when unregistering part capability', async () => {
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
          {path: '', loadComponent: () => SpecPartComponent, canMatch: [canMatchWorkbenchPartCapability({component: 'part'})]},
        ]),
      ],
    });

    styleFixture(TestBed.createComponent(WorkbenchComponent));
    await waitUntilWorkbenchStarted();

    const partCapabilityId = (await TestBed.inject(ManifestService).registerCapability({
      type: WorkbenchCapabilities.Part,
      qualifier: {component: 'part'},
      properties: {
        path: '',
      },
    }))!;

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

    expect(console.debug).toHaveBeenCalledWith(jasmine.stringContaining(`Constructing MicrofrontendHostPart [partId=part.1, capabilityId=${partCapabilityId}]`));

    await TestBed.inject(ManifestService).unregisterCapabilities({id: partCapabilityId});
    await waitUntilStable();

    expect(console.debug).toHaveBeenCalledWith(jasmine.stringContaining(`Destroying MicrofrontendHostPart [partId=part.1, capabilityId=${partCapabilityId}]`));
  });

  it('should destroy host part when clearing part navigation', async () => {
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
          {path: '', loadComponent: () => SpecPartComponent, canMatch: [canMatchWorkbenchPartCapability({component: 'part'})]},
        ]),
      ],
    });

    styleFixture(TestBed.createComponent(WorkbenchComponent));
    await waitUntilWorkbenchStarted();

    const partCapabilityId = (await TestBed.inject(ManifestService).registerCapability({
      type: WorkbenchCapabilities.Part,
      qualifier: {component: 'part'},
      properties: {
        path: '',
      },
    }))!;

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
    expect(console.debug).toHaveBeenCalledWith(jasmine.stringContaining(`Constructing MicrofrontendHostPart [partId=part.1, capabilityId=${partCapabilityId}]`));

    // Navigate to new layout with the same partId to clear navigation of part.
    await TestBed.inject(WorkbenchRouter).navigate(() => TestBed.inject(WorkbenchLayoutFactory).addPart('part.1'));
    expect(console.debug).toHaveBeenCalledWith(jasmine.stringContaining(`Destroying MicrofrontendHostPart [partId=part.1, capabilityId=${partCapabilityId}]`));
  });
});

@Component({template: ''})
class SpecPartComponent {}
