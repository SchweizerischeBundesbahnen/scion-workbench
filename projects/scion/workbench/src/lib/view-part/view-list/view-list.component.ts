/*
 * Copyright (c) 2018-2019 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 *  SPDX-License-Identifier: EPL-2.0
 */

import { Component, ElementRef, HostBinding, HostListener, OnDestroy, OnInit } from '@angular/core';
import { WorkbenchViewPartService } from '../workbench-view-part.service';
import { OverlayRef } from '@angular/cdk/overlay';
import { animate, AnimationBuilder, style } from '@angular/animations';
import { fromEvent, Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { SciDimension } from '@scion/toolkit/dimension';

@Component({
  selector: 'wb-view-list',
  templateUrl: './view-list.component.html',
  styleUrls: ['./view-list.component.scss'],
})
export class ViewListComponent implements OnInit, OnDestroy {

  private static MAX_COMPONENT_HEIGHT_PX = 350;

  private _destroy$ = new Subject<void>();

  @HostBinding('style.height.px')
  public componentHeight: number;

  public hiddenViewTabs: string[] = [];

  constructor(private _host: ElementRef<HTMLElement>,
              private _viewPartService: WorkbenchViewPartService,
              private _overlayRef: OverlayRef,
              private _animationBuilder: AnimationBuilder) {
    this.installHiddenViewTabsListener();
  }

  public ngOnInit(): void {
    this.installBackdropListener();
  }

  public onViewportClientDimensionChange(dimension: SciDimension): void {
    this.componentHeight = Math.min(dimension.clientHeight, ViewListComponent.MAX_COMPONENT_HEIGHT_PX);
    this.animateComponentHeightChange();
  }

  public onViewTabClick(): void {
    this._overlayRef.dispose();
  }

  @HostListener('document:keydown.escape')
  public onEscape(): void {
    this._overlayRef.dispose();
  }

  private animateComponentHeightChange(): void {
    const animation = this._animationBuilder.build([
      style({height: '*'}),
      animate('.2s ease-out', style({height: `${this.componentHeight}px`})),
    ]).create(this._host.nativeElement);
    animation.onDone(() => {
      animation.destroy();
      this._overlayRef.updatePosition();
    });
    animation.play();
  }

  private installHiddenViewTabsListener(): void {
    this._viewPartService.hiddenViewTabs$
      .pipe(takeUntil(this._destroy$))
      .subscribe((hiddenViewTabs: string[]) => {
        this.hiddenViewTabs = hiddenViewTabs;
        if (hiddenViewTabs.length === 0) {
          this._overlayRef.dispose();
        }
      });
  }

  private installBackdropListener(): void {
    fromEvent(this._overlayRef.backdropElement, 'mousedown')
      .pipe(takeUntil(this._destroy$))
      .subscribe(() => this._overlayRef.dispose());
  }

  public ngOnDestroy(): void {
    this._destroy$.next();
  }
}
