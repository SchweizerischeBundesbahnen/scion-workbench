/*
 * Copyright (c) 2018-2026 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 */

import {SciTextProviderFn} from './text-provider.model';

/**
 * Texts used in @scion/components.
 *
 * To express the usage of a translation, add a suffix to the key:
 *
 * ```md
 * | Suffix   | Usage                    | Conventions                                 | Examples           |
 * |----------|--------------------------|---------------------------------------------|--------------------|
 * | .title   | - view title             | - Starts with a capital letter.             | - Settings         |
 * |          | - dialog title           | - No punctuation.                           | - Page Not Found   |
 * |          | - popup title            | - Words in capital letter.                  | - Confirm Deletion |
 * |          | - tab name               | - Verbs in the imperative form.             |                    |
 * |          | - column header in table |                                             |                    |
 * |          |                          |                                             |                    |
 * | .label   | - field label            | - Starts with a capital letter.             |                    |
 * |          |                          | - No punctuation.                           |                    |
 * |          |                          |                                             |                    |
 * | .action  | - button                 | - Starts with a capital letter.             | - Cancel           |
 * |          | - menu item              | - No punctuation.                           | - Close            |
 * |          |                          | - Verbs in the imperative form.             | - Delete...        |
 * |          |                          | - Suffix the action with an ellipsis        |                    |
 * |          |                          |   if there are additional options to enter. |                    |
 * |          |                          |                                             |                    |
 * | .tooltip | - tooltip                | - Starts with a capital letter.             | - Show Open Tabs   |
 * |          |                          | - No punctuation.                           | - Close            |
 * |          |                          | - Words in capital letter, unless a full    |                    |
 * |          |                          |   sentence.                                 |                    |
 * |          |                          |                                             |                    |
 * | .value   | - table cell             | - No punctuation.                           |                    |
 * |          | - drop down proposal     |                                             |                    |
 * |          | - list content           |                                             |                    |
 * |          |                          |                                             |                    |
 * | .message | - message                | - Full sentences.                           |                    |
 * |          | - warning                | - Punctuation.                              |                    |
 * |          | - error                  |                                             |                    |
 * |          | - info                   |                                             |                    |
 * ```
 */
const texts: Record<string, string> = {
  'scion.components.menu.no_items.message': 'No items found.',
  'scion.components.menu.type_to_filter.action': 'Type to filter',
};

/**
 * Provides built-in texts of @scion/components.
 */
export const scionComponentsTextProvider: SciTextProviderFn = (key: string, params: {[name: string]: string}): string | undefined => {
  // Get the text.
  const text = texts[key];
  if (text === undefined) {
    return undefined;
  }

  // Replace params, if any.
  if (Object.keys(params).length) {
    return text.replace(/{{(?<param>[^}]+)}}/g, (match: string, param: string) => params[param] ?? match);
  }

  return text;
}
