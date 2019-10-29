/*
 * Copyright (c) 2018-2019 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 *  SPDX-License-Identifier: EPL-2.0
 */

import { ChangeDetectionStrategy, ChangeDetectorRef, Component } from '@angular/core';
import { ManifestRegistry } from '../../core/manifest-registry.service';
import { ApplicationRegistry } from '../../core/application-registry.service';
import { Url } from '../../core/url.util';
import { ActivatorCapability, PlatformCapabilityTypes } from '@scion/workbench-application-platform.api';
import { ManifestCollector } from '../../core/manifest-collector.service';

interface Activator {
  appName: string;
  url: string;
}

@Component({
  selector: 'wap-activator-outlet',
  templateUrl: './activator-outlet.component.html',
  styleUrls: ['./activator-outlet.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ActivatorOutletComponent {

  public activators: Activator[] = [];

  constructor(applicationRegistry: ApplicationRegistry,
              manifestCollector: ManifestCollector,
              manifestRegistry: ManifestRegistry,
              cd: ChangeDetectorRef) {
    manifestCollector.whenManifests.then(() => {
      this.activators = manifestRegistry.getCapabilitiesByType<ActivatorCapability>(PlatformCapabilityTypes.Activator)
        .map(activator => {
          const application = applicationRegistry.getApplication(activator.metadata.symbolicAppName);
          const url = Url.createUrl({
            base: application.baseUrl,
            path: Url.toSegments(activator.properties.path),
          });
          return {appName: application.symbolicName, url: url};
        });
      cd.markForCheck();
    });
  }
}
