/*
 * Copyright (c) 2018-2026 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 */

import {SciComponentDescriptor} from '@scion/sci-components/common';
import {ComponentType} from '@angular/cdk/portal';

/**
 * Signature of a function to provide icons.
 *
 * An icon provider is a function that returns the component for an icon. The component renders the icon.
 *
 * Alternatively, the icon provider can return a descriptor, allowing for additional configuration such as inputs.
 * Inputs are available as input properties in the component. The component can use the inputs to render the icon.
 *
 * Icon keys used by SCION start with the `scion.` prefix. To not replace built-in icons, the icon provider can
 * return `undefined` for icons starting with the `scion.` prefix.
 *
 * An icon provider can be registered via {@link provideIconProvider} function.
 *
 * The function can call `inject` to get any required dependencies.
 *
 * @param icon - The key of the icon for which to provide the icon component.
 * @return ComponentType or {@link SciComponentDescriptor} to render the icon, or `undefined` if not provided by the icon provider.
 */
export type SciIconProviderFn = (icon: string) => ComponentType<unknown> | SciComponentDescriptor | undefined;
