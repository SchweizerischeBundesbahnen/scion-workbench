![SCION Workbench](/resources/site/logo/scion-workbench-banner.png)

[Overview][menu-overview] | [Workbench][menu-workbench] | [Workbench&nbsp;Application&nbsp;Platform][menu-workbench-application-platform] | [Contributing][menu-contributing] | [Changelog][menu-changelog] | [Sponsoring][menu-sponsoring] | [Links][menu-links]
|---|---|---|---|---|---|---|

## How to install a programmatic intent handler

The platform allows handling intents in the host application. It is like providing a capability in a sub-application, but in the host application.

The handler can be configured to act as a proxy which the platform invokes only if some application provides a respective capability. For example, `ViewIntentHandler` is a proxy for view capabilities. Upon a view intent, the handler loads capability metadata from the application providing that view, reads the view path and opens the view via the workbench.

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

In the handler, implement the interface `IntentHandler`. Set `type` and `qualifier` coordinates to control which intents to handle in this handler.

```typescript
@Injectable()
export class CustomIntentHandler implements IntentHandler {

  public readonly type = '...'; ➀
  public readonly qualifier: Qualifier = {...}; ➁
  public readonly proxy = false; ➂

  public readonly description = '...'; ➃

  public onInit(applicationRegistry: ApplicationRegistry, manifestRegistry: ManifestRegistry): void {
    ... ➄
  }

  public onIntent(envelope: MessageEnvelope<IntentMessage>): void {
    ... ➅
  }
}
```
|#|Explanation|
|-|-|
|➀|Sets the type of functionality which this handler provides, e.g. 'auth-token' to reply with the auth-token.|
|➁|Sets the qualifier which intents must have to be handled. If not set, `NilQualifier` is used.|
|➂|Indicates if this handler acts as a proxy through which intents are processed, which is `false` by default.|
|➃|Describes the capability this handler provides.|
|➄|Optional lifecycle hook that is called after the platform completed registration of applications.<br>Use this method to handle any initialization tasks which require the application or manifest registry.|
|➅|Method invoked upon the receipt of an intent.|

[menu-overview]: /README.md
[menu-workbench]: /resources/site/workbench.md
[menu-workbench-application-platform]: /resources/site/workbench-application-platform.md
[menu-contributing]: /CONTRIBUTING.md
[menu-changelog]: /resources/site/changelog.md
[menu-sponsoring]: /resources/site/sponsors.md
[menu-links]: /resources/site/links.md