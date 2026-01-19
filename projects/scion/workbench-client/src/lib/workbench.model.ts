/*
 * Copyright (c) 2018-2025 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 */

import {WorkbenchPart} from './part/workbench-part.model';
import {WorkbenchView} from './view/workbench-view.model';
import {WorkbenchDialog} from './dialog/workbench-dialog.model';
import {WorkbenchPopup} from './popup/workbench-popup.model';

/**
 * Union of workbench elements.
 */
export type WorkbenchElement = WorkbenchPart | WorkbenchView | WorkbenchDialog | WorkbenchPopup;

/**
 * Symbol to inject the workbench element available in the current context.
 *
 * @see WorkbenchElement
 */
export const WORKBENCH_ELEMENT = Symbol('WORKBENCH_ELEMENT');
