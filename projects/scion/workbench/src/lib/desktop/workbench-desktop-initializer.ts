/*
 * Copyright (c) 2018-2022 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 */

import {inject, Injectable} from '@angular/core';
import {NavigationStart, Router} from '@angular/router';
import {first} from 'rxjs/operators';
import {ɵWorkbenchDesktop} from './ɵworkbench-desktop.model';
import {DESKTOP_OUTLET} from '../layout/workbench-layout';
import {hasDesktopNavigation} from '../routing/workbench-route-guards';
import {WorkbenchAuxiliaryRouteInstaller} from '../routing/workbench-auxiliary-route-installer.service';

/**
 * Constructs the workbench desktop handle and registers auxiliary routes.
 */
@Injectable({providedIn: 'root'})
export class WorkbenchDesktopInitializer {

  constructor() {
    inject(ɵWorkbenchDesktop); // Construct the desktop eagerly, otherwise it would miss the first layout change and thus not be initialized correctly.
    const auxiliaryRouteInstaller = inject(WorkbenchAuxiliaryRouteInstaller);
    inject(Router).events
      .pipe(first(event => event instanceof NavigationStart)) // Wait for initial navigation in case routes are registered dynamically during startup.
      .subscribe(() => auxiliaryRouteInstaller.registerAuxiliaryRoutes([DESKTOP_OUTLET], {canMatchNotFoundPage: [hasDesktopNavigation]}));
  }
}
