/*
 * Copyright (c) 2018-2025 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 */

import {WorkbenchTextProviderFn} from './workbench-text-provider.model';

/**
 * Texts used in the SCION Workbench.
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
const workbenchTexts: Record<string, string> = {
  'workbench.clear.tooltip': 'Clear',
  'workbench.close.action': 'Close',
  'workbench.close_all_tabs.action': 'Close All Tabs',
  'workbench.close_other_tabs.action': 'Close Other Tabs',
  'workbench.close_tab.action': 'Close',
  'workbench.close_tab.tooltip': 'Close. {{close_others_modifier}}+Click to Close Others.',
  'workbench.close_tabs_to_the_left.action': 'Close Tabs to the Left',
  'workbench.close_tabs_to_the_right.action': 'Close Tabs to the Right',
  'workbench.close.tooltip': 'Close',
  'workbench.move_tab_down.action': 'Move Down',
  'workbench.move_tab_to_new_window.action': 'Move to New Window',
  'workbench.move_tab_to_the_left.action': 'Move Left',
  'workbench.move_tab_to_the_right.action': 'Move Right',
  'workbench.move_tab_up.action': 'Move Up',
  'workbench.ok.action': 'OK',
  'workbench.page_not_found.message': 'The requested page <strong>{{path}}</strong> was not found.<br>The URL may have changed. Try to open the page again.',
  'workbench.page_not_found.title': 'Page Not Found',
  'workbench.page_not_found_developer_hint.message': 'You can create a custom "Not Found" page component and register it in the workbench configuration to personalize this page.',
  'workbench.show_open_tabs.tooltip': 'Show Open Tabs',
};

/**
 * Provides texts used in the SCION Workbench.
 *
 * Register this provider as the last text provider, enabling change or translation of built-in workbench texts.
 */
export const workbenchTextProvider: WorkbenchTextProviderFn = (key: string, params: Record<string, string>): string | undefined => {
  // Get the text.
  const text = workbenchTexts[key] as string | undefined;
  if (text === undefined) {
    return undefined;
  }

  // Replace params, if any.
  if (Object.keys(params).length) {
    return text.replace(/{{(?<param>[^}]+)}}/g, (match: string, param: string) => params[param] ?? match);
  }

  return text;
};
