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
 * Information about the context in which a popup was opened.
 *
 * @category Popup
 */
export interface WorkbenchPopupReferrer {
  /**
   * Identity of the view if opened in the context of a view.
   */
  viewId?: string;
  /**
   * Identity of the view capability if opened in the context of a view microfrontend.
   */
  viewCapabilityId?: string;
}
