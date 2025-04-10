/*
 * Copyright (c) 2018-2023 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 */

export {WorkbenchLauncher} from './workbench-launcher.service';
export {WorkbenchStartup} from './workbench-startup.service';
export {type WorkbenchInitializer, type WorkbenchInitializerFn, provideWorkbenchInitializer, type WorkbenchInitializerOptions, WorkbenchStartupPhase} from './workbench-initializer';
// TODO [Angular 21] Remove from Public API.
export {WORKBENCH_STARTUP, WORKBENCH_PRE_STARTUP, WORKBENCH_POST_STARTUP} from './workbench-initializer';
