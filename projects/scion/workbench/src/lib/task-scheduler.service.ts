import { Injectable, NgZone } from '@angular/core';

/**
 * Allows scheduling tasks in micro or macro task queue.
 *
 * Whenever the call stack is cleared, all microtasks are executed first. Then, when no microtask is queued anymore,
 * the next task is picked from the macrotask queue, and so on.
 */
@Injectable()
export class TaskScheduler {

  constructor(private _ngZone: NgZone) {
  }

  /**
   * Schedules given task on the micro task queue.
   */
  public scheduleMicrotask(fn: () => void, runInsideAngular: boolean = true): void {
    const microtaskFn = (): void => {
      Promise.resolve().then(() => fn());
    };

    if (runInsideAngular && !NgZone.isInAngularZone()) {
      this._ngZone.run(microtaskFn);
    }
    else if (!runInsideAngular && NgZone.isInAngularZone()) {
      this._ngZone.runOutsideAngular(microtaskFn);
    }
    else {
      microtaskFn();
    }
  }

  /**
   * Schedules given task on the macro task queue.
   */
  public scheduleMacrotask(fn: () => void, runInsideAngular: boolean = true): void {
    const macrotraskFn = (): void => {
      setTimeout(() => fn());
    };

    if (runInsideAngular && !NgZone.isInAngularZone()) {
      this._ngZone.run(macrotraskFn);
    }
    else if (!runInsideAngular && NgZone.isInAngularZone()) {
      this._ngZone.runOutsideAngular(macrotraskFn);
    }
    else {
      macrotraskFn();
    }
  }
}
