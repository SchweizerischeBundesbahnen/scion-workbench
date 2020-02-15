/*
 * Copyright (c) 2018-2019 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 *  SPDX-License-Identifier: EPL-2.0
 */

import { Observable, Observer, TeardownLogic } from 'rxjs';

/**
 * Allows watching for changes being made to the DOM tree.
 *
 * Wraps a {MutationObserver} in an Observable to watch for changes being made to the DOM tree.
 * See https://developer.mozilla.org/en-US/docs/Web/API/MutationObserver for more information.
 *
 * @param target - HTMLElement to observe.
 * @param options - describes the configuration of a mutation observer
 *        See https://developer.mozilla.org/en-US/docs/Web/API/MutationObserverInit
 */
export function fromMutation$(target: Node, options?: MutationObserverInit): Observable<MutationRecord[]> {
  return new Observable((observer: Observer<MutationRecord[]>): TeardownLogic => {
    const mutationObserver = new MutationObserver((mutations: MutationRecord[]): void => observer.next(mutations));
    mutationObserver.observe(target, options);

    return (): void => {
      mutationObserver.disconnect();
    };
  });
}
