/*
 * Copyright (c) 2018-2022 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 */

import {bootstrapApplication} from '@angular/platform-browser';
import {App} from './app/app.component';
import {appConfig} from './app/app.config';

bootstrapApplication(App, appConfig).catch((err: unknown) => console.error(err));
