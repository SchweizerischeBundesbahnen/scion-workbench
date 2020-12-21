import { Provider, Type } from '@angular/core';
import { WorkbenchModuleConfig } from '../workbench-module-config';
import { Logger, ɵLogger } from './logger';
import { LogAppender, LogLevel } from './logging.model';
import { ConsoleAppender } from './console-appender.service';

/**
 * Registers a set of DI providers for installing workbench logging.
 */
export function provideLogging(workbenchModuleConfig: WorkbenchModuleConfig): Provider[] {
  const logAppenders: Type<LogAppender>[] = workbenchModuleConfig.logging?.logAppenders || [ConsoleAppender];
  return [
    {
      provide: Logger,
      useClass: ɵLogger,
    },
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
  ];
}
