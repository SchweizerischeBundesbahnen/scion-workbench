/*
 * Copyright (c) 2018-2023 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 */

import {ChangeDetectionStrategy, Component, computed, effect, HostBinding, HostListener, inject, input, Signal, viewChild} from '@angular/core';
import {OverlayRef} from '@angular/cdk/overlay';
import {WORKBENCH_VIEW_REGISTRY} from '../../view/workbench-view.registry';
import {WorkbenchView} from '../../view/workbench-view.model';
import {NonNullableFormBuilder, ReactiveFormsModule} from '@angular/forms';
import {FilterFieldComponent} from '../../filter-field/filter-field.component';
import {PartId, WorkbenchPart} from '../workbench-part.model';
import {SciViewportComponent} from '@scion/components/viewport';
import {ViewListItemComponent} from '../view-list-item/view-list-item.component';
import {toSignal} from '@angular/core/rxjs-interop';

/**
 * Reference to inputs of {@link ViewListComponent}.
 */
export const ViewListComponentInputs = {
  POSITION: 'position',
};

@Component({
  selector: 'wb-view-list',
  templateUrl: './view-list.component.html',
  styleUrls: ['./view-list.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    ReactiveFormsModule,
    FilterFieldComponent,
    ViewListItemComponent,
    SciViewportComponent,
  ],
})
export class ViewListComponent {

  /** @see ViewListComponentInputs.POSITION */
  public readonly position = input<'north' | 'south'>();

  private readonly _filterFieldComponent = viewChild.required(FilterFieldComponent);
  private readonly _part = inject(WorkbenchPart);
  private readonly _overlayRef = inject(OverlayRef);

  /** Views that are scrolled into the tab bar. */
  protected readonly viewsInsideTabbar: Signal<WorkbenchView[]>;
  /** Views that are scrolled out of the tab bar. */
  protected readonly viewsOutsideTabbar: Signal<WorkbenchView[]>;
  protected readonly filterFormControl = inject(NonNullableFormBuilder).control('');

  @HostBinding('class.south')
  protected get isSouthPosition(): boolean {
    return this.position() === 'south';
  }

  @HostBinding('attr.data-partid')
  protected get partId(): PartId {
    return this._part.id;
  }

  constructor() {
    const viewRegistry = inject(WORKBENCH_VIEW_REGISTRY);
    const filterText = toSignal(this.filterFormControl.valueChanges, {initialValue: this.filterFormControl.value});

    this.viewsInsideTabbar = computed(() => this._part.viewIds()
      .map(viewId => viewRegistry.get(viewId))
      .filter(view => view.scrolledIntoView())
      .filter(view => matchesView(filterText(), view)),
    );
    this.viewsOutsideTabbar = computed(() => this._part.viewIds()
      .map(viewId => viewRegistry.get(viewId))
      .filter(view => !view.scrolledIntoView())
      .filter(view => matchesView(filterText(), view)),
    );

    const effectRef = effect(() => {
      this._filterFieldComponent().focus();
      effectRef.destroy();
    });
  }

  protected onActivateView(view: WorkbenchView): void {
    void view.activate();
    this._overlayRef.dispose();
  }

  @HostListener('document:keydown.escape')
  protected onEscape(): void {
    this._overlayRef.dispose();
  }

  @HostListener('mousedown', ['$event'])
  @HostListener('sci-microfrontend-focusin', ['$event'])
  protected onHostCloseEvent(event: Event): void {
    event.stopPropagation(); // Prevent closing this overlay if emitted from a child of this overlay.
  }

  @HostListener('document:mousedown')
  @HostListener('document:sci-microfrontend-focusin')
  protected onDocumentCloseEvent(): void {
    this._overlayRef.dispose();
  }
}

/**
 * Tests if given filter matches given view.
 */
function matchesView(filterText: string, view: WorkbenchView): boolean {
  const viewText = `${view.title() ?? ''} ${view.heading() ?? ''}`;
  return !filterText || !!viewText.match(toFilterRegExp(filterText));
}

/**
 * Creates a regular expression of the given filter text.
 */
function toFilterRegExp(filterText: string): RegExp {
  // Escape the user input
  const escapedString = filterText.replace(/[-[\]/{}()*+?.\\^$|]/g, '\\$&');
  return new RegExp(escapedString, 'i');
}
