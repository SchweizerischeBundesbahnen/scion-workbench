/*
 * Copyright (c) 2018 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 *  SPDX-License-Identifier: EPL-2.0
 */

import { Component, Inject, Injector, OnDestroy, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Subject } from 'rxjs';
import { distinctUntilChanged, takeUntil } from 'rxjs/operators';
import { ACTIVITY_ACTION, ACTIVITY_ACTION_PROVIDER, ACTIVITY_CAPABILITY_ROUTE_DATA_KEY, ActivityActionProvider } from './metadata';
import { Activity, Disposable, WorkbenchActivityPartService } from '@scion/workbench';
import { PortalInjector } from '@angular/cdk/portal';
import { coerceNumberProperty } from '@angular/cdk/coercion';
import { ApplicationRegistry } from '../core/application-registry.service';
import { MessageBus } from '../core/message-bus.service';
import { Url } from '../core/url.util';
import { Defined } from '../core/defined.util';
import { AppOutletDirective } from '../core/app-outlet.directive';
import { ActivityAction, ActivityCapability, ActivityHostMessageTypes, ActivityProperties, HostMessage, MessageEnvelope } from '@scion/workbench-application-platform.api';
import { Arrays } from '../core/array.util';

/**
 * Provides an outlet to render the application as described by {ActivityCapability} in a workbench activity.
 */
@Component({
  selector: 'wap-activity-outlet',
  templateUrl: './activity-outlet.component.html',
  styleUrls: ['./activity-outlet.component.scss'],
})
export class ActivityOutletComponent implements OnDestroy {

  private _destroy$ = new Subject<void>();
  private _whenAppOutlet: Promise<AppOutletDirective>;
  private _appOutletResolveFn: (appOutlet: AppOutletDirective) => void;

  public siteUrl: string;
  public siteCssClasses: string[];
  public symbolicName: string;

  private _activity: Activity;
  private _actionDisposeMap = new Map<string, Disposable>();

  @ViewChild(AppOutletDirective, {static: true})
  public set setAppOutlet(appOutlet: AppOutletDirective) {
    this._appOutletResolveFn(appOutlet);
  }

  constructor(route: ActivatedRoute,
              applicationRegistry: ApplicationRegistry,
              private _messageBus: MessageBus,
              private _injector: Injector,
              activityService: WorkbenchActivityPartService,
              @Inject(ACTIVITY_ACTION_PROVIDER) private _activityActionProviders: ActivityActionProvider[]) {
    const activityCapability = route.snapshot.data[ACTIVITY_CAPABILITY_ROUTE_DATA_KEY] as ActivityCapability;
    this._activity = activityService.getActivityFromRoutingContext(route.snapshot);
    this._whenAppOutlet = new Promise<AppOutletDirective>(resolve => this._appOutletResolveFn = resolve); // tslint:disable-line:typedef
    this.symbolicName = activityCapability.metadata.symbolicAppName;
    const application = applicationRegistry.getApplication(this.symbolicName);

    // Listen for the activity active state and post it to the site
    this._activity.active$
      .pipe(
        distinctUntilChanged(),
        takeUntil(this._destroy$),
      )
      .subscribe((active: boolean) => {
        this._whenAppOutlet.then(appOutlet => appOutlet.postHostMessage({type: ActivityHostMessageTypes.Active, payload: active}));
      });

    this.siteUrl = Url.createUrl({
      base: application.baseUrl,
      path: Url.toSegments(activityCapability.properties.path),
      matrixParams: activityCapability.properties.matrixParams,
      queryParams: activityCapability.properties.queryParams,
    });
    this.siteCssClasses = [`e2e-${this.symbolicName}`, 'e2e-activity', ...Arrays.from(this._activity.cssClass)];
  }

  public onHostMessage(envelope: MessageEnvelope<HostMessage>): void {
    switch (envelope.message.type) {
      case ActivityHostMessageTypes.PropertiesWrite: {
        const properties: ActivityProperties = envelope.message.payload;
        this._activity.title = Defined.orElse(properties.title, this._activity.title);
        this._activity.cssClass = Defined.orElse(properties.cssClass, this._activity.cssClass);
        this._activity.itemText = Defined.orElse(properties.itemText, this._activity.itemText);
        this._activity.itemCssClass = Defined.orElse(properties.itemCssClass, this._activity.itemCssClass);
        this._activity.panelWidthDelta = Defined.orElse(coerceNumberProperty(properties.panelWidthDelta), this._activity.panelWidthDelta);
        break;
      }
      case ActivityHostMessageTypes.PropertiesRead: {
        const properties: ActivityProperties = {
          title: this._activity.title,
          cssClass: this._activity.cssClass,
          itemText: this._activity.itemText,
          itemCssClass: this._activity.itemCssClass,
          panelWidthDelta: this._activity.panelWidthDelta,
        };
        this._messageBus.publishReply(properties, this.symbolicName, envelope.replyToUid);
        break;
      }
      case ActivityHostMessageTypes.ActionAdd: {
        const action: ActivityAction = envelope.message.payload;
        const actionProvider = this._activityActionProviders.find(provider => provider.type === action.type);
        if (!actionProvider) {
          this._whenAppOutlet.then(appOutlet => appOutlet.postHostError(`[ActivityActionAddError] No provider for action '${action.type}'`));
          break;
        }

        action.metadata.symbolicAppName = this.symbolicName;
        const injectionTokens = new WeakMap();
        injectionTokens.set(ACTIVITY_ACTION, action);
        const injector = new PortalInjector(this._injector, injectionTokens);
        this._actionDisposeMap.set(action.metadata.id, this._activity.registerAction(actionProvider.component, injector));
        break;
      }
      case ActivityHostMessageTypes.ActionRemove: {
        const actionId = envelope.message.payload;
        const action = this._actionDisposeMap.get(actionId);
        if (!action) {
          this._whenAppOutlet.then(appOutlet => appOutlet.postHostError(`[ActivityActionRemoveError] Action not added to activity`));
          break;
        }
        action.dispose();
        this._actionDisposeMap.delete(actionId);
        break;
      }
      default: {
        throw Error(`[IllegalHostMessageError]: Unknown host message type [type='${envelope.message.type}'].`);
      }
    }
  }

  public ngOnDestroy(): void {
    this._destroy$.next();
  }
}
