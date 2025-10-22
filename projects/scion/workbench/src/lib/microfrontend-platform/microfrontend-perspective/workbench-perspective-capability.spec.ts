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
import {Capability, ManifestService} from '@scion/microfrontend-platform';
import {firstValueFrom} from 'rxjs';
import {WorkbenchService} from '../../workbench.service';
import {WorkbenchPerspectiveData} from './workbench-perspective-data';
import {MAIN_AREA} from '../../layout/workbench-layout';

describe('Workbench Perspective Capability', () => {

  it('should error if perspective capability has no qualifier', async () => {
    TestBed.configureTestingModule({
      providers: [
        provideWorkbenchForTest({microfrontendPlatform: {applications: []}}),
      ],
    });
    await TestBed.inject(WorkbenchLauncher).launch();

    const result = TestBed.inject(ManifestService).registerCapability({
      type: WorkbenchCapabilities.Perspective,
      // missing qualifier
      properties: {
        parts: [
          {
            id: MAIN_AREA,
            qualifier: {part: 'main-area'},
          },
        ],
      },
    });
    await expectAsync(result).toBeRejectedWithError(/\[PerspectiveDefinitionError] Perspective capability requires a qualifier/);
  });

  it('should error if perspective capability has an empty qualifier', async () => {
    TestBed.configureTestingModule({
      providers: [
        provideWorkbenchForTest({microfrontendPlatform: {applications: []}}),
      ],
    });
    await TestBed.inject(WorkbenchLauncher).launch();

    const result = TestBed.inject(ManifestService).registerCapability({
      type: WorkbenchCapabilities.Perspective,
      qualifier: {}, // invalid qualifier
      properties: {
        parts: [
          {
            id: MAIN_AREA,
            qualifier: {part: 'main-area'},
          },
        ],
      },
    });
    await expectAsync(result).toBeRejectedWithError(/\[PerspectiveDefinitionError] Perspective capability requires a qualifier/);
  });

  it('should error if perspective capability has no properties', async () => {
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

  it('should error if perspective capability has no parts', async () => {
    TestBed.configureTestingModule({
      providers: [
        provideWorkbenchForTest({microfrontendPlatform: {applications: []}}),
      ],
    });
    await TestBed.inject(WorkbenchLauncher).launch();

    const result = TestBed.inject(ManifestService).registerCapability({
      type: WorkbenchCapabilities.Perspective,
      qualifier: {perspective: 'testee'},
      properties: {
        // missing parts
      },
    });
    await expectAsync(result).toBeRejectedWithError(/\[PerspectiveDefinitionError] Perspective capability requires the 'parts' property/);
  });

  it('should error if perspective capability parts have no id', async () => {
    TestBed.configureTestingModule({
      providers: [
        provideWorkbenchForTest({microfrontendPlatform: {applications: []}}),
      ],
    });
    await TestBed.inject(WorkbenchLauncher).launch();

    const result = TestBed.inject(ManifestService).registerCapability({
      type: WorkbenchCapabilities.Perspective,
      qualifier: {perspective: 'testee'},
      properties: {
        parts: [
          {
            id: 'testee-1',
            qualifier: {part: 'testee-1'},
          },
          {
            // missing id
            qualifier: {part: 'testee-2'},
            position: 'left-top',
          },
          {
            id: 'testee-3',
            qualifier: {part: 'testee-3'},
            position: 'left-top',
          },
        ],
      },
    });
    await expectAsync(result).toBeRejectedWithError(/\[PerspectiveDefinitionError] Missing required 'id' property of part at index '1'/);
  });

  it('should error if perspective capability does not have unique part ids', async () => {
    TestBed.configureTestingModule({
      providers: [
        provideWorkbenchForTest({microfrontendPlatform: {applications: []}}),
      ],
    });
    await TestBed.inject(WorkbenchLauncher).launch();

    const result = TestBed.inject(ManifestService).registerCapability({
      type: WorkbenchCapabilities.Perspective,
      qualifier: {perspective: 'testee'},
      properties: {
        parts: [
          {
            id: 'testee',
            qualifier: {part: 'testee-1'},
          },
          {
            id: 'testee',
            qualifier: {part: 'testee-2'},
            position: 'left-top',
          },
        ],
      },
    });
    await expectAsync(result).toBeRejectedWithError(/\[PerspectiveDefinitionError] Parts of perspective must have a unique id/);
  });

  it('should error if perspective capability does not have an initial part', async () => {
    TestBed.configureTestingModule({
      providers: [
        provideWorkbenchForTest({microfrontendPlatform: {applications: []}}),
      ],
    });
    await TestBed.inject(WorkbenchLauncher).launch();

    const result = TestBed.inject(ManifestService).registerCapability({
      type: WorkbenchCapabilities.Perspective,
      qualifier: {perspective: 'testee'},
      properties: {
        parts: [],
      },
    });
    await expectAsync(result).toBeRejectedWithError(/\[PerspectiveDefinitionError] Perspective capability requires an initial part/);
  });

  it('should error if initial part of perspective capability is positioned (docked)', async () => {
    TestBed.configureTestingModule({
      providers: [
        provideWorkbenchForTest({microfrontendPlatform: {applications: []}}),
      ],
    });
    await TestBed.inject(WorkbenchLauncher).launch();

    const result = TestBed.inject(ManifestService).registerCapability({
      type: WorkbenchCapabilities.Perspective,
      qualifier: {perspective: 'testee'},
      properties: {
        parts: [
          {
            id: 'testee',
            qualifier: {part: 'testee'},
            position: 'left-top',
          },
        ],
      },
    });
    await expectAsync(result).toBeRejectedWithError(/\[PerspectiveDefinitionError] Initial part 'testee' of perspective must not have the 'position' property/);
  });

  it('should error if initial part of perspective capability is positioned (aligned)', async () => {
    TestBed.configureTestingModule({
      providers: [
        provideWorkbenchForTest({microfrontendPlatform: {applications: []}}),
      ],
    });
    await TestBed.inject(WorkbenchLauncher).launch();

    const result = TestBed.inject(ManifestService).registerCapability({
      type: WorkbenchCapabilities.Perspective,
      qualifier: {perspective: 'testee'},
      properties: {
        parts: [
          {
            id: 'testee',
            qualifier: {part: 'testee'},
            position: {align: 'left'},
          },
        ],
      },
    });
    await expectAsync(result).toBeRejectedWithError(/\[PerspectiveDefinitionError] Initial part 'testee' of perspective must not have the 'position' property/);
  });

  it('should error if other parts of perspective capability are not positioned', async () => {
    TestBed.configureTestingModule({
      providers: [
        provideWorkbenchForTest({microfrontendPlatform: {applications: []}}),
      ],
    });
    await TestBed.inject(WorkbenchLauncher).launch();

    const result = TestBed.inject(ManifestService).registerCapability({
      type: WorkbenchCapabilities.Perspective,
      qualifier: {perspective: 'testee'},
      properties: {
        parts: [
          {
            id: 'initial',
            qualifier: {part: 'initial'},
          },
          {
            id: 'testee',
            qualifier: {part: 'testee'},
            // missing position
          },
        ],
      },
    });
    await expectAsync(result).toBeRejectedWithError(/\[PerspectiveDefinitionError] Missing required 'position' property in part 'testee'/);
  });

  it('should error if docked parts of perspective capability have an illegal position', async () => {
    TestBed.configureTestingModule({
      providers: [
        provideWorkbenchForTest({microfrontendPlatform: {applications: []}}),
      ],
    });
    await TestBed.inject(WorkbenchLauncher).launch();

    const result = TestBed.inject(ManifestService).registerCapability({
      type: WorkbenchCapabilities.Perspective,
      qualifier: {perspective: 'testee'},
      properties: {
        parts: [
          {
            id: 'initial',
            qualifier: {part: 'initial'},
          },
          {
            id: 'testee',
            qualifier: {part: 'testee'},
            position: 'illegal-docking-area', // illegal position
          },
        ],
      },
    });
    await expectAsync(result).toBeRejectedWithError(/\[PerspectiveDefinitionError] Illegal position in docked part 'testee': 'illegal-docking-area'./);
  });

  it('should error if parts of perspective capability are missing align property', async () => {
    TestBed.configureTestingModule({
      providers: [
        provideWorkbenchForTest({microfrontendPlatform: {applications: []}}),
      ],
    });
    await TestBed.inject(WorkbenchLauncher).launch();

    const result = TestBed.inject(ManifestService).registerCapability({
      type: WorkbenchCapabilities.Perspective,
      qualifier: {perspective: 'testee'},
      properties: {
        parts: [
          {
            id: 'initial',
            qualifier: {part: 'initial'},
          },
          {
            id: 'testee',
            qualifier: {part: 'testee'},
            position: {
              // missing align
            },
          },
        ],
      },
    });
    await expectAsync(result).toBeRejectedWithError(/\[PerspectiveDefinitionError] Missing required 'align' property in part 'testee'/);
  });

  it('should error if aligned parts of perspective capability have an illegal alignment', async () => {
    TestBed.configureTestingModule({
      providers: [
        provideWorkbenchForTest({microfrontendPlatform: {applications: []}}),
      ],
    });
    await TestBed.inject(WorkbenchLauncher).launch();

    const result = TestBed.inject(ManifestService).registerCapability({
      type: WorkbenchCapabilities.Perspective,
      qualifier: {perspective: 'testee'},
      properties: {
        parts: [
          {
            id: 'initial',
            qualifier: {part: 'initial'},
          },
          {
            id: 'testee',
            qualifier: {part: 'testee'},
            position: {
              align: 'illegal-alignment', // illegal position
            },
          },
        ],
      },
    });
    await expectAsync(result).toBeRejectedWithError(/\[PerspectiveDefinitionError] Illegal alignment of part 'testee': 'illegal-alignment'/);
  });

  it('should error if parts of perspective capability reference an illegal part', async () => {
    TestBed.configureTestingModule({
      providers: [
        provideWorkbenchForTest({microfrontendPlatform: {applications: []}}),
      ],
    });
    await TestBed.inject(WorkbenchLauncher).launch();

    const result = TestBed.inject(ManifestService).registerCapability({
      type: WorkbenchCapabilities.Perspective,
      qualifier: {perspective: 'testee'},
      properties: {
        parts: [
          {
            id: 'initial',
            qualifier: {part: 'initial'},
          },
          {
            id: 'testee',
            qualifier: {part: 'testee'},
            position: {
              align: 'left',
              relativeTo: 'illegal-part', // illegal part
            },
          },
        ],
      },
    });
    await expectAsync(result).toBeRejectedWithError(/\[PerspectiveDefinitionError] Illegal part 'illegal-part' referenced in 'relativeTo' of part 'testee'. Part not found./);
  });

  it('should error if parts of perspective capability have no qualifier', async () => {
    TestBed.configureTestingModule({
      providers: [
        provideWorkbenchForTest({microfrontendPlatform: {applications: []}}),
      ],
    });
    await TestBed.inject(WorkbenchLauncher).launch();

    const result = TestBed.inject(ManifestService).registerCapability({
      type: WorkbenchCapabilities.Perspective,
      qualifier: {perspective: 'testee'},
      properties: {
        parts: [
          {
            id: 'testee',
            // missing qualifier
          },
        ],
      },
    });
    await expectAsync(result).toBeRejectedWithError(/\[PerspectiveDefinitionError] Missing required qualifier for part 'testee'/);
  });

  it('should error if parts of perspective capability have an empty qualifier', async () => {
    TestBed.configureTestingModule({
      providers: [
        provideWorkbenchForTest({microfrontendPlatform: {applications: []}}),
      ],
    });
    await TestBed.inject(WorkbenchLauncher).launch();

    const result = TestBed.inject(ManifestService).registerCapability({
      type: WorkbenchCapabilities.Perspective,
      qualifier: {perspective: 'testee'},
      properties: {
        parts: [
          {
            id: 'testee',
            qualifier: {},
          },
        ],
      },
    });
    await expectAsync(result).toBeRejectedWithError(/\[PerspectiveDefinitionError] Missing required qualifier for part 'testee'/);
  });

  it('should error if parts of perspective capability contain wildcards in qualifier', async () => {
    TestBed.configureTestingModule({
      providers: [
        provideWorkbenchForTest({microfrontendPlatform: {applications: []}}),
      ],
    });
    await TestBed.inject(WorkbenchLauncher).launch();

    const result = TestBed.inject(ManifestService).registerCapability({
      type: WorkbenchCapabilities.Perspective,
      qualifier: {perspective: 'testee'},
      properties: {
        parts: [
          {
            id: 'testee',
            qualifier: {part: '*'},
          },
        ],
      },
    });
    await expectAsync(result).toBeRejectedWithError(/\[PerspectiveDefinitionError] Qualifier for part 'testee' must be explicit and not contain wildcards/);
  });

  it('should provide capability in perspective data', async () => {
    TestBed.configureTestingModule({
      providers: [
        provideWorkbenchForTest({microfrontendPlatform: {applications: []}}),
      ],
    });
    await TestBed.inject(WorkbenchLauncher).launch();

    const perspectiveId = await TestBed.inject(ManifestService).registerCapability({
      type: WorkbenchCapabilities.Perspective,
      qualifier: {name: 'testee'},
      properties: {
        parts: [
          {
            id: 'initial',
            qualifier: {part: 'initial'},
          },
        ],
      },
    });

    // Expect perspective capability to be set on perspective data.
    const capability = await lookupCapability(perspectiveId);
    const perspective = TestBed.inject(WorkbenchService).getPerspective(perspectiveId)!;
    expect(perspective.data[WorkbenchPerspectiveData.capability]).toEqual(capability);
  });
});

/**
 * Looks up a capability using {@link ManifestService}.
 */
async function lookupCapability(id: string): Promise<Capability> {
  return (await firstValueFrom(TestBed.inject(ManifestService).lookupCapabilities$({id})))[0]!;
}
