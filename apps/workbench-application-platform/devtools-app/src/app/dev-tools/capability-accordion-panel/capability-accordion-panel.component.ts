/*
 * Copyright (c) 2018-2019 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 *  SPDX-License-Identifier: EPL-2.0
 */

import { ChangeDetectionStrategy, Component, HostBinding, Input, OnChanges, SimpleChanges } from '@angular/core';
import { Application, Capability, ManifestRegistryService } from '@scion/workbench-application.core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

@Component({
  selector: 'app-capability-accordion-panel',
  templateUrl: './capability-accordion-panel.component.html',
  styleUrls: ['./capability-accordion-panel.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CapabilityAccordionPanelComponent implements OnChanges {

  public consumers$: Observable<Application[]>;

  @Input()
  public capability: Capability;

  @HostBinding('class.has-properties')
  public hasProperties: boolean;

  constructor(private _manifestRegistryService: ManifestRegistryService) {
  }

  public ngOnChanges(changes: SimpleChanges): void {
    this.hasProperties = Object.keys(this.capability.properties || {}).length > 0;
    this.consumers$ = this._manifestRegistryService.capabilityConsumers$(this.capability.metadata.id)
      .pipe(map(consumers => [...consumers].sort((c1, c2) => c1.name.localeCompare(c2.name))));
  }
}
