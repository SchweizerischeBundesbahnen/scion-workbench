/*
 * Copyright (c) 2018-2025 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 */

import {SciTextProviderFn} from '@scion/components/text';

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
  'scion.workbench.clear.tooltip': 'Clear',
  'scion.workbench.close.action': 'Close',
  'scion.workbench.close_all_tabs.action': 'Close All Tabs',
  'scion.workbench.close_other_tabs.action': 'Close Other Tabs',
  'scion.workbench.close_tab.action': 'Close',
  'scion.workbench.close_tab.tooltip': 'Close. {{close_others_modifier}}+Click to Close Others.',
  'scion.workbench.close_tabs_to_the_left.action': 'Close Tabs to the Left',
  'scion.workbench.close_tabs_to_the_right.action': 'Close Tabs to the Right',
  'scion.workbench.close.tooltip': 'Close',
  'scion.workbench.dev_mode_only_hint.tooltip': 'This hint is only displayed in dev mode.',
  'scion.workbench.minimize.tooltip': 'Minimize',
  'scion.workbench.move_tab_down.action': 'Move Down',
  'scion.workbench.move_tab_to_new_window.action': 'Move to New Window',
  'scion.workbench.move_tab_to_the_left.action': 'Move Left',
  'scion.workbench.move_tab_to_the_right.action': 'Move Right',
  'scion.workbench.move_tab_up.action': 'Move Up',
  'scion.workbench.no_views.message': 'No views found.',
  'scion.workbench.null_content.message': 'Nothing to show.',
  'scion.workbench.null_view_developer_hint.message': 'This view has not been navigated.<br>Navigate the view "{{view}}" to display content.',
  'scion.workbench.ok.action': 'OK',
  'scion.workbench.page_not_found.message': 'The requested page <strong>{{path}}</strong> was not found.<br>The URL may have changed.',
  'scion.workbench.page_not_found.title': 'Page Not Found',
  'scion.workbench.page_not_found_developer_hint.message': 'You can create a custom "Not Found" page component and register it in the workbench configuration to personalize this page.',
  'scion.workbench.page_not_found_part.message': 'The requested page <strong>{{path}}</strong> was not found.<br>The URL may have changed. Try resetting the perspective.',
  'scion.workbench.page_not_found_view.message': 'The requested page <strong>{{path}}</strong> was not found.<br>The URL may have changed. Try opening the view again or resetting the perspective.',
  'scion.workbench.reset_perspective.action': 'Reset Perspective',
  'scion.workbench.show_open_tabs.tooltip': 'Show Open Tabs',
};

/**
 * Provides texts used in the SCION Workbench.
 *
 * Register this provider as the last text provider, enabling change or translation of built-in workbench texts.
 */
export const workbenchTextProvider: SciTextProviderFn = (key: string, params: {[name: string]: string}): string | undefined => {
  // Get the text.
  const text = workbenchTexts[key];
  if (text === undefined) {
    return undefined;
  }

  // Replace params, if any.
  if (Object.keys(params).length) {
    return text.replace(/{{(?<param>[^}]+)}}/g, (match: string, param: string) => params[param] ?? match);
  }

  return text;
};
