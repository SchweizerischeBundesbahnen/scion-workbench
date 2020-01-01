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
import { Beans, ClientConfig, MicrofrontendPlatform } from '@scion/microfrontend-platform';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'testing-app', // tslint:disable-line:component-selector
  templateUrl: './testing-app.component.html',
  styleUrls: ['./testing-app.component.scss'],
})
export class TestingAppComponent implements OnDestroy {

  public appSymbolicName: string;
  public appOrigin: string;
  public pageTitle: string;

  public onRouteActivate(route: ActivatedRoute): void {
    this.pageTitle = route.snapshot.data['title'];
    this.appSymbolicName = Beans.get(ClientConfig).symbolicName;
    this.appOrigin = window.origin;
  }

  public ngOnDestroy(): void {
    MicrofrontendPlatform.destroy().then(); // Platform is started in {@link TestingAppPlatformInitializerResolver}
  }
}
