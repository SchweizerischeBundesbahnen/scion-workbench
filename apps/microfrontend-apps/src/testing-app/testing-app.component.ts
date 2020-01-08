/*
 * Copyright (c) 2018-2019 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 *  SPDX-License-Identifier: EPL-2.0
 */
import { Component, OnDestroy } from '@angular/core';
import { Beans, ClientConfig, FocusMonitor, MicrofrontendPlatform } from '@scion/microfrontend-platform';
import { ActivatedRoute } from '@angular/router';
import { takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs';

@Component({
  selector: 'testing-app', // tslint:disable-line:component-selector
  templateUrl: './testing-app.component.html',
  styleUrls: ['./testing-app.component.scss'],
})
export class TestingAppComponent implements OnDestroy {

  private _destroy$ = new Subject<void>();

  public appSymbolicName: string;
  public pageTitle: string;
  public location: string;
  public isFocusWithin: boolean;

  constructor() {
    this.appSymbolicName = Beans.get(ClientConfig).symbolicName;
    this.location = window.location.href;

    Beans.get(FocusMonitor).focusWithin$
      .pipe(takeUntil(this._destroy$))
      .subscribe(isFocusWithin => {
        this.isFocusWithin = isFocusWithin;
      });
  }

  public onRouteActivate(route: ActivatedRoute): void {
    this.pageTitle = route.snapshot.data['title'];
  }

  public ngOnDestroy(): void {
    this._destroy$.next();
    MicrofrontendPlatform.destroy().then(); // Platform is started in {@link TestingAppPlatformInitializerResolver}
  }
}
