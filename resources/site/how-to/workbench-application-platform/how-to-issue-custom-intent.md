![SCION Workbench](/resources/site/logo/scion-workbench-banner.png)

[Overview][menu-overview] | [Workbench][menu-workbench] | [Workbench&nbsp;Application&nbsp;Platform][menu-workbench-application-platform] | [Contributing][menu-contributing] | [Changelog][menu-changelog] | [Sponsoring][menu-sponsoring] | [Links][menu-links]
|---|---|---|---|---|---|---|

## How to issue a custom intent

The workbench application platform provides an API to register [programmatic intent handlers](how-to-install-a-programmatic-intent-handler.md) in the host application. 
A child application can then use the `IntentService` to issue a respective intent by providing the intents type and qualifier if any. Also, you can provide a payload if required by the other side. As those intents are generic, a client has to know what qualifier and payload he has to provide and what the response will be.

The `IntentService` provides two methods:

|method|description|
|-|-|
|issueIntent$|This method issues an intent to the platform and returns a stream of replies. The response type has to be provided by the caller (see the example below)|
|issueIntent|This method issues an intent without expecting a reply (fire & forget)|

### Example with stream of replies
```typescript
constructor(private _intentService: IntentService) { } 

public onIssueIntent(): void {
   this.result$ = this._intentService.issueIntent$<string>('my-type', {'entity': 'example'}, 'my-payload')
   .pipe(
     takeUntil(this._$destroy) // the client has to cleanup his subscription onDestroy
   )
}
```

### Example with exactly one response
```typescript
constructor(private _intentService: IntentService) { } 

public onIssueIntent(): void {
   this.result$ = this._intentService.issueIntent$<string>('my-type', {'entity': 'example'}, 'my-payload')
    .pipe(
      first() // as the client knows that only one reply will be sent, he can terminate the subscription immediately
    )
}
```

> For non Angular applications, get the intent service via `Platform.getService(IntentService)`.

[menu-overview]: /README.md
[menu-workbench]: /resources/site/workbench.md
[menu-workbench-application-platform]: /resources/site/workbench-application-platform.md
[menu-contributing]: /CONTRIBUTING.md
[menu-changelog]: /resources/site/changelog.md
[menu-sponsoring]: /resources/site/sponsors.md
[menu-links]: /resources/site/links.md
