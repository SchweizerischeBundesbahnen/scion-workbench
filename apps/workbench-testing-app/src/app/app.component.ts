/*
 * Copyright (c) 2018-2022 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 */

import {Component, computed, DoCheck, DOCUMENT, inject, NgZone, signal, Signal} from '@angular/core';
import {filter, map, scan} from 'rxjs/operators';
import {NavigationCancel, NavigationEnd, NavigationError, Router, RouterOutlet} from '@angular/router';
import {takeUntilDestroyed, toSignal} from '@angular/core/rxjs-interop';
import {provideMenu, WORKBENCH_ID, WorkbenchService, WorkbenchStartup} from '@scion/workbench';
import {HeaderComponent} from './header/header.component';
import {fromEvent} from 'rxjs';
import {subscribeIn} from '@scion/toolkit/operators';
import {SettingsService} from './settings.service';
import {installFocusHighlighter} from './focus-highlight/focus-highlighter';
import {installGlasspaneHighlighter} from './glasspane-highlight/glasspane-highlighter';
import {installMicrofrontendApplicationLabels} from './microfrontend-application-labels/microfrontend-application-labels';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
  imports: [
    RouterOutlet,
    HeaderComponent,
  ],
  host: {
    '[attr.data-workbench-id]': 'workbenchId',
    '[attr.data-perspective-id]': 'activePerspective()?.id',
    '[attr.data-navigationid]': 'navigationId()',
  },
})
export class AppComponent implements DoCheck {

  private readonly _zone = inject(NgZone);
  private readonly _logAngularChangeDetectionCycles = toSignal(inject(SettingsService).observe$('logAngularChangeDetectionCycles'));

  protected readonly workbenchStartup = inject(WorkbenchStartup);
  protected readonly activePerspective = inject(WorkbenchService).activePerspective;
  protected readonly workbenchId = inject(WORKBENCH_ID);
  /**
   * Unique id that is set after a navigation has been performed.
   *
   * @see RouterPagePO
   */
  protected readonly navigationId = this.computeNavigationId();

  constructor() {
    this.installPropagatedKeyboardEventLogger();
    this.provideWorkbenchService();
    installFocusHighlighter();
    installGlasspaneHighlighter();
    installMicrofrontendApplicationLabels();

    const paragraphStyle = signal<string>('');

    provideMenu('toolbar:workbench.part.tools', menu => menu
      .addMenu({text: 'File'}, menu => menu
        .addMenuItem({text: 'New', icon: 'article', accelerator: ['Ctrl', 'N']}, () => this.onAction())
        .addMenuItem({text: 'Open', icon: 'folder'}, () => this.onAction())
        .addMenuItem({text: 'Make a Copy', icon: 'file_copy'}, () => this.onAction())
        .addMenu({text: 'Share', icon: 'person_add', id: 'extend-me'}, menu => menu
          .addMenuItem({text: 'Share with others', icon: 'person_add'}, () => this.onAction())
          .addMenuItem({text: 'Publish to web', icon: 'public'}, () => this.onAction()),
        )
        .addMenuItem({text: 'Download', icon: 'download'}, () => this.onAction())
        .addMenuItem({text: 'Print', icon: 'print'}, () => this.onAction()),
      )
      .addMenu({text: 'Edit'}, menu => menu
        .addMenuItem({text: 'Undo', icon: 'undo', accelerator: ['Ctrl', 'Z']}, () => this.onAction())
        .addMenuItem({text: 'Redo', icon: 'redo'}, () => this.onAction())
        .addMenuItem({text: 'Cut', icon: 'content_cut', accelerator: ['Ctrl', 'X']}, () => this.onAction())
        .addMenuItem({text: 'Copy', icon: 'content_copy', accelerator: ['Ctrl', 'C']}, () => this.onAction())
        .addMenuItem({text: 'Paste', icon: 'content_paste', accelerator: ['Ctrl', 'V']}, () => this.onAction())
        .addMenuItem({text: 'Find and replace', icon: 'find_replace', accelerator: ['Ctrl', 'F']}, () => this.onAction()),
      )
      .addMenu({text: 'Format'}, menu => menu
        .addMenu({text: 'Text', icon: 'format_bold'}, menu => menu
          .addMenuItem({text: 'Bold', icon: 'format_bold', accelerator: ['Ctrl', 'Shift', 'B']}, () => this.onAction())
          .addMenuItem({text: 'Italic', icon: 'format_italic', accelerator: ['Ctrl', 'Shift', 'I']}, () => this.onAction())
          .addMenuItem({text: 'Underline', icon: 'format_underlined'}, () => this.onAction())
          .addMenuItem({text: 'Strikethrough', icon: 'strikethrough_s'}, () => this.onAction())
          .addMenu({text: 'Size', icon: 'format_bold'}, menu => menu
            .addMenuItem({text: 'Increase font size'}, () => this.onAction())
            .addMenuItem({text: 'Decrease font size'}, () => this.onAction()),
          ),
        )
        .addMenu({text: 'Paragraph styles', icon: 'format_align_justify', id: 'menu:paragraph'}, menu => {
            return menu
              .addMenuItem({text: 'Normal text', checked: computed(() => paragraphStyle() === 'normal')}, () => paragraphStyle.set('normal'))
              .addMenuItem({text: 'Heading 1', checked: computed(() => paragraphStyle() === 'heading1')}, () => paragraphStyle.set('heading1'))
              .addMenuItem({text: 'Heading 2', checked: computed(() => paragraphStyle() === 'heading2')}, () => paragraphStyle.set('heading2'))
          },
        )
        .addMenu({text: 'Align & indent', icon: 'format_bold'}, menu => menu
          .addMenuItem({text: 'Align left', icon: 'format_align_left'}, () => this.onAction())
          .addMenuItem({text: 'Align center', icon: 'format_align_center'}, () => this.onAction())
          .addMenuItem({text: 'Align right', icon: 'format_align_right'}, () => this.onAction())
          .addMenuItem({text: 'Justify', icon: 'format_align_justify'}, () => this.onAction()),
        ),
      ),
    );

    provideMenu('menu:paragraph', menu => menu
      .addMenuItem({text: 'Heading 3', checked: computed(() => paragraphStyle() === 'heading3')}, () => paragraphStyle.set('heading3'))
    );

    provideMenu('menu:paragraph', menu => menu
      .addMenu({text: 'SCION'}, menu => menu
        .addMenuItem({text: 'Dani'}, () => this.onAction())
        .addMenuItem({text: 'Marc'}, () => this.onAction())
        .addMenuItem({text: 'Konstantin'}, () => this.onAction()),
      ),
    );
  }

  private onAction(): void {
    console.log('>>> click');
  }

  public ngDoCheck(): void {
    if (this._logAngularChangeDetectionCycles()) {
      console.log('[AppComponent] Angular change detection cycle');
    }
  }

  private computeNavigationId(): Signal<string | undefined> {
    const navigationId$ = inject(Router).events
      .pipe(
        filter(event => event instanceof NavigationEnd || event instanceof NavigationCancel || event instanceof NavigationError),
        scan(navigationId => navigationId + 1, 0),
        map(navigationId => `${navigationId}`),
      );
    return toSignal(navigationId$, {initialValue: undefined});
  }

  /**
   * Logs propagated keyboard events, i.e., keyboard events propagated across iframe boundaries.
   *
   * Do not install via host listener to not trigger change detection for each keyboard event.
   */
  private installPropagatedKeyboardEventLogger(): void {
    fromEvent<KeyboardEvent>(inject(DOCUMENT), 'keydown')
      .pipe(
        subscribeIn(fn => this._zone.runOutsideAngular(fn)),
        takeUntilDestroyed(),
      )
      .subscribe((event: KeyboardEvent) => {
        if (!event.isTrusted && (event.target as Element).tagName === 'SCI-ROUTER-OUTLET') {
          console.debug(`[AppComponent][synth-event][event=${event.type}][key=${event.key}][key.control=${event.ctrlKey}][key.shift=${event.shiftKey}][key.alt=${event.altKey}][key.meta=${event.metaKey}]`);
        }
      });
  }

  /**
   * Injects {@link WorkbenchService} into the global window object for tests to interact with the workbench.
   */
  private provideWorkbenchService(): void {
    (window as unknown as Record<string, unknown>)['__workbenchService'] = inject(WorkbenchService);
  }
}
