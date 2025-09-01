/*
 * Copyright (c) 2018-2024 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 */

import {TestBed} from '@angular/core/testing';
import {provideWorkbenchForTest} from '../../testing/workbench.provider';
import {WorkbenchLauncher} from '../../startup/workbench-launcher.service';
import {WorkbenchCapabilities, WorkbenchPerspectiveCapability} from '@scion/workbench-client';
import {ManifestService} from '@scion/microfrontend-platform';

// TODO [activity] Move validation specific aspects to perspective-capability.spec.ts (consistency)
xdescribe('Workbench Perspective', () => {

  it('should error if not having a qualifier', async () => {
    TestBed.configureTestingModule({
      providers: [
        provideWorkbenchForTest({microfrontendPlatform: {applications: []}}),
      ],
    });
    await TestBed.inject(WorkbenchLauncher).launch();

    const result = TestBed.inject(ManifestService).registerCapability({
      type: WorkbenchCapabilities.Perspective,
    });
    await expectAsync(result).toBeRejectedWithError(/\[PerspectiveDefinitionError] Perspective capability requires a qualifier/);
  });

  it('should error if having an empty qualifier', async () => {
    TestBed.configureTestingModule({
      providers: [
        provideWorkbenchForTest({microfrontendPlatform: {applications: []}}),
      ],
    });
    await TestBed.inject(WorkbenchLauncher).launch();

    const result = TestBed.inject(ManifestService).registerCapability({
      type: WorkbenchCapabilities.Perspective,
      qualifier: {},
    });
    await expectAsync(result).toBeRejectedWithError(/\[PerspectiveDefinitionError] Perspective capability requires a qualifier/);
  });

  it('should error if not having properties', async () => {
    TestBed.configureTestingModule({
      providers: [
        provideWorkbenchForTest({microfrontendPlatform: {applications: []}}),
      ],
    });
    await TestBed.inject(WorkbenchLauncher).launch();

    const result = TestBed.inject(ManifestService).registerCapability({
      type: WorkbenchCapabilities.Perspective,
      qualifier: {perspective: 'testee'},
    });
    await expectAsync(result).toBeRejectedWithError(/\[PerspectiveDefinitionError] Perspective capability requires properties/);
  });

  it('should error if not having a layout', async () => {
    TestBed.configureTestingModule({
      providers: [
        provideWorkbenchForTest({microfrontendPlatform: {applications: []}}),
      ],
    });
    await TestBed.inject(WorkbenchLauncher).launch();

    const result = TestBed.inject(ManifestService).registerCapability({
      type: WorkbenchCapabilities.Perspective,
      qualifier: {perspective: 'testee'},
      properties: {},
    });
    await expectAsync(result).toBeRejectedWithError(/NullLayoutError/);
  });

  it('should error if layout has no parts', async () => {
    TestBed.configureTestingModule({
      providers: [
        provideWorkbenchForTest({microfrontendPlatform: {applications: []}}),
      ],
    });
    await TestBed.inject(WorkbenchLauncher).launch();

    const result = TestBed.inject(ManifestService).registerCapability<WorkbenchPerspectiveCapability>({
      type: WorkbenchCapabilities.Perspective,
      qualifier: {perspective: 'testee'},
      properties: {
        parts: [] as unknown as WorkbenchPerspectiveCapability['properties']['parts'],
      },
    });
    await expectAsync(result).toBeRejectedWithError(/NullLayoutError/);
  });

  it('should error if adding views to the main area', async () => {
    TestBed.configureTestingModule({
      providers: [
        provideWorkbenchForTest({microfrontendPlatform: {applications: []}}),
      ],
    });
    await TestBed.inject(WorkbenchLauncher).launch();

    // const result = TestBed.inject(ManifestService).registerCapability<WorkbenchPerspectiveCapability>({
    //   type: WorkbenchCapabilities.Perspective,
    //   qualifier: {perspective: 'testee'},
    //   properties: {
    //     parts: [
    //       {id: MAIN_AREA, views: [{qualifier: {view: 'view'}}]},
    //     ],
    //   },
    // });
    // await expectAsync(result).toBeRejectedWithError(/PerspectiveLayoutError/);
  });

  it('should provide capability on perspective data', async () => {
    TestBed.configureTestingModule({
      providers: [
        provideWorkbenchForTest({microfrontendPlatform: {applications: []}}),
      ],
    });
    await TestBed.inject(WorkbenchLauncher).launch();

    // const perspectiveId = await TestBed.inject(ManifestService).registerCapability<WorkbenchPerspectiveCapability>({
    //   type: WorkbenchCapabilities.Perspective,
    //   qualifier: {name: 'testee'},
    //   properties: {
    //     parts: [
    //       {id: MAIN_AREA},
    //     ],
    //   },
    // });
    //
    // // Expect perspective capability to be set on perspective data.
    // const capability = await lookupCapability(perspectiveId);
    // const perspective = TestBed.inject(WorkbenchService).getPerspective(perspectiveId)!;
    // expect(perspective.data[WorkbenchPerspectiveData.capability]).toEqual(capability);
  });
});

// /**
//  * Looks up a capability using {@link ManifestService}.
//  */
// async function lookupCapability(id: string): Promise<Capability> {
//   return (await firstValueFrom(TestBed.inject(ManifestService).lookupCapabilities$({id})))[0]!;
// }
