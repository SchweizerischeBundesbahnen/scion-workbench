/*
 * Copyright (c) 2018-2022 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 */

import {MonoTypeOperatorFunction, Observable} from 'rxjs';
import {Beans} from '@scion/toolkit/bean-manager';
import {ObservableDecorator} from '@scion/microfrontend-platform';

/**
 * Decorates the source with registered {@link ObservableDecorator}, if any.
 *
 * @internal
 */
export function decorateObservable<T>(): MonoTypeOperatorFunction<T> {
  return (source$: Observable<T>) => Beans.opt(ObservableDecorator)?.decorate$(source$) ?? source$;
}
