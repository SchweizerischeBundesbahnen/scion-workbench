/*
 * Copyright (c) 2018-2026 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 *  SPDX-License-Identifier: EPL-2.0
 */

import {ChangeDetectionStrategy, Component, Directive, effect, inject, signal, Signal, TemplateRef, untracked, viewChild} from '@angular/core';
import {SciComponentDescriptor, SciComponentOutletDirective} from '@scion/sci-components/common';
import {IconProviders} from './icon-providers';
import {fromMutation$} from '@scion/toolkit/observable';
import {concatWith, map, MonoTypeOperatorFunction, of} from 'rxjs';

/**
 * Renders an icon based on registered icon providers.
 *
 * Use the icon name as slotted content of the `<sci-icon>` component.
 *
 * Example:
 * ```html
 * <sci-icon>home</sci-icon>
 * ```
 *
 * Providers are called in registration order. If a provider does not provide the icon, the next provider is called, and so on.
 * If no provider provides the icon, defaults to a Material icon provider, interpreting the icon as a Material icon ligature.
 *
 * The icon size depends on the font size at its position in the DOM.
 * To change the size, set a font-size on the `<sci-icon>` element or set the `--sci-icon-size` CSS variable.
 *
 * @see provideIconProvider
 */
@Component({
  selector: 'sci-icon',
  templateUrl: './icon.component.html',
  styleUrl: './icon.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    SciComponentOutletDirective,
  ],
})
export class SciIconComponent {

  private readonly _slottedContent = viewChild.required<TemplateRef<void>>('slotted_content');

  protected readonly icon = this.computeIcon();

  /**
   * Reads the icon from slotted content and passes it to registered icon providers for resolution.
   */
  private computeIcon(): Signal<SciComponentDescriptor | undefined> {
    const icon = signal<SciComponentDescriptor | undefined>(undefined);
    const iconProviders = inject(IconProviders);

    effect((onCleanup) => {
      const slottedContent = this._slottedContent();

      untracked(() => {
        // Instantiate template to "read" slotted content.
        const view = slottedContent.createEmbeddedView(undefined);
        onCleanup(() => view.destroy());

        // Return if empty, i.e., no icon to render.
        if (!view.rootNodes.length) {
          icon.set(undefined);
          return;
        }

        // Ensure only text is provided as slotted content.
        if (view.rootNodes.length > 1 || view.rootNodes[0].nodeType !== Node.TEXT_NODE) {
          throw Error('[InvalidInputError] Only text (ligature) is allowed in slotted content of <sci-icon>.');
        }

        // Watch slotted content.
        const textNode = view.rootNodes[0] as Text;
        const subscription = of(textNode.textContent)
          .pipe(
            concatWith(fromMutation$(textNode, {characterData: true}).pipe(map(() => textNode.textContent))),
            map(slottedContent => iconProviders.provide(slottedContent.trim() || undefined)),
            augmentIconDescriptor(),
          )
          .subscribe(iconDescriptor => icon.set(iconDescriptor));

        onCleanup(() => subscription.unsubscribe());
      });
    });

    return icon;
  }
}

/**
 * Augments the icon descriptor:
 *
 * - Prevents the browser from translating the icon.
 * - Sets the icon's font size to 'var(--sci-icon-size, 1em)', required to inherit the location's font size for icons with a fixed font size.
 *   For example, Material sets a fixed font size of 24px.
 */
function augmentIconDescriptor(): MonoTypeOperatorFunction<SciComponentDescriptor | undefined> {
  return map((icon: SciComponentDescriptor | undefined) => icon && {
    ...icon,
    attributes: {
      ...icon.attributes,
      translate: 'no',
    },
    directives: [
      ...icon.directives ?? [],
      IconFontSizeDirective,
    ],
  } satisfies SciComponentDescriptor);
}

/**
 * Sets the font size to 'var(--sci-icon-size, 1em)', required to inherit the location's font size for icons with a fixed font size.
 * For example, Material sets a fixed font size of 24px.
 */
@Directive({host: {'[style.font-size]': `'var(--sci-icon-size, 1em)'`}})
class IconFontSizeDirective {
}

/**
 * Acts as placeholder if no icon could be found.
 */
@Component({template: ''})
export class NullIconComponent {
}
