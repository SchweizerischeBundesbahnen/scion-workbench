/*
 * Copyright (c) 2018-2022 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 */

import {IntentClient, mapToBody, MessageClient, Qualifier, RequestError} from '@scion/microfrontend-platform';
import {Beans} from '@scion/toolkit/bean-manager';
import {WorkbenchView} from '../view/workbench-view';
import {WorkbenchCapabilities} from '../workbench-capabilities.enum';
import {Dictionaries, Dictionary, Maps} from '@scion/toolkit/util';
import {ɵWorkbenchCommands} from '../ɵworkbench-commands';
import {lastValueFrom} from 'rxjs';
import {Empty} from '../common/utility-types';
import {WorkbenchNavigationExtras, WorkbenchRouter} from './workbench-router';
import {PartId} from '../workbench.identifiers';

/**
 * @ignore
 * @docs-private Not public API. For internal use only.
 */
export class ɵWorkbenchRouter implements WorkbenchRouter {

  /** @inheritDoc */
  public async navigate(qualifier: Qualifier | Empty<Qualifier>, extras?: WorkbenchNavigationExtras): Promise<boolean> {
    if (this.isSelfNavigation(qualifier)) {
      return this.updateViewParams(extras);
    }
    else {
      return this.navigateView(qualifier, extras);
    }
  }

  private async navigateView(qualifier: Qualifier, extras?: WorkbenchNavigationExtras): Promise<boolean> {
    const command: ɵWorkbenchNavigateCommand = {
      target: extras?.target,
      partId: extras?.partId,
      activate: extras?.activate,
      close: extras?.close,
      position: extras?.position,
      cssClass: extras?.cssClass,
    };
    const navigate$ = Beans.get(IntentClient).request$<boolean>({type: WorkbenchCapabilities.View, qualifier, params: Maps.coerce(extras?.params)}, command);
    try {
      return await lastValueFrom(navigate$.pipe(mapToBody()));
    }
    catch (error) {
      throw (error instanceof RequestError ? error.message : error);
    }
  }

  private async updateViewParams(extras?: WorkbenchNavigationExtras): Promise<boolean> {
    const viewCapabilityId = Beans.get(WorkbenchView).snapshot.capability.metadata!.id;
    const command: ɵViewParamsUpdateCommand = {
      params: Dictionaries.coerce(extras?.params),
      paramsHandling: extras?.paramsHandling,
    };
    const updateParams$ = Beans.get(MessageClient).request$<boolean>(ɵWorkbenchCommands.viewParamsUpdateTopic(Beans.get(WorkbenchView).id, viewCapabilityId), command);
    try {
      return await lastValueFrom(updateParams$.pipe(mapToBody()));
    }
    catch (error) {
      throw (error instanceof RequestError ? error.message : error);
    }
  }

  private isSelfNavigation(qualifier: Qualifier | Empty<Qualifier>): boolean {
    if (Object.keys(qualifier).length === 0) {
      if (!Beans.opt(WorkbenchView)) {
        throw Error('[NavigateError] Self-navigation is supported only if in the context of a view.');
      }
      return true;
    }
    return false;
  }
}

/**
 * Command object to navigate a view.
 *
 * @docs-private Not public API. For internal use only.
 * @ignore
 */
export interface ɵWorkbenchNavigateCommand {
  target?: string | 'blank' | 'auto';
  partId?: PartId | string;
  activate?: boolean;
  close?: boolean;
  position?: number | 'start' | 'end' | 'before-active-view' | 'after-active-view';
  cssClass?: string | string[];
}

/**
 * Command object to update view params in self-navigation.
 *
 * @docs-private Not public API. For internal use only.
 * @ignore
 */
export interface ɵViewParamsUpdateCommand {
  /**
   * @see WorkbenchNavigationExtras#params
   */
  params: Dictionary;
  /**
   * @see WorkbenchNavigationExtras#paramsHandling
   */
  paramsHandling?: 'merge' | 'replace';
}
