/*
 * Copyright (c) 2018-2026 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 */

import {Injectable, isDevMode} from '@angular/core';
import {environment} from '../environments/environment';
import {renderingFlag} from './rendering-flag';

/**
 * Provides settings for the workbench testing application.
 */
@Injectable({providedIn: 'root'})
export class Settings {

  public readonly resetFormsOnSubmit = renderingFlag<boolean>('scion.workbench.testing-app.settings.reset-forms-on-submit', true);
  public readonly highlightFocus = renderingFlag<boolean>('scion.workbench.testing-app.settings.highlight-focus', false);
  public readonly highlightGlasspane = renderingFlag<boolean>('scion.workbench.testing-app.settings.highlight-glasspane', false);
  public readonly showMicrofrontendApplicationLabels = renderingFlag<boolean>('scion.workbench.testing-app.settings.show-microfrontend-application-labels', environment.showMicrofrontendApplicationLabels);
  public readonly logAngularChangeDetectionCycles = renderingFlag<boolean>('scion.workbench.testing-app.settings.log-angular-change-detection-cycles', environment.logAngularChangeDetectionCycles);
  public readonly showSkeletons = renderingFlag<boolean>('scion.workbench.testing-app.settings.show-skeletons', !isDevMode());
  public readonly showTestPerspectives = renderingFlag<boolean>('scion.workbench.testing-app.settings.show-test-perspectives', isDevMode());
}
