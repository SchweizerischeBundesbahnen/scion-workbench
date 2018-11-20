![SCION Workbench](/resources/site/logo/scion-workbench-banner.png)

[Overview][menu-overview] | [Workbench][menu-workbench] | [Workbench&nbsp;Application&nbsp;Platform][menu-workbench-application-platform] | [Contributing][menu-contributing] | [Changelog][menu-changelog] | [Sponsoring][menu-sponsoring] | [Links][menu-links]
|---|---|---|---|---|---|---|

## How to install a custom error handler 

When issuing an intent for a capability which no application provides, or if missing the required intent in the manifest, by default, the platform shows an error notification to the user.
The notifications is rather technical and in English language.

To show some more user-friendly information to the user, you can replace the default error handler as follows:

Open `app.module.ts` and register a custom error handler when importing `WorkbenchApplicationPlatformModule`:

```typescript
@NgModule({
  imports: [
    WorkbenchModule.forRoot(),
    WorkbenchApplicationPlatformModule.forRoot({
      errorHandler: CustomErrorHandler, ➀
      applicationConfig: [...]
    }),
  ]
})
export class HostAppModule {
}

```
|#|Explanation|
|-|-|
|➀|Registers a custom error handler.|

Implement `ErrorHandler` as follows: 

```typescript
@Injectable()
export class CustomErrorHandler implements ErrorHandler {

  /**
   * Method invoked if no application is found to provide a capability of that kind.
   */
  public handleNullProviderError?(application: string, type: string, qualifier: Qualifier, message: string): void {
    ...
  }

  /**
   * Method invoked if the application is not qualified to publish intents of that kind.
   */
  public handleNotQualifiedIntentMessageError?(application: string, type: string, qualifier: Qualifier, message: string): void {
    ...
  }
}
```

[menu-overview]: /README.md
[menu-workbench]: /resources/site/workbench.md
[menu-workbench-application-platform]: /resources/site/workbench-application-platform.md
[menu-contributing]: /CONTRIBUTING.md
[menu-changelog]: /resources/site/changelog.md
[menu-sponsoring]: /resources/site/sponsors.md
[menu-links]: /resources/site/links.md