import { BehaviorSubject, Observable } from 'rxjs';
import { filter, mapTo, take } from 'rxjs/operators';

/**
 * Allows observing the state of the microfrontend platform.
 */
export class MicrofrontendPlatformState {

  private _state$ = new BehaviorSubject<PlatformStates>(PlatformStates.Stopped);

  /**
   * @return the current platform state.
   */
  public get state(): PlatformStates {
    return this._state$.getValue();
  }

  /**
   * @param  state
   *         the state to wait for.
   * @return A promise that resolves when the platform enters the given state.
   *         If already in that state, the promise resolve instantly.
   */
  public whenState(state: PlatformStates): Promise<void> {
    return this._state$
      .pipe(
        filter(it => it === state),
        mapTo(undefined),
        take(1),
      ).toPromise();
  }

  /**
   * @return An Observable that, when subscribed, emits the current platform state.
   *         It never completes and emits continuously when the state changes.
   */
  public get state$(): Observable<PlatformStates> {
    return this._state$;
  }

  /** @internal **/
  public enterState(newState: PlatformStates): void {
    if (newState === PlatformStates.Starting && this.state === PlatformStates.Starting) {
      throw Error('[PlatformStateError] Microfrontend platform is already starting.');
    }
    if (newState === PlatformStates.Starting && this.state === PlatformStates.Started) {
      throw Error('[PlatformStateError] Microfrontend platform is already started.');
    }
    this._state$.next(newState);
  }
}

/**
 * Represents states of the microfrontend platform.
 */
export enum PlatformStates {
  /**
   * Indicates that the platform is not yet started.
   */
  Stopped,
  /**
   * Indicates that the platform is about to start.
   */
  Starting,
  /**
   * Indicates that the platform started.
   */
  Started
}
