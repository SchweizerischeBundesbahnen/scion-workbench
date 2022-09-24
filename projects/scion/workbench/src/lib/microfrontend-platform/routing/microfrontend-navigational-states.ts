/*
 * Copyright (c) 2018-2022 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 */

/**
 * Keys for associating microfrontend-specific data with a navigation.
 *
 * State can be read from {@link ActivatedRoute.data} using the {@link WorkbenchRouteData.state} key.
 */
export namespace MicrofrontendNavigationalStates {
  /**
   * Key for associating transient parameters with a navigation.
   */
  export const transientParams = 'ɵtransientParams';
}