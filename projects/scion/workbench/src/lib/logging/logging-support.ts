/*
 * Copyright (c) 2018-2023 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 */

import {EnvironmentProviders, makeEnvironmentProviders, Provider, Type} from '@angular/core';
import {WorkbenchModuleConfig} from '../workbench-module-config';
import {LogAppender, LogLevel} from './logging.model';
import {ConsoleAppender} from './console-appender.service';

/**
 * Provides a set of DI providers for installing workbench logging.
 */
export function provideLogging(workbenchModuleConfig: WorkbenchModuleConfig): EnvironmentProviders {
  const logAppenders: Type<LogAppender>[] = workbenchModuleConfig.logging?.logAppenders || [ConsoleAppender];
  return makeEnvironmentProviders([
    {
      provide: LogLevel,
      useValue: workbenchModuleConfig.logging?.logLevel ?? LogLevel.INFO,
    },
    logAppenders.map((logAppender: Type<LogAppender>): Provider => {
      return {
        provide: LogAppender,
        multi: true,
        useClass: logAppender,
      };
    }),
  ]);
}
