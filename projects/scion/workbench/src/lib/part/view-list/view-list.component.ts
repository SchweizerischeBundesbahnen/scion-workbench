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
import {ViewId, WorkbenchView} from '../../view/workbench-view.model';
import {NonNullableFormBuilder, ReactiveFormsModule} from '@angular/forms';
import {FilterFieldComponent} from '../../filter-field/filter-field.component';
import {PartId, WorkbenchPart} from '../workbench-part.model';
import {SciViewportComponent} from '@scion/components/viewport';
import {ViewListItemComponent} from '../view-list-item/view-list-item.component';
import {toSignal} from '@angular/core/rxjs-interop';
import {text} from '../../text/text';

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
    const filterText = toSignal(this.filterFormControl.valueChanges, {initialValue: this.filterFormControl.value});
    const views = this._part.viewIds().map(viewId => new FilterableView(viewId));

    this.viewsInsideTabbar = computed(() => views
      .filter(view => view.ref.scrolledIntoView())
      .filter(view => view.matches(filterText()))
      .map(view => view.ref),
    );
    this.viewsOutsideTabbar = computed(() => views
      .filter(view => !view.ref.scrolledIntoView())
      .filter(view => view.matches(filterText()))
      .map(view => view.ref),
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
 * Creates a regular expression of the given filter text.
 */
function toFilterRegExp(filterText: string): RegExp {
  // Escape the user input
  const escapedString = filterText.replace(/[-[\]/{}()*+?.\\^$|]/g, '\\$&');
  return new RegExp(escapedString, 'i');
}

/**
 * Represents a {@link WorkbenchView} that can be filtered by its translated title and heading.
 */
class FilterableView {

  public readonly ref: WorkbenchView;
  private readonly _title: Signal<string | null>;
  private readonly _heading: Signal<string | null>;

  constructor(public readonly viewId: ViewId) {
    this.ref = inject(WORKBENCH_VIEW_REGISTRY).get(viewId);
    this._title = text(this.ref.title);
    this._heading = text(this.ref.heading);
  }

  /**
   * Checks if this view matches the specified filter text.
   */
  public matches(filterText: string): boolean {
    const viewText = `${this._title() ?? ''} ${this._heading() ?? ''}`;
    return !filterText || !!viewText.match(toFilterRegExp(filterText));
  }
}
