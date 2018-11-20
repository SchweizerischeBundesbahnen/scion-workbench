/*
 * Copyright (c) 2018 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 *  SPDX-License-Identifier: EPL-2.0
 */

import { ChangeDetectionStrategy, Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { Application, Intent, ManifestRegistryService } from '@scion/workbench-application.core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

@Component({
  selector: 'app-intent-accordion-panel',
  templateUrl: './intent-accordion-panel.component.html',
  styleUrls: ['./intent-accordion-panel.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class IntentAccordionPanelComponent implements OnChanges {

  public anyQualifier: boolean;
  public providers$: Observable<Application[]>;

  @Input()
  public intent: Intent;

  constructor(private _manifestRegistryService: ManifestRegistryService) {
  }

  public ngOnChanges(changes: SimpleChanges): void {
    this.anyQualifier = Object.keys(this.intent.qualifier || {}).includes('*');
    this.providers$ = this._manifestRegistryService.capabilityProviders$(this.intent.metadata.id)
      .pipe(map(providers => [...providers].sort((p1, p2) => p1.name.localeCompare(p2.name))));
  }
}
