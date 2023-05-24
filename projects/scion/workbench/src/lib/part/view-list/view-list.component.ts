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
import {animate, style, transition, trigger} from '@angular/animations';
import {combineLatest, Observable, switchMap} from 'rxjs';
import {map} from 'rxjs/operators';
import {WorkbenchViewRegistry} from '../../view/workbench-view.registry';
import {WorkbenchView} from '../../view/workbench-view.model';
import {mapArray} from '@scion/toolkit/operators';
import {FormControl} from '@angular/forms';
import {FilterFieldComponent} from '../../filter-field/filter-field.component';
import {WorkbenchPart} from '../workbench-part.model';

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
  animations: [
    trigger('open', [
      transition(':enter', [
        style({height: 0}),
        animate('.25s ease-out', style({height: '*'})),
      ]),
    ]),
  ],
})
export class ViewListComponent implements OnInit {

  public views$: Observable<WorkbenchView[]>;
  public filterFormControl = new FormControl<string>('', {nonNullable: true});

  @ViewChild(FilterFieldComponent, {static: true})
  private _filterFieldComponent!: FilterFieldComponent;

  @Input(ViewListComponentInputs.POSITION)
  public position: 'north' | 'south' | undefined;

  @HostBinding('class.south')
  public get isSouthPosition(): boolean {
    return this.position === 'south';
  }

  constructor(part: WorkbenchPart,
              viewRegistry: WorkbenchViewRegistry,
              private _overlayRef: OverlayRef) {
    this.views$ = part.viewIds$
      .pipe(
        mapArray(viewId => viewRegistry.get(viewId)),
        switchMap(views => combineLatest(views.map(view => view.scrolledIntoView$.pipe(map(() => view))))),
      );
  }

  public ngOnInit(): void {
    this._filterFieldComponent.focus();
  }

  public onActivateView(): void {
    // The view is activated in 'wb-view-tab' component.
    this._overlayRef.dispose();
  }

  @HostListener('document:keydown.escape')
  public onEscape(): void {
    this._overlayRef.dispose();
  }

  @HostListener('mousedown', ['$event'])
  public onHostMouseDown(event: MouseEvent): void {
    event.stopPropagation(); // Prevent closing the overlay when clicking an element of it.
  }

  @HostListener('document:mousedown')
  public onDocumentMouseDown(): void {
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
