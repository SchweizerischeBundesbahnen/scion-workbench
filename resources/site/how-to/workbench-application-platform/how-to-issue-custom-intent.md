![SCION Workbench](/resources/site/logo/scion-workbench-banner.png)

[Overview][menu-overview] | [Workbench][menu-workbench] | [Workbench&nbsp;Application&nbsp;Platform][menu-workbench-application-platform] | [Contributing][menu-contributing] | [Changelog][menu-changelog] | [Sponsoring][menu-sponsoring] | [Links][menu-links]
|---|---|---|---|---|---|---|

## How to issue a custom intent

The workbench application platform provides an API to register [programmatic intent handlers](how-to-install-a-programmatic-intent-handler.md) in the host application. 
A child application can then use the `IntentService` to issue a respective intent by providing the intent's type and qualifier if any. Additionally, you can provide a payload if expected by the handler. If the intent handler responds to the intent, the service allows receiving one or more responses.

The `IntentService` provides following methods:

|method|description|
|-|-|
|issueIntent$|Issues an intent to the platform and receives a series of replies|
|issueIntent|Issues an intent without expecting a reply (fire & forget)|

In the component to issue the intent, inject `IntentService` and issue the intent. For non Angular applications, get the intent service via `Platform.getService(IntentService)`.

### Example how to issue an intent
```typescript 
const qualifier: Qualifier = {'entity': 'example'};
intentService.issueIntent('intent-type', qualifier, 'intent-payload');
```

### Example how to issue an intent and receive a series of replies
```typescript 
const qualifier: Qualifier = {'entity': 'example'};
const response$ = intentService.issueIntent$<string>('intent-type', qualifier, 'intent-payload')
  .pipe(takeUntil(this.$destroy)); // the client has to cleanup its subscription on destruction
```

### Example how to issue an intent and receive a single reply
```typescript
const qualifier: Qualifier = {'entity': 'example'};
const response$ = intentService.issueIntent$<string>('intent-type', qualifier, 'intent-payload')
  .pipe(first(), takeUntil(this.$destroy)); // the client unsubscribes upon the receipt of the first reply
```

[menu-overview]: /README.md
[menu-workbench]: /resources/site/workbench.md
[menu-workbench-application-platform]: /resources/site/workbench-application-platform.md
[menu-contributing]: /CONTRIBUTING.md
[menu-changelog]: /resources/site/changelog.md
[menu-sponsoring]: /resources/site/sponsors.md
[menu-links]: /resources/site/links.md
