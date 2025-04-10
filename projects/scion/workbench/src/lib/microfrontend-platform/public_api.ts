/*
 * Copyright (c) 2018-2023 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 */

export {MicrofrontendPlatformConfigLoader} from './microfrontend-platform-config-loader';
export {WorkbenchPerspectiveData} from './microfrontend-perspective/workbench-perspective-data';
export {provideMicrofrontendPlatformInitializer, type MicrofrontendPlatformInitializerOptions, MicrofrontendPlatformStartupPhase} from './microfrontend-platform-initializer.provider';
// TODO [Angular 21] Remove from Public API.
export {MICROFRONTEND_PLATFORM_PRE_STARTUP, MICROFRONTEND_PLATFORM_POST_STARTUP} from './microfrontend-platform-initializer.provider';
export * from './microfrontend-platform.config';
