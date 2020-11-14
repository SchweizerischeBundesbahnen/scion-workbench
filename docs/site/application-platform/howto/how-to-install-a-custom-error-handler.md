<a href="/docs/site/application-platform/README.md"><img src="/resources/branding/scion-workbench-banner.svg" height="50" alt="SCION Workbench Application Platform"></a>

| SCION Workbench Application Platform | [Projects Overview][menu-projects-overview] | [Changelog][menu-changelog] | [Contributing][menu-contributing] | [Sponsoring][menu-sponsoring] |  
| --- | --- | --- | --- | --- |

## [SCION Workbench Application Platform][menu-home] > [How To Guides][menu-how-to] > Error Handling

#### How to install a custom error handler 

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

[menu-how-to]: /docs/site/application-platform/howto/how-to.md

[menu-home]: /docs/site/application-platform/README.md
[menu-projects-overview]: https://github.com/SchweizerischeBundesbahnen/scion-workbench/blob/master/docs/site/projects-overview.md
[menu-changelog]: https://github.com/SchweizerischeBundesbahnen/scion-workbench/blob/master/docs/site/changelog/changelog.md
[menu-contributing]: https://github.com/SchweizerischeBundesbahnen/scion-workbench/blob/master/CONTRIBUTING.md
[menu-sponsoring]: https://github.com/SchweizerischeBundesbahnen/scion-workbench/blob/master/docs/site/sponsoring.md
