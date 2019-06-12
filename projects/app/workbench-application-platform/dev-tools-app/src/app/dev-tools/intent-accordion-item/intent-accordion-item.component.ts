/*
 * Copyright (c) 2018-2019 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 *  SPDX-License-Identifier: EPL-2.0
 */

import { ChangeDetectionStrategy, Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { Intent, ManifestRegistryService } from '@scion/workbench-application.core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

@Component({
  selector: 'app-intent-accordion-item',
  templateUrl: './intent-accordion-item.component.html',
  styleUrls: ['./intent-accordion-item.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class IntentAccordionItemComponent implements OnChanges {

  public anyQualifier: boolean;
  public unhandled$: Observable<boolean>;

  @Input()
  public intent: Intent;

  constructor(private _manifestRegistryService: ManifestRegistryService) {
  }

  public ngOnChanges(changes: SimpleChanges): void {
    this.anyQualifier = Object.keys(this.intent.qualifier || {}).includes('*');

    this.unhandled$ = this._manifestRegistryService.capabilityProviders$(this.intent.metadata.id)
      .pipe(map(providers => providers.length === 0));
  }
}
