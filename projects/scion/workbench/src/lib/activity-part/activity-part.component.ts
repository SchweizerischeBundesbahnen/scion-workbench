/*
 * Copyright (c) 2018-2019 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 *  SPDX-License-Identifier: EPL-2.0
 */

import { ChangeDetectorRef, Component, ElementRef, HostBinding, ViewChild } from '@angular/core';
import { animate, AnimationBuilder, AnimationPlayer, style, transition, trigger } from '@angular/animations';
import { WorkbenchActivityPartService } from './workbench-activity-part.service';
import { WorkbenchLayoutService } from '../workbench-layout.service';
import { noop, Observable, Subject } from 'rxjs';
import { ACTIVITY_OUTLET_NAME, ROUTER_OUTLET_NAME } from '../workbench.constants';
import { Activity } from './activity';
import { ContentProjectionContext } from '../content-projection/content-projection-context.service';
import { Arrays } from '../array.util';

/**
 * Specifies the minimal panel width. If smaller, it is expanded to this value
 */
const PANEL_MIN_WIDTH = 200;
/**
 * Specifies the initial panel width if starting the application.
 */
const PANEL_INITIAL_WIDTH = 500;

@Component({
  selector: 'wb-activity-part',
  templateUrl: './activity-part.component.html',
  styleUrls: ['./activity-part.component.scss'],
  animations: [
    trigger(
      'panel-enter-or-leave', [
        transition(':enter', [
          style({width: '0'}),
          animate('75ms ease-out', style({width: '*'})),
        ]),
        transition(':leave', [
          style({width: '*'}),
          animate('75ms ease-out', style({width: 0})),
        ]),
      ],
    ),
  ],
  viewProviders: [
    {provide: ROUTER_OUTLET_NAME, useValue: ACTIVITY_OUTLET_NAME},
    ContentProjectionContext,
  ],
})
export class ActivityPartComponent {

  private _panelWidth = PANEL_INITIAL_WIDTH;
  private _panelWidth$ = new Subject<number>();

  @ViewChild('viewport', {static: false})
  public viewport: ElementRef;

  @ViewChild('panel', {read: ElementRef, static: false})
  private _panelElementRef: ElementRef;

  @HostBinding('attr.content-projection')
  public get contentProjectionActive(): boolean {
    return this._contentProjectionContext.isActive();
  }

  constructor(public host: ElementRef<HTMLElement>,
              public activityPartService: WorkbenchActivityPartService,
              private _workbenchLayout: WorkbenchLayoutService,
              private _animationBuilder: AnimationBuilder,
              private _cd: ChangeDetectorRef,
              private _contentProjectionContext: ContentProjectionContext) {
  }

  public get activities(): Activity[] {
    return this.activityPartService.activities.filter(it => it.visible);
  }

  public get activeActivity(): Activity {
    const activeActivity = this.activityPartService.activeActivity;
    return activeActivity && activeActivity.visible ? activeActivity : null;
  }

  public set panelWidth(panelWidth: number) {
    this._panelWidth = panelWidth;
    this._panelWidth$.next(panelWidth);
  }

  public get panelWidth(): number {
    return this._panelWidth;
  }

  public get panelWidth$(): Observable<number> {
    return this._panelWidth$.asObservable();
  }

  public getCssClassesForActivityItem(activity: Activity): string[] {
    return [
      ...Arrays.from(activity.itemCssClass), // CSS class(es) on the item only, e.g. used for styling
      ...Arrays.from(activity.cssClass), // CSS class(es) on both, the item and the panel, e.g. used for e2e-testing
    ];
  }

  public onActivate(activity: Activity): false {
    this.activityPartService.activateActivity(activity).then(noop);
    return false; // prevent UA to follow 'href'
  }

  public onSashStart(): void {
    this._workbenchLayout.viewSashDrag$.next('start');
  }

  public onSash(deltaX: number): void {
    this.panelWidth += deltaX;
  }

  public onSashEnd(): void {
    this._workbenchLayout.viewSashDrag$.next('end');
    this.ensureMinimalPanelWidth();
  }

  public onSashReset(): void {
    this.panelWidth = PANEL_INITIAL_WIDTH;
  }

  public onPanelAnimationDone(): void {
    this._cd.detectChanges();
  }

  private ensureMinimalPanelWidth(): void {
    if (this.panelWidth >= PANEL_MIN_WIDTH) {
      return;
    }

    const animation = this._animationBuilder.build([
      style({width: '*'}),
      animate('75ms ease-out', style({width: `${PANEL_MIN_WIDTH}px`})),
    ]).create(this._panelElementRef.nativeElement);
    animation.onDone(() => this.panelWidth = PANEL_MIN_WIDTH);
    ActivityPartComponent.once(animation);
  }

  /**
   * Plays the animation and destroys it upon completion.
   */
  private static once(animation: AnimationPlayer): void {
    animation.onDone(() => animation.destroy());
    animation.play();
  }
}
