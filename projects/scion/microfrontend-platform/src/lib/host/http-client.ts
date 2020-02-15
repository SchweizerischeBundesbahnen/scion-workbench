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
 * Uses the native Web Fetch API to fetch a resource from the network.
 *
 * @see https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API
 * @ignore
 */
export class HttpClient {

  /**
   * Allows fetching a resource from the network, returning a promise which is fulfilled once the response is available. The promise resolves
   * to the Response object representing the response to your request. The promise does not reject on HTTP errors — instead it only rejects on
   * network errors; then handlers must check for HTTP errors.
   *
   * @see https://developer.mozilla.org/en-US/docs/Web/API/WindowOrWorkerGlobalScope/fetch
   *
   * @param  input - Defines the resource that you wish to fetch.
   * @param  init - Options object containing any custom settings that you want to apply to the request.
   * @return A Promise that resolves to a Response object.
   */
  public fetch(input: RequestInfo, init?: RequestInit): Promise<Response> {
    return fetch(input, init); // native call
  }
}
