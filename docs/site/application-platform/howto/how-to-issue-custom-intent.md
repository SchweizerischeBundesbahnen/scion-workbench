<a href="/docs/site/application-platform/README.md"><img src="/resources/branding/scion-workbench-banner.svg" height="50" alt="SCION Workbench Application Platform"></a>

| SCION Workbench Application Platform | [Projects Overview][menu-projects-overview] | [Changelog][menu-changelog] | [Contributing][menu-contributing] | [Sponsoring][menu-sponsoring] |  
| --- | --- | --- | --- | --- |

## [SCION Workbench Application Platform][menu-home] > [How To Guides][menu-how-to] > Intent

#### How to issue a custom intent

The workbench application platform provides an API to register [programmatic intent handlers](docs/site/application-platform/howto/how-to-install-a-programmatic-intent-handler.md) in the host application. 
A child application can then use the `IntentService` to issue a respective intent by providing the intent's type and qualifier if any. Additionally, you can provide a payload if expected by the handler. If the intent handler responds to the intent, the service allows receiving one or more responses.

The `IntentService` provides following methods:

|method|description|
|-|-|
|issueIntent$|Issues an intent to the platform and receives a series of replies|
|issueIntent|Issues an intent without expecting a reply (fire & forget)|

In the component to issue the intent, inject `IntentService` and issue the intent. For non Angular applications, get the intent service via `Platform.getService(IntentService)`.

##### Example how to issue an intent
```typescript 
const qualifier: Qualifier = {'entity': 'example'};
intentService.issueIntent('intent-type', qualifier, 'intent-payload');
```

##### Example how to issue an intent and receive a series of replies
```typescript 
const qualifier: Qualifier = {'entity': 'example'};
const response$ = intentService.issueIntent$<string>('intent-type', qualifier, 'intent-payload')
  .pipe(takeUntil(this.$destroy)); // the client has to cleanup its subscription on destruction
```

##### Example how to issue an intent and receive a single reply
```typescript
const qualifier: Qualifier = {'entity': 'example'};
const response$ = intentService.issueIntent$<string>('intent-type', qualifier, 'intent-payload')
  .pipe(first(), takeUntil(this.$destroy)); // the client unsubscribes upon the receipt of the first reply
```

[menu-how-to]: /docs/site/application-platform/howto/how-to.md

[menu-home]: /docs/site/application-platform/README.md
[menu-projects-overview]: /docs/site/projects-overview.md
[menu-changelog]: /docs/site/changelog/changelog.md
[menu-contributing]: /CONTRIBUTING.md
[menu-sponsoring]: /docs/site/sponsoring.md
