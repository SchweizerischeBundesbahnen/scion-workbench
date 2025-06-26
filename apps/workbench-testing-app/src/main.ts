/*
 * Copyright (c) 2018-2025 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 */

import {bootstrapApplication} from '@angular/platform-browser';
import {AppComponent} from './app/app.component';
import {appConfig} from './app/app.config';
import {WorkbenchStartupQueryParams} from './app/workbench/workbench-startup-query-params';
import {AppWithGuard} from './app-with-guard/app.config';
import {AppWithRedirect} from './app-with-redirect/app.config';

const {name, params} = parseAppConfig(WorkbenchStartupQueryParams.appConfig());

switch (name) {
  case 'app-with-guard': {
    console.log(`Bootstrapping application: "${WorkbenchStartupQueryParams.appConfig()}"`);
    bootstrapApplication(AppComponent, AppWithGuard.appConfig(params)).catch((err: unknown) => console.error(err));
    break;
  }
  case 'app-with-redirect': {
    console.log(`Bootstrapping application: "${WorkbenchStartupQueryParams.appConfig()}"`);
    bootstrapApplication(AppComponent, AppWithRedirect.appConfig(params)).catch((err: unknown) => console.error(err));
    break;
  }
  default: {
    bootstrapApplication(AppComponent, appConfig).catch((err: unknown) => console.error(err));
  }
}

/**
 * Parses params passed with the app config.
 *
 * Format: `app;param1=value1;param2=value2`
 */
function parseAppConfig(appConfig: string | undefined): {name: string | undefined; params: Record<string, string>} {
  if (!appConfig) {
    return {name: undefined, params: {}};
  }

  const match = /(?<name>[^;]+)(?<params>.+)?/.exec(appConfig);
  const name = match!.groups!['name']!;
  const params = match!.groups!['params'];

  if (!params) {
    return {name, params: {}};
  }

  const parsedParams: Record<string, string> = {};
  for (const match of params.matchAll(/;(?<paramName>[^=;]+)=(?<paramValue>[^;]*)/g)) {
    const {paramName, paramValue} = match.groups!;
    parsedParams[paramName!] = paramValue!;
  }
  return {name, params: parsedParams};
}
