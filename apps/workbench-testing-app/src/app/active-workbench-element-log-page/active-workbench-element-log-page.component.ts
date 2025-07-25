/*
 * Copyright (c) 2018-2025 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 */

import {afterRenderEffect, Component, computed, ElementRef, inject, signal, untracked, viewChild} from '@angular/core';
import {WorkbenchPartActionDirective} from '@scion/workbench';
import {SciMaterialIconDirective} from '@scion/components.internal/material-icon';
import {ActiveWorkbenchElementCollector} from './active-workbench-element-collector.service';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';

@Component({
  selector: 'app-active-workbench-element-log-page',
  templateUrl: './active-workbench-element-log-page.component.html',
  styleUrl: './active-workbench-element-log-page.component.scss',
  imports: [
    SciMaterialIconDirective,
    WorkbenchPartActionDirective,
    ReactiveFormsModule,
    FormsModule,
  ],
})
export default class ActiveWorkbenchElementLogPageComponent {

  private readonly _collector = inject(ActiveWorkbenchElementCollector);

  protected readonly log = computed(() => this._collector.activeElements().map(activeElement => activeElement ?? '<null>').join('\n'));
  protected readonly followTail = signal(true);
  protected readonly textArea = viewChild('text_area', {read: ElementRef<HTMLTextAreaElement>});

  constructor() {
    this.installTailScroller();
  }

  protected onClear(): void {
    this._collector.clear();
  }

  private installTailScroller(): void {
    afterRenderEffect(() => {
      // Track the log.
      this.log();

      if (this.followTail()) {
        untracked(() => {
          const textarea = this.textArea()?.nativeElement as HTMLElement;
          textarea.scrollTop = textarea.scrollHeight;
        });
      }
    });
  }
}
