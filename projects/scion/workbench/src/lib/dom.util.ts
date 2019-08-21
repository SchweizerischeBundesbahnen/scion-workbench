import { coerceArray, coerceElement } from '@angular/cdk/coercion';
import { ElementRef } from '@angular/core';

/**
 * Creates a HTML element and optionally adds it to the DOM.
 */
export function createElement(tag: string, options: ElementCreateOptions): HTMLElement {
  const element = document.createElement(tag);
  options.style && setStyle(element, options.style);
  options.cssClass && element.classList.add(...coerceArray(options.cssClass));
  options.text && (element.innerText = options.text);
  options.parent && options.parent.appendChild(element);
  return element;
}

/**
 * Applies the given style(s) to the given element.
 *
 * To unset a style property provide `null` as its value.
 */
export function setStyle(element: HTMLElement | ElementRef<HTMLElement>, style: { [style: string]: any | null }): void {
  const target = coerceElement(element);
  Object.keys(style).forEach(key => target.style[key] = style[key]);
}

/**
 * Sets the given CSS variable to the given element.
 *
 * If not providing a value the variable is removed.
 */
export function setCssVariable(element: HTMLElement | ElementRef<HTMLElement>, key: string, value?: any): void {
  if (value === undefined || value === null) {
    unsetCssVariable(element, key);
  }
  else {
    coerceElement(element).style.setProperty(key, value);
  }
}

/**
 * Removes the CSS variable of the given key.
 */
export function unsetCssVariable(element: HTMLElement | ElementRef<HTMLElement>, key: string, value?: any): void {
  coerceElement(element).style.removeProperty(key);
}

/**
 * Describes how to create a new HTML element.
 */
export interface ElementCreateOptions {
  /**
   * Specifies the parent where to add this element to the DOM tree.
   * If not specified, the element is not added to the DOM.
   */
  parent?: Node;
  cssClass?: string | string[];
  style?: { [style: string]: any };
  text?: string;
}
