/*
 * Copyright (c) 2018-2025 Swiss Federal Railways
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
import {WorkbenchCapabilities} from '@scion/workbench-client';
import {ManifestService} from '@scion/microfrontend-platform';

describe('Workbench Part Capability', () => {

  it('should error if part capability has no qualifier', async () => {
    TestBed.configureTestingModule({
      providers: [
        provideWorkbenchForTest({microfrontendPlatform: {applications: []}}),
      ],
    });
    await TestBed.inject(WorkbenchLauncher).launch();

    const result = TestBed.inject(ManifestService).registerCapability({
      type: WorkbenchCapabilities.Part,
    });
    await expectAsync(result).toBeRejectedWithError(/\[PartDefinitionError] Part capability requires a qualifier/);
  });

  it('should error if part capability has an empty qualifier', async () => {
    TestBed.configureTestingModule({
      providers: [
        provideWorkbenchForTest({microfrontendPlatform: {applications: []}}),
      ],
    });
    await TestBed.inject(WorkbenchLauncher).launch();

    const result = TestBed.inject(ManifestService).registerCapability({
      type: WorkbenchCapabilities.Part,
      qualifier: {},
    });
    await expectAsync(result).toBeRejectedWithError(/\[PartDefinitionError] Part capability requires a qualifier/);
  });

  it('should error if part capability has extras but missing icon property', async () => {
    TestBed.configureTestingModule({
      providers: [
        provideWorkbenchForTest({microfrontendPlatform: {applications: []}}),
      ],
    });
    await TestBed.inject(WorkbenchLauncher).launch();

    const result = TestBed.inject(ManifestService).registerCapability({
      type: WorkbenchCapabilities.Part,
      qualifier: {part: 'testee'},
      properties: {
        extras: {
          label: 'testee',
        },
      },
    });
    await expectAsync(result).toBeRejectedWithError(/\[PartDefinitionError] Missing required 'icon' property in docked part extras /);
  });

  it('should error if part capability has extras but missing label property', async () => {
    TestBed.configureTestingModule({
      providers: [
        provideWorkbenchForTest({microfrontendPlatform: {applications: []}}),
      ],
    });
    await TestBed.inject(WorkbenchLauncher).launch();

    const result = TestBed.inject(ManifestService).registerCapability({
      type: WorkbenchCapabilities.Part,
      qualifier: {part: 'testee'},
      properties: {
        extras: {
          icon: 'testee',
        },
      },
    });
    await expectAsync(result).toBeRejectedWithError(/\[PartDefinitionError] Missing required 'label' property in docked part extras /);
  });

  it('should error if views of part capability have no qualifier', async () => {
    TestBed.configureTestingModule({
      providers: [
        provideWorkbenchForTest({microfrontendPlatform: {applications: []}}),
      ],
    });
    await TestBed.inject(WorkbenchLauncher).launch();

    const result = TestBed.inject(ManifestService).registerCapability({
      type: WorkbenchCapabilities.Part,
      qualifier: {part: 'testee'},
      properties: {
        views: [{}],
      },
    });
    await expectAsync(result).toBeRejectedWithError(/\[PartDefinitionError] Missing required qualifier for view/);
  });

  it('should error if views of part capability have an empty qualifier', async () => {
    TestBed.configureTestingModule({
      providers: [
        provideWorkbenchForTest({microfrontendPlatform: {applications: []}}),
      ],
    });
    await TestBed.inject(WorkbenchLauncher).launch();

    const result = TestBed.inject(ManifestService).registerCapability({
      type: WorkbenchCapabilities.Part,
      qualifier: {part: 'testee'},
      properties: {
        views: [
          {
            qualifier: {},
          },
        ],
      },
    });
    await expectAsync(result).toBeRejectedWithError(/\[PartDefinitionError] Missing required qualifier for view/);
  });

  it('should error if views of part capability contain wildcards in qualifier', async () => {
    TestBed.configureTestingModule({
      providers: [
        provideWorkbenchForTest({microfrontendPlatform: {applications: []}}),
      ],
    });
    await TestBed.inject(WorkbenchLauncher).launch();

    const result = TestBed.inject(ManifestService).registerCapability({
      type: WorkbenchCapabilities.Part,
      qualifier: {part: 'testee'},
      properties: {
        views: [
          {
            qualifier: {view: '*'},
          },
        ],
      },
    });
    await expectAsync(result).toBeRejectedWithError(/\[PartDefinitionError] View qualifier must be explicit and not contain wildcards/);
  });
});
