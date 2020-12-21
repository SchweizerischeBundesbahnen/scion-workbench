/*
 * Copyright (c) 2018-2019 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 *  SPDX-License-Identifier: EPL-2.0
 */

import { Injectable } from '@angular/core';

/**
 * Set of log levels to control logging output.
 */
export enum LogLevel {
  DEBUG, INFO, WARN, ERROR
}

/**
 * Provides information about a message to be logged.
 */
export interface LogEvent {
  /**
   * Severity of the message.
   */
  level: LogLevel;
  /**
   * Name of the logger used to log the message.
   */
  logger: string;
  /**
   * Supplies the message.
   */
  messageSupplier: () => string;
  /**
   * Arguments as passed to the logger.
   */
  args: any[];
}

/**
 * Delivers log events to a destination, e.g., writing logs to the console.
 */
@Injectable()
export abstract class LogAppender {

  /**
   * Each message to be logged is passed to this method in the form of a {@link LogEvent} object.
   */
  public abstract onLogMessage(event: LogEvent): void;
}

/**
 * Logger name to be used to log a message.
 *
 * Pass an instance of this class as the first argument to the logger when logging a message.
 */
export class LoggerName {

  constructor(private readonly _value: string) {
  }

  public toString(): string {
    return this._value;
  }
}
