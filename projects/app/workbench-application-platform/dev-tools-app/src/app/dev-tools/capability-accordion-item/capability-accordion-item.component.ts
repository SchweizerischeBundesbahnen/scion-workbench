/*
 * Copyright (c) 2018 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 *  SPDX-License-Identifier: EPL-2.0
 */

import { ChangeDetectionStrategy, ChangeDetectorRef, Component, Input, OnChanges, OnDestroy, SimpleChanges } from '@angular/core';
import { Capability, ManifestRegistryService, PlatformCapabilityTypes, Popup, PopupService, Qualifier } from '@scion/workbench-application.core';
import { map, switchMap, takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs';

@Component({
  selector: 'app-capability-accordion-item',
  templateUrl: './capability-accordion-item.component.html',
  styleUrls: ['./capability-accordion-item.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CapabilityAccordionItemComponent implements OnChanges, OnDestroy {

  private _destroy$ = new Subject<void>();
  private _inputChange$ = new Subject<void>();

  public execQualifier: Qualifier;

  @Input()
  public capability: Capability;

  constructor(private _popupService: PopupService,
              manifestRegistryService: ManifestRegistryService,
              cd: ChangeDetectorRef) {
    this._inputChange$
      .pipe(
        switchMap(() => manifestRegistryService.capabilities$(PlatformCapabilityTypes.Popup, this.createExecQualifier())),
        map((capabilities: Capability[]) => capabilities.length > 0),
        takeUntil(this._destroy$),
      )
      .subscribe((executable: boolean) => {
        this.execQualifier = (executable ? this.createExecQualifier() : null);
        cd.markForCheck();
      });
  }

  public ngOnChanges(changes: SimpleChanges): void {
    this._inputChange$.next();
  }

  public onCapabilityExecute(event: MouseEvent): void {
    if (!this.execQualifier) {
      return;
    }

    event.preventDefault();
    event.stopPropagation();

    const popup: Popup = {
      position: 'west',
      anchor: event.target as Element,
    };

    this._popupService.open(popup, this.execQualifier);
  }

  private createExecQualifier(): Qualifier {
    return {
      entity: 'capability',
      action: 'execute',
      type: this.capability.type,
      capabilityId: this.capability.metadata.id,
    };
  }

  public ngOnDestroy(): void {
    this._destroy$.next();
  }
}
