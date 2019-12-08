import { Application, ApplicationRegistry, Beans, ManifestRegistry, MessageClient, PreDestroy, takeUntilUnsubscribe, TopicMessage } from '@scion/microfrontend-platform';
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
        const command = request.payload;
        Beans.get(ManifestRegistry).registerCapability(command.symbolicAppName, [command.capability]);
      });
  }

  private installCapabilityUnregisterRequestHandler(): void {
    Beans.get(MessageClient).observe$(Topics.UnregisterCapability)
      .pipe(takeUntil(this._destroy$))
      .subscribe((request: TopicMessage<CapabilityUnregisterCommand>) => {
        const command = request.payload;
        Beans.get(ManifestRegistry).unregisterCapability(command.symbolicAppName, command.capabilityId);
      });
  }

  private installIntentRegisterRequestHandler(): void {
    Beans.get(MessageClient).observe$(Topics.RegisterIntent)
      .pipe(takeUntil(this._destroy$))
      .subscribe((request: TopicMessage<IntentRegisterCommand>) => {
        const command = request.payload;
        Beans.get(ManifestRegistry).registerIntent(command.symbolicAppName, command.intent);
      });
  }

  private installIntentUnregisterRequestHandler(): void {
    Beans.get(MessageClient).observe$(Topics.UnregisterIntent)
      .pipe(takeUntil(this._destroy$))
      .subscribe((request: TopicMessage<IntentUnregisterCommand>) => {
        const command = request.payload;
        Beans.get(ManifestRegistry).unregisterIntent(command.symbolicAppName, command.intentId);
      });
  }

  private installCapabilitiesQueryRequestHandler(): void {
    Beans.get(MessageClient).observe$(Topics.Capabilities)
      .pipe(
        mergeMap((request: TopicMessage<string>) => {
          const symbolicAppName = request.payload;
          const manifestRegistry = Beans.get(ManifestRegistry);

          return merge(of(null), manifestRegistry.capabilityChange$)
            .pipe(
              map(() => manifestRegistry.getCapabilitiesByApplication(symbolicAppName)),
              switchMap(capabilities => Beans.get(MessageClient).publish$(request.replyTo, capabilities)),
              takeUntilUnsubscribe(request.replyTo),
            );
        }),
        takeUntil(this._destroy$),
      )
      .subscribe();
  }

  private installIntentsQueryRequestHandler(): void {
    Beans.get(MessageClient).observe$(Topics.Intents)
      .pipe(mergeMap((request: TopicMessage<string>) => {
          const symbolicAppName = request.payload;
          const manifestRegistry = Beans.get(ManifestRegistry);

          return merge(of(null), manifestRegistry.intentChange$)
            .pipe(
              map(() => manifestRegistry.getIntentsByApplication(symbolicAppName)),
              switchMap(intents => Beans.get(MessageClient).publish$(request.replyTo, intents)),
              takeUntilUnsubscribe(request.replyTo),
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
