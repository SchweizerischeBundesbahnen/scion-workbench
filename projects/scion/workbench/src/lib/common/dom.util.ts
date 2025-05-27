import {coerceElement} from '@angular/cdk/coercion';
import {booleanAttribute, DestroyRef, ElementRef, inject, Injector, numberAttribute} from '@angular/core';
import {Arrays} from '@scion/toolkit/util';
import {DOCUMENT} from '@angular/common';
import {UID} from './uid.util';
import {DisposeFn} from './disposable';

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
 * Reads and parses specified CSS variable from given element. Defaults to the specified value if not available.
 */
export function readCssVariable<T extends string | number | boolean | null>(element: Element, variable: string, defaultValue: T): T {
  const value = getComputedStyle(element).getPropertyValue(variable) || defaultValue; // empty string if not set
  switch (typeof defaultValue) {
    case 'number': {
      return numberAttribute(value, defaultValue) as T;
    }
    case 'boolean': {
      return booleanAttribute(value) as T;
    }
    default: {
      return value as T;
    }
  }
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
    translateX: matrix[4]!,
    translateY: matrix[5]!,
  };
}

/**
 * Ensures that the given HTML element is positioned, setting its position to `relative` if it is not already positioned.
 *
 * Positioning is set using a constructable CSS stylesheet with a CSS layer. CSS layers have lower priority than "normal"
 * CSS declarations, and the layer name indicates the styling originates from `@scion/workbench`.
 *
 * This function adds an attribute to the element to locate it from the stylesheet, with the name containing a random identifier plus the context.
 *
 * This function must be passed an injector or called in an injection context. Destroying the injector will remove the attribute and the stylesheet.
 */
export function positionElement(elementLike: Element | ElementRef<Element>, options: {context: string; injector?: Injector}): void {
  const injector = options.injector ?? inject(Injector);
  const element = coerceElement(elementLike);
  const document = injector.get(DOCUMENT);
  const disposables = new Array<DisposeFn>();

  // Generate identifiers to locate the element from the stylesheet.
  const elementIdentifier = `data-wb-${options.context}-${UID.randomUID()}`;
  const elementIdentifierImportant = `${elementIdentifier}-important`;

  // Add stylesheet to change the element's position to relative.
  const styleSheet = new CSSStyleSheet({});
  styleSheet.insertRule(`
      @layer sci-workbench {
        [${elementIdentifier}] {
          position: relative;
        }
      }`,
  );
  document.adoptedStyleSheets.push(styleSheet);
  disposables.push(() => Arrays.remove(document.adoptedStyleSheets, styleSheet));

  // Add attribute to locate the element from the stylesheet.
  element.setAttribute(elementIdentifier, '');
  disposables.push(() => element.removeAttribute(elementIdentifier));

  // If CSS layer styles have no effect due to 'static' positioning or unset styles, enforce positioning with !important.
  const animationFrame = requestAnimationFrame(() => {
    if (getComputedStyle(element).position === 'static') {
      styleSheet.insertRule(`
        [${elementIdentifierImportant}] {
          position: relative !important;
        }
      `);
      element.setAttribute(elementIdentifierImportant, '');
      disposables.push(() => element.removeAttribute(elementIdentifierImportant));
    }
  });
  disposables.push(() => cancelAnimationFrame(animationFrame));

  // Clean up when the injection context is destroyed.
  injector.get(DestroyRef).onDestroy(() => disposables.forEach(disposable => disposable()));
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
