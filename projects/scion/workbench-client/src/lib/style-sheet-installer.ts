/*
 * Copyright (c) 2018-2024 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 */
import {PreDestroy} from '@scion/toolkit/bean-manager';
import {Arrays} from '@scion/toolkit/util';

/**
 * Installs a CSS stylesheet with styles required by the workbench.
 */
export class StyleSheetInstaller implements PreDestroy {

  private readonly _styleSheet = new CSSStyleSheet({});

  constructor() {
    // Declare styles for the document root element (`<html>`) in a CSS layer.
    // CSS layers have lower priority than "regular" CSS declarations, and the layer name indicates the styles are from @scion/workbench.

    // Applies the following styles:
    // - Ensures the document root element is positioned to support `@scion/toolkit/observable/fromBoundingClientRect$` for observing element bounding boxes.
    // - Aligns the document root with the page viewport so the top-level positioning context fills the page viewport (as expected by applications).
    this._styleSheet.insertRule(`
      @layer sci-workbench {
        :root {
          position: absolute;
          inset: 0;
        }
      }`,
    );
    document.adoptedStyleSheets.push(this._styleSheet);
  }

  public preDestroy(): void {
    Arrays.remove(document.adoptedStyleSheets, this._styleSheet);
  }
}
