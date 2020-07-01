/*
 * Copyright (c) 2018-2019 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 *  SPDX-License-Identifier: EPL-2.0
 */

import { Component, ElementRef, OnDestroy, ViewChild } from '@angular/core';
import { provideWorkbenchView, WorkbenchView } from '@scion/workbench-application.angular';
import { ActivatedRoute } from '@angular/router';
import { BehaviorSubject, combineLatest, Observable, of, OperatorFunction, Subject } from 'rxjs';
import { distinctUntilChanged, filter, map, switchMap, takeUntil, tap } from 'rxjs/operators';
import { Capability, Intent, Manifest, ManifestRegistryService, NotificationService } from '@scion/workbench-application.core';
import { toFilterRegExp } from 'app-common';

@Component({
  selector: 'app-application-view',
  templateUrl: './application-view.component.html',
  styleUrls: ['./application-view.component.scss'],
  providers: [
    provideWorkbenchView(ApplicationViewComponent),
  ],
})
export class ApplicationViewComponent implements OnDestroy {

  private _destroy$ = new Subject<void>();

  public manifest: Manifest;
  public capabilities$: Observable<Capability[]>;
  public intents$: Observable<Intent[]>;

  public sashPositionFr = .5;

  private _capabilityFilter$ = new BehaviorSubject<string>(null);
  private _intentFilter$ = new BehaviorSubject<string>(null);

  @ViewChild('sashbox', {static: true})
  private _sashbox: ElementRef<HTMLElement>;

  constructor(route: ActivatedRoute,
              notificationService: NotificationService,
              view: WorkbenchView,
              private _manifestRegistryService: ManifestRegistryService) {
    route.params
      .pipe(
        map(params => params['symbolicName']),
        distinctUntilChanged(),
        switchMap(symbolicName => this._manifestRegistryService.manifest$(symbolicName)),
        tap(manifest => !manifest && notificationService.notify({
          severity: 'error',
          title: 'Application not found',
          text: `No application found with given symbolic name '${route.snapshot.params['symbolicName']}'`,
        })),
        filter(Boolean),
        takeUntil(this._destroy$),
      )
      .subscribe((manifest: Manifest) => {
        const capabilities: Capability[] = [...manifest.capabilities].sort((c1, c2) => c1.type.localeCompare(c2.type));
        const intents: Intent[] = [...manifest.intents].sort((i1, it2) => i1.type.localeCompare(it2.type));

        view.title = manifest.name;
        view.heading = 'Application Manifest';

        this.manifest = manifest;
        this.capabilities$ = combineLatest([this._capabilityFilter$, of(capabilities)]).pipe(filterCapabilities());
        this.intents$ = combineLatest([this._intentFilter$, of(intents)]).pipe(filterIntents());
      });
  }

  public onSash(deltaPx: number): void {
    const sashboxHeightPx = this._sashbox.nativeElement.clientHeight;
    const sashPositionFr = this.sashPositionFr + (deltaPx / sashboxHeightPx);
    this.sashPositionFr = Math.min(1, Math.max(0, sashPositionFr));
  }

  public onCapabilityFilter(filterText: string): void {
    this._capabilityFilter$.next(filterText);
  }

  public onIntentFilter(filterText: string): void {
    this._intentFilter$.next(filterText);
  }

  public onSashReset(): void {
    this.sashPositionFr = .5;
  }

  public ngOnDestroy(): void {
    this._destroy$.next();
  }
}

function filterCapabilities(): OperatorFunction<[string, Capability[]], Capability[]> {
  return map(([filterText, capabilities]: [string, Capability[]]): Capability[] => {
    if (!filterText) {
      return capabilities;
    }

    const filterRegExp = toFilterRegExp(filterText);
    return capabilities.filter(capability => (
      filterRegExp.test(capability.type) ||
      filterRegExp.test(capability.private ? 'private' : 'public') ||
      Object.keys(capability.qualifier || {}).some(key => filterRegExp.test(key)) ||
      Object.values(capability.qualifier || {}).some(value => filterRegExp.test(`${value}`))),
    );
  });
}

function filterIntents(): OperatorFunction<[string, Intent[]], Intent[]> {
  return map(([filterText, intents]: [string, Intent[]]): Intent[] => {
    if (!filterText) {
      return intents;
    }

    const filterRegExp = toFilterRegExp(filterText);
    return intents.filter(intent => (
      filterRegExp.test(intent.type) ||
      filterRegExp.test(intent.metadata.implicit ? 'implicit' : 'explicit') ||
      Object.keys(intent.qualifier || {}).some(key => filterRegExp.test(key)) ||
      Object.values(intent.qualifier || {}).some(value => filterRegExp.test(`${value}`))),
    );
  });
}
