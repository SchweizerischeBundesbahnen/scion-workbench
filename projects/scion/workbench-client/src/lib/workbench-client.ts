/*
 * Copyright (c) 2018-2020 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 *  SPDX-License-Identifier: EPL-2.0
 */

window.addEventListener('beforeunload', () => WorkbenchClient.destroy(), {once: true});

/**
 * **SCION Workbench Client enables integrating a web app as a microfrontend into web apps that have installed the SCION Workbench.**
 */
// @dynamic `ng-packagr` does not support lamdas in statics if `strictMetaDataEmit` is enabled. `ng-packagr` is used to build this library. See https://github.com/ng-packagr/ng-packagr/issues/696#issuecomment-373487183.
export class WorkbenchClient {

  public static async destroy(): Promise<void> {
  }
}
