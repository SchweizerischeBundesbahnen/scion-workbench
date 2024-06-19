/*
 * Copyright (c) 2018-2023 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 */

import {ChangeDetectionStrategy, Component, HostBinding, HostListener, Input, OnInit, ViewChild} from '@angular/core';
import {OverlayRef} from '@angular/cdk/overlay';
import {combineLatest, Observable, switchMap} from 'rxjs';
import {map} from 'rxjs/operators';
import {WorkbenchViewRegistry} from '../../view/workbench-view.registry';
import {WorkbenchView} from '../../view/workbench-view.model';
import {mapArray} from '@scion/toolkit/operators';
import {FormControl, ReactiveFormsModule} from '@angular/forms';
import {FilterFieldComponent} from '../../filter-field/filter-field.component';
import {WorkbenchPart} from '../workbench-part.model';
import {AsyncPipe} from '@angular/common';
import {FilterByPredicatePipe} from '../../common/filter-by-predicate.pipe';
import {FilterByTextPipe} from '../../common/filter-by-text.pipe';
import {SciViewportComponent} from '@scion/components/viewport';
import {ViewListItemComponent} from '../view-list-item/view-list-item.component';

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
  standalone: true,
  imports: [
    AsyncPipe,
    ReactiveFormsModule,
    FilterFieldComponent,
    FilterByPredicatePipe,
    FilterByTextPipe,
    ViewListItemComponent,
    SciViewportComponent,
  ],
})
export class ViewListComponent implements OnInit {

  public views$: Observable<WorkbenchView[]>;
  public filterFormControl = new FormControl<string>('', {nonNullable: true});

  @ViewChild(FilterFieldComponent, {static: true})
  private _filterFieldComponent!: FilterFieldComponent;

  @Input(ViewListComponentInputs.POSITION)
  public position?: 'north' | 'south' | undefined;

  @HostBinding('class.south')
  public get isSouthPosition(): boolean {
    return this.position === 'south';
  }

  @HostBinding('attr.data-partid')
  public get partId(): string {
    return this._part.id;
  }

  constructor(private _part: WorkbenchPart,
              viewRegistry: WorkbenchViewRegistry,
              private _overlayRef: OverlayRef) {
    this.views$ = this._part.viewIds$
      .pipe(
        mapArray(viewId => viewRegistry.get(viewId)),
        switchMap(views => combineLatest(views.map(view => view.scrolledIntoView$.pipe(map(() => view))))),
      );
  }

  public ngOnInit(): void {
    this._filterFieldComponent.focus();
  }

  public onActivateView(view: WorkbenchView): void {
    view.activate().then();
    this._overlayRef.dispose();
  }

  @HostListener('document:keydown.escape')
  public onEscape(): void {
    this._overlayRef.dispose();
  }

  @HostListener('mousedown', ['$event'])
  @HostListener('sci-microfrontend-focusin', ['$event'])
  public onHostCloseEvent(event: Event): void {
    event.stopPropagation(); // Prevent closing this overlay if emitted from a child of this overlay.
  }

  @HostListener('document:mousedown')
  @HostListener('document:sci-microfrontend-focusin')
  public onDocumentCloseEvent(): void {
    this._overlayRef.dispose();
  }

  /**
   * Returns the filter text of given view.
   */
  public viewTextFn = (view: WorkbenchView): string => {
    return `${view.title ?? ''} ${view.heading ?? ''}`;
  };

  /**
   * Tests if given view is scrolled into view.
   */
  public scrolledIntoViewFilterFn = (view: WorkbenchView): boolean => {
    return view.scrolledIntoView;
  };

  /**
   * Tests if given view is scrolled out of view.
   */
  public scrolledOutOfViewFilterFn = (view: WorkbenchView): boolean => {
    return !view.scrolledIntoView;
  };
}
