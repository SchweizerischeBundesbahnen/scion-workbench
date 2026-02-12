/*
 * Copyright (c) 2018-2025 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 */

/**
 * Entry point for all public APIs of this package.
 */
export * from './lib/util/public_api';
export {MultiValueInputComponent} from './lib/multi-value-input/multi-value-input.component';
export {RecordComponent} from './lib/record/record.component';
export {SciKeyValueFieldComponent} from './lib/key-value-field/key-value-field.component';
export {RouterCommandsComponent} from './lib/router-commands/router-commands.component';
export {type RouteDescriptor, type CanMatchWorkbenchCapabilityDescriptor, type CanMatchWorkbenchElementDescriptor} from './lib/routes.model';
