import { Application, ApplicationRegistry, Beans, ManifestRegistry, MessageClient, MessageHeaders, PreDestroy, takeUntilUnsubscribe, TopicMessage } from '@scion/microfrontend-platform';
import { CapabilityRegisterCommand, CapabilityUnregisterCommand, IntentRegisterCommand, IntentUnregisterCommand, Topics } from '../microfrontend-api';
import { map, mergeMap, switchMap, takeUntil } from 'rxjs/operators';
import { merge, of, Subject } from 'rxjs';

export class ManifestRequestHandler implements PreDestroy {

  private _destroy$ = new Subject<void>();

  constructor() {
    this.publishInstalledApplications();
    this.installCapabilityRegisterRequestHandler();
    this.installCapabilityUnregisterRequestHandler();
    this.installIntentRegisterRequestHandler();
    this.installIntentUnregisterRequestHandler();
    this.installCapabilitiesQueryRequestHandler();
    this.installIntentsQueryRequestHandler();
  }

  private publishInstalledApplications(): void {
    const applications: Application[] = Beans.get(ApplicationRegistry).getApplications();
    Beans.get(MessageClient).publish$(Topics.Applications, applications, {retain: true}).subscribe();
  }

  private installCapabilityRegisterRequestHandler(): void {
    Beans.get(MessageClient).observe$(Topics.RegisterCapability)
      .pipe(takeUntil(this._destroy$))
      .subscribe((request: TopicMessage<CapabilityRegisterCommand>) => {
        const appSymbolicName = request.headers.get(MessageHeaders.AppSymbolicName);
        Beans.get(ManifestRegistry).registerCapability(appSymbolicName, [request.body.capability]);
      });
  }

  private installCapabilityUnregisterRequestHandler(): void {
    Beans.get(MessageClient).observe$(Topics.UnregisterCapability)
      .pipe(takeUntil(this._destroy$))
      .subscribe((request: TopicMessage<CapabilityUnregisterCommand>) => {
        const appSymbolicName = request.headers.get(MessageHeaders.AppSymbolicName);
        Beans.get(ManifestRegistry).unregisterCapability(appSymbolicName, request.body.capabilityId);
      });
  }

  private installIntentRegisterRequestHandler(): void {
    Beans.get(MessageClient).observe$(Topics.RegisterIntent)
      .pipe(takeUntil(this._destroy$))
      .subscribe((request: TopicMessage<IntentRegisterCommand>) => {
        const appSymbolicName = request.headers.get(MessageHeaders.AppSymbolicName);
        Beans.get(ManifestRegistry).registerIntent(appSymbolicName, request.body.intent);
      });
  }

  private installIntentUnregisterRequestHandler(): void {
    Beans.get(MessageClient).observe$(Topics.UnregisterIntent)
      .pipe(takeUntil(this._destroy$))
      .subscribe((request: TopicMessage<IntentUnregisterCommand>) => {
        const appSymbolicName = request.headers.get(MessageHeaders.AppSymbolicName);
        Beans.get(ManifestRegistry).unregisterIntent(appSymbolicName, request.body.intentId);
      });
  }

  private installCapabilitiesQueryRequestHandler(): void {
    Beans.get(MessageClient).observe$<void>(Topics.Capabilities)
      .pipe(
        mergeMap((request: TopicMessage<void>) => {
          const manifestRegistry = Beans.get(ManifestRegistry);
          const replyTo = request.headers.get(MessageHeaders.ReplyTo);
          const appSymbolicName = request.headers.get(MessageHeaders.AppSymbolicName);

          return merge(of(null), manifestRegistry.capabilityChange$)
            .pipe(
              map(() => manifestRegistry.getCapabilitiesByApplication(appSymbolicName)),
              switchMap(capabilities => Beans.get(MessageClient).publish$(replyTo, capabilities)),
              takeUntilUnsubscribe(replyTo),
            );
        }),
        takeUntil(this._destroy$),
      )
      .subscribe();
  }

  private installIntentsQueryRequestHandler(): void {
    Beans.get(MessageClient).observe$<void>(Topics.Intents)
      .pipe(mergeMap((request: TopicMessage<void>) => {
          const manifestRegistry = Beans.get(ManifestRegistry);
          const replyTo = request.headers.get(MessageHeaders.ReplyTo);
          const appSymbolicName = request.headers.get(MessageHeaders.AppSymbolicName);

          return merge(of(null), manifestRegistry.intentChange$)
            .pipe(
              map(() => manifestRegistry.getIntentsByApplication(appSymbolicName)),
              switchMap(intents => Beans.get(MessageClient).publish$(replyTo, intents)),
              takeUntilUnsubscribe(replyTo),
            );
        }),
        takeUntil(this._destroy$),
      )
      .subscribe();
  }

  public preDestroy(): void {
    this._destroy$.next();
  }
}
