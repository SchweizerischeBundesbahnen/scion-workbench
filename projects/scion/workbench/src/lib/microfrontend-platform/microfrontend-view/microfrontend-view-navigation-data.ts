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
 * Data passed to the navigation when navigating a microfrontend view.
 */
export interface MicrofrontendViewNavigationData {
  capabilityId: string;
  params: {[name: string]: unknown};
  /**
   * Symbolic name of the application that opened the view.
   */
  referrer: string;
}
