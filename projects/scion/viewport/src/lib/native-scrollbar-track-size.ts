/*
 * Copyright (c) 2018 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 *  SPDX-License-Identifier: EPL-2.0
 */

import { Inject, Injectable, Renderer2, RendererFactory2 } from '@angular/core';
import { DOCUMENT } from '@angular/common';

/**
 * A DI Token representing the native scrollbar size of the user agent.
 */
@Injectable({providedIn: 'root'})
export class SciNativeScrollbarTrackSize {

  public readonly hScrollbarTrackHeight: number;
  public readonly vScrollbarTrackWidth: number;

  constructor(@Inject(DOCUMENT) document: any, rendererFactory: RendererFactory2) {
    const renderer = rendererFactory.createRenderer(null, null);

    // create temporary viewport and viewport client with native scrollbars to compute scrolltrack width
    const viewportDiv = renderer.createElement('div');
    this.setStyle(renderer, viewportDiv, {
      position: 'absolute',
      overflow: 'scroll',
      height: '100px',
      width: '100px',
      border: 0,
      visibility: 'hidden',
    });

    const viewportClientDiv = renderer.createElement('div');
    this.setStyle(renderer, viewportClientDiv, {
      height: '100%',
      width: '100%',
      border: 0,
    });

    renderer.appendChild(viewportDiv, viewportClientDiv);
    renderer.appendChild(document.body, viewportDiv);

    // compute native scrolltrack width
    this.hScrollbarTrackHeight = viewportDiv.offsetWidth - viewportClientDiv.offsetWidth;
    this.vScrollbarTrackWidth = viewportDiv.offsetHeight - viewportClientDiv.offsetHeight;

    // destroy temporary viewport
    renderer.removeChild(document.body, viewportDiv);
  }

  private setStyle(renderer: Renderer2, element: Element, style: { [key: string]: any }): void {
    Object.keys(style).forEach(key => renderer.setStyle(element, key, style[key]));
  }
}
