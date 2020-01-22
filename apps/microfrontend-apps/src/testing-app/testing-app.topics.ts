/*
 * Copyright (c) 2018-2019 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 *  SPDX-License-Identifier: EPL-2.0
 */

/**
 * Declares topics of the testing app.
 */
export enum TestingAppTopics {
  /**
   * Activators send an activation event to this topic when activated.
   * The events are then logged in the console of the top-level app.
   */
  ApplicationActivated = 'APPLICATION_ACTIVATED',
}
