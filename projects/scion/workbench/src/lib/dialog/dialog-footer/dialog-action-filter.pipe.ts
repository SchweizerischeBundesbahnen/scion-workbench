/*
 * Copyright (c) 2018-2023 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 */

import {Pipe, PipeTransform} from '@angular/core';
import {WorkbenchDialogActionDirective} from './workbench-dialog-action.directive';

/**
 * Filters actions by specified alignment.
 */
@Pipe({name: 'wbDialogActionFilter', standalone: true})
export class DialogActionFilterPipe implements PipeTransform {

  public transform(actions: WorkbenchDialogActionDirective[] | null | undefined, align: 'start' | 'end'): WorkbenchDialogActionDirective[] {
    return actions?.filter(action => action.align === align) ?? [];
  }
}
