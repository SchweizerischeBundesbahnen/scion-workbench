import {coerceElement} from '@angular/cdk/coercion';
import {ElementRef} from '@angular/core';
import {Arrays} from '@scion/toolkit/util';

/**
 * Creates an HTML element and optionally adds it to the DOM.
 */
export function createElement(tag: string, options: ElementCreateOptions): HTMLElement {
  const element = document.createElement(tag);
  options.style && setStyle(element, options.style);
  options.cssClass && element.classList.add(...Arrays.coerce(options.cssClass));
  options.attributes && setAttribute(element, options.attributes);
  options.text && (element.innerText = options.text);
  options.parent?.appendChild(element);
  return element;
}

/**
 * Applies the given style(s) to the given element.
 *
 * Specify styles to be modified by passing a dictionary containing CSS property names (hyphen case).
 * To remove a style, set its value to `null`.
 */
export function setStyle(element: HTMLElement | ElementRef<HTMLElement>, styles: {[style: string]: string | null}): void {
  const target = coerceElement(element);
  Object.entries(styles).forEach(([name, value]) => {
    if (value === null) {
      target.style.removeProperty(name);
    }
    else {
      target.style.setProperty(name, value);
    }
  });
}

/**
 * Sets the given attribute(s) on the given element.
 * To remove an attribute, set its value to `null`.
 */
export function setAttribute(element: HTMLElement | ElementRef<HTMLElement>, attributes: {[name: string]: string | null}): void {
  const target = coerceElement(element);
  Object.entries(attributes).forEach(([name, value]) => {
    if (value === null) {
      target.removeAttribute(name);
    }
    else {
      target.setAttribute(name, value);
    }
  });
}

/**
 * Sets specified CSS variable(s) to the given element.
 *
 * To remove a CSS variable, set its value to `null`, or use {@link unsetCssVariable}.
 */
export function setCssVariable(element: HTMLElement | ElementRef<HTMLElement>, variables: {[name: string]: string | null}): void {
  const target = coerceElement(element);
  Object.entries(variables).forEach(([name, value]) => {
    if (value === null) {
      target.style.removeProperty(name);
    }
    else {
      target.style.setProperty(name, value);
    }
  });
}

/**
 * Removes specified CSS variable(s) from the given element.
 */
export function unsetCssVariable(element: HTMLElement | ElementRef<HTMLElement>, ...names: string[]): void {
  const target = coerceElement(element);
  names.forEach(name => target.style.removeProperty(name));
}

/**
 * Sets specified CSS class(es) to the given element.
 */
export function setCssClass(element: HTMLElement | ElementRef<HTMLElement>, ...classes: string[]): void {
  coerceElement(element).classList.add(...classes);
}

/**
 * Removes specified CSS class(es) from the given element.
 */
export function unsetCssClass(element: HTMLElement | ElementRef<HTMLElement>, ...classes: string[]): void {
  coerceElement(element).classList.remove(...classes);
}

/**
 * Reads the current vertical and horizontal translation of given element.
 */
export function getCssTranslation(element: Element): {translateX: string | 'none'; translateY: string | 'none'} {
  const transformStyle = getComputedStyle(element).getPropertyValue('transform');
  if (transformStyle === 'none') {
    return {
      translateX: 'none',
      translateY: 'none',
    };
  }

  // The transform property returns a matrix in the form `matrix(a, b, c, d, tx, ty)`, where `tx` is the horizontal translation and `ty` is the vertical translation.
  const matrix = transformStyle.slice('matrix('.length, -1).split(/,\s+/);
  return {
    translateX: matrix[4],
    translateY: matrix[5],
  };
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
  style?: {[style: string]: any};
  attributes?: {[name: string]: any};
  text?: string;
}
