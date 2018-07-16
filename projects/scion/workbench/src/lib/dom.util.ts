/*
 * Copyright (c) 2018 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 *  SPDX-License-Identifier: EPL-2.0
 */

export class DomUtil {

  private constructor() {
  }

  /**
   * Returns 'true' if the given element is a child element of the parent element.
   */
  public static isChildOf(element: Element, parent: Element): boolean {
    while (element.parentElement !== null) {
      element = element.parentElement;
      if (element === parent) {
        return true;
      }
    }
    return false;
  }

  /**
   * Checks if the specified element is a child of an element with the specified CSS class.
   */
  public static isChildOfCssClassParent(element: Element, parentClass: string): boolean {
    let parentElement = element;
    while ((parentElement = parentElement.parentElement) !== null) {
      if (parentElement.classList.contains(parentClass)) {
        return true;
      }
    }
    return false;
  }
}
