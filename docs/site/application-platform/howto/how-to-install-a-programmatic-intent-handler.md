<a href="/docs/site/application-platform/README.md"><img src="/docs/branding/scion-workbench-banner.svg" height="50" alt="SCION Workbench Application Platform"></a>

| SCION Workbench Application Platform | [Projects Overview][menu-projects-overview] | [Changelog][menu-changelog] | [Contributing][menu-contributing] | [Sponsoring][menu-sponsoring] |  
| --- | --- | --- | --- | --- |

## [SCION Workbench Application Platform][menu-home] > [How To Guides][menu-how-to] > Intent Handler

#### How to install a programmatic intent handler

The platform allows handling intents in the host application. It is like providing a capability in a sub-application, but in the host application.

Open `app.module.ts` and register the intent handler as multi provider under DI injection `INTENT_HANDLER`

```typescript
@NgModule({
  providers: [
    {provide: INTENT_HANDLER, useClass: CustomIntentHandler, multi: true}, ➀
  ]
})
export class HostApp {
}
```
|#|Explanation|
|-|-|
|➀|Registers the handler as multi provider under DI injection `INTENT_HANDLER`.|

In the handler class, implement the interface `IntentHandler`. Set `type` and `qualifier` coordinates to control which intents to handle in this handler.

```typescript
@Injectable()
export class CustomIntentHandler implements IntentHandler {

  public readonly type = '...'; ➀
  public readonly qualifier: Qualifier = {...}; ➁

  public readonly description = '...'; ➂

  public onInit(applicationRegistry: ApplicationRegistry, manifestRegistry: ManifestRegistry): void {
    ... ➃
  }

  public onIntent(envelope: MessageEnvelope<IntentMessage>): void {
    ... ➄
  }
}
```
|#|Explanation|
|-|-|
|➀|Sets the type of functionality which this handler provides, e.g. 'auth-token' to reply with the auth-token.|
|➁|Sets the qualifier which intents must have to be handled. If not set, `NilQualifier` is used.|
|➂|Describes the capability this handler provides.|
|➃|Optional lifecycle hook that is called after the platform completed registration of applications.<br>Use this method to handle any initialization tasks which require the application or manifest registry.|
|➄|Method invoked upon the receipt of an intent.|

#### How to issue intents to the programmatic intent handler

On how to interact with your own intent handler from the client application, see [How to issue a custom intent](docs/site/application-platform/howto/how-to-issue-custom-intent.mdm/howto/how-to-issue-custom-intent.md)

[menu-how-to]: /docs/site/application-platform/howto/how-to.md

[menu-home]: /docs/site/application-platform/README.md
[menu-projects-overview]: /docs/site/projects-overview.md
[menu-changelog]: /docs/site/changelog/changelog.md
[menu-contributing]: /CONTRIBUTING.md
[menu-sponsoring]: /docs/site/sponsoring.md
