/*
 * Copyright (c) 2018-2019 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 *  SPDX-License-Identifier: EPL-2.0
 */

import { fromDimension$ } from '@scion/toolkit/observable';
import { take, takeUntil } from 'rxjs/operators';
import { merge, noop, Subject } from 'rxjs';
import { ContextService } from '../context/context-service';
import { Beans, PreDestroy } from '../../bean-manager';
import { OutletContext, PreferredSize, RouterOutlets } from '../router-outlet/router-outlet.element';
import { MessageClient } from '../message-client';

/**
 * Allows web content displayed in a router outlet to define its preferred size.
 *
 * The preferred size of an element is the minimum size that will allow it to display normally.
 * Setting a preferred size is useful if the outlet is displayed in a layout that aligns its items based on the items's content size.
 */
export class PreferredSizeService implements PreDestroy {

  private _destroy$ = new Subject<void>();
  private _fromDimensionElementChange$ = new Subject<void>();
  private _whenOutletPreferredSizeTopic: Promise<string>;

  constructor() {
    this._whenOutletPreferredSizeTopic = this.lookupOutletPreferredSizeTopic();
  }

  /**
   * Sets the preferred size of this web content.
   * The size is reported to the router outlet embedding this web content and is set as the outlet's preferred size.
   */
  public setPreferredSize(preferredSize: PreferredSize): void {
    this._whenOutletPreferredSizeTopic.then(publishTo => {
      Beans.get(MessageClient).publish$(publishTo, preferredSize).subscribe();
    });
  }

  /**
   * Determines the preferred size from the given element's dimension and reports it to the router outlet embedding this web content.
   * As value for the preferred size 'offset-width' and 'offset-height' of the element are used, which is the total amount of space
   * the element occupies, including the width of the visible content, scrollbars (if any), padding, and border.
   *
   * When the size of the element changes, the changed size is reported to the outlet and set as the outlet's preferred size.
   * To stop the notifying of the preferred size to the outlet, pass `undefined` as value, which also unsets the preferred size.
   *
   * If the element is removed from the DOM, the preferred size is reset and reporting suspended until it is attached again.
   * If a new element is set as dimension observer, then the previous one is unsubscribed.
   *
   * @param element
   *        The element of which the preferred size is to be observed.
   */
  public fromDimension(element: HTMLElement | undefined): void {
    this._fromDimensionElementChange$.next();

    if (!element) {
      this.resetPreferredSize();
      return;
    }

    fromDimension$(element)
      .pipe(takeUntil(merge(this._fromDimensionElementChange$, this._destroy$)))
      .subscribe(dimension => {
        // If the element is removed from the DOM, the preferred size is reset and reporting suspended until it is attached again.
        if (!document.body.contains(dimension.element)) {
          this.resetPreferredSize();
        }
        else {
          this.setPreferredSize({
            minWidth: `${dimension.offsetWidth}px`,
            width: `${dimension.offsetWidth}px`,
            maxWidth: `${dimension.offsetWidth}px`,
            minHeight: `${dimension.offsetHeight}px`,
            height: `${dimension.offsetHeight}px`,
            maxHeight: `${dimension.offsetHeight}px`,
          });
        }
      });
  }

  /**
   * Resets the preferred size, if any.
   */
  public resetPreferredSize(): void {
    this._whenOutletPreferredSizeTopic.then(publishTo => {
      Beans.get(MessageClient).publish$(publishTo, null).subscribe();
    });
  }

  /**
   * Looks up the topic where to publish the preferred size to.
   */
  private lookupOutletPreferredSizeTopic(): Promise<string> {
    return Beans.get(ContextService).observe$<OutletContext>(RouterOutlets.OUTLET_CONTEXT)
      .pipe(take(1), takeUntil(this._destroy$))
      .toPromise()
      .then(outletContext => outletContext ? Promise.resolve(RouterOutlets.outletPreferredSizeTopic(outletContext.uid)) : new Promise<never>(noop)); // do not resolve the Promise if not running in the context of an outlet
  }

  public preDestroy(): void {
    this._destroy$.next();
  }
}
