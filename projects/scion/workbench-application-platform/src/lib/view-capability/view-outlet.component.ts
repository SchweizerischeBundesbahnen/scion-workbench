/*
 * Copyright (c) 2018 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 *  SPDX-License-Identifier: EPL-2.0
 */

import { ChangeDetectorRef, Component, OnDestroy, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { noop, Observable, Subject } from 'rxjs';
import { distinctUntilChanged, takeUntil } from 'rxjs/operators';
import { VIEW_CAPABILITY_ID_PARAM, VIEW_PATH_PARAM } from './metadata';
import { WbBeforeDestroy, WorkbenchView, } from '@scion/workbench';
import { ApplicationRegistry } from '../core/application-registry.service';
import { MessageBus } from '../core/message-bus.service';
import { Url } from '../core/url.util';
import { Defined } from '../core/defined.util';
import { AppOutletDirective } from '../core/app-outlet.directive';
import { ManifestRegistry } from '../core/manifest-registry.service';
import { Logger } from '../core/logger.service';
import { HostMessage, MessageEnvelope, ViewCapability, ViewHostMessageTypes, ViewProperties } from '@scion/workbench-application-platform.api';

/**
 * Provides an outlet to render the application as described by {ViewCapability} in a workbench view.
 */
@Component({
  selector: 'wap-view-outlet',
  templateUrl: './view-outlet.component.html',
  styleUrls: ['./view-outlet.component.scss']
})
export class ViewOutletComponent implements OnDestroy, WbBeforeDestroy {

  private _destroy$ = new Subject<void>();
  private _useDestroyNotifier = false;

  private _whenAppOutlet: Promise<AppOutletDirective>;
  private _appOutletResolveFn: (appOutlet: AppOutletDirective) => void;

  private _whenConstructed: Promise<void>;
  private _constructedResolveFn: () => void;

  public siteUrl: string;
  public siteCssClasses: string[];
  public symbolicName: string;

  @ViewChild(AppOutletDirective)
  public set setAppOutlet(appOutlet: AppOutletDirective) {
    appOutlet && this._appOutletResolveFn(appOutlet);
  }

  constructor(route: ActivatedRoute,
              applicationRegistry: ApplicationRegistry,
              manifestRegistry: ManifestRegistry,
              cd: ChangeDetectorRef,
              private _messageBus: MessageBus,
              private _view: WorkbenchView,
              logger: Logger) {
    this._whenAppOutlet = new Promise<AppOutletDirective>(resolve => this._appOutletResolveFn = resolve); // tslint:disable-line:typedef
    this._whenConstructed = new Promise<void>(resolve => this._constructedResolveFn = resolve); // tslint:disable-line:typedef

    // Listen for the view active state and post it to the site
    this._view.active$
      .pipe(
        distinctUntilChanged(),
        takeUntil(this._destroy$)
      )
      .subscribe((active: boolean) => {
        this._whenAppOutlet.then(appOutlet => appOutlet.postHostMessage({type: ViewHostMessageTypes.Active, payload: active}));
      });

    // Listen for route params and compute the site URL
    route.params
      .pipe(takeUntil(this._destroy$))
      .subscribe(params => {
        const capabilityId = params[VIEW_CAPABILITY_ID_PARAM];
        const viewCapability: ViewCapability = manifestRegistry.getCapability(capabilityId);
        if (!viewCapability) {
          logger.warn(`View capability ${capabilityId} not found. Maybe, the providing application is not available, the capability not provided anymore, or its qualifier has changed.`);
          this._whenConstructed.then(() => this._view.close());
          return;
        }

        this.symbolicName = viewCapability.metadata.symbolicAppName;
        const application = applicationRegistry.getApplication(this.symbolicName);
        this.initializeView(viewCapability);

        const {matrixParams, queryParams} = Url.readMatrixParamObject(params);
        this.siteUrl = Url.createUrl({
          base: application.baseUrl,
          path: Url.toSegments(params[VIEW_PATH_PARAM]),
          matrixParams: matrixParams,
          queryParams: queryParams,
        });
        this.siteCssClasses = [`e2e-${this.symbolicName}`, 'e2e-view', ...this._view.cssClasses];

        // If this view is not active (e.g. after a page reload), it is not mounted to the DOM.
        // To still load the application (e.g. to initialize and provide view properties), trigger a manual change detection cycle.
        this._whenConstructed.then(() => !this._view.active && cd.detectChanges());
      });

    // Resolve 'whenConstructed' promise after this component is constructed
    setTimeout(() => this._constructedResolveFn());
  }

  private initializeView(viewCapability: ViewCapability): void {
    this._view.title = viewCapability.properties.title;
    this._view.heading = viewCapability.properties.heading;
    this._view.cssClass = viewCapability.properties.cssClass;
    this._view.closable = Defined.orElse(viewCapability.properties.closable, true);
  }

  public onHostMessage(envelope: MessageEnvelope<HostMessage>): void {
    switch (envelope.message.type) {
      case ViewHostMessageTypes.PropertiesWrite: {
        const properties: ViewProperties = envelope.message.payload;
        this._view.title = Defined.orElse(properties.title, this._view.title);
        this._view.heading = Defined.orElse(properties.heading, this._view.heading);
        this._view.closable = Defined.orElse(properties.closable, this._view.closable);
        this._view.dirty = Defined.orElse(properties.dirty, this._view.dirty);
        this._useDestroyNotifier = Defined.orElse(properties.useDestroyNotifier, this._useDestroyNotifier);
        break;
      }
      case ViewHostMessageTypes.PropertiesRead: {
        const properties: ViewProperties = {
          title: this._view.title,
          heading: this._view.heading,
          closable: this._view.closable,
          dirty: this._view.dirty,
        };
        this._messageBus.publishReply(properties, this.symbolicName, envelope.replyToUid);
        break;
      }
      case ViewHostMessageTypes.Close: {
        this._view.close().then(noop);
        break;
      }
      default: {
        throw Error(`[IllegalHostMessageError]: Unknown host message type [type='${envelope.message.type}'].`);
      }
    }
  }

  public wbBeforeDestroy(): Observable<boolean> | Promise<boolean> | boolean {
    if (!this._useDestroyNotifier) {
      return true;
    }

    return this._whenAppOutlet.then(appOutlet => appOutlet.requestReply<boolean>({type: ViewHostMessageTypes.BeforeDestroy}));
  }

  public ngOnDestroy(): void {
    this._destroy$.next();
  }
}
