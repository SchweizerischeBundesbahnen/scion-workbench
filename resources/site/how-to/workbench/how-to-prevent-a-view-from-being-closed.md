![SCION Workbench](/resources/site/logo/scion-workbench-banner.png)

[Overview][menu-overview] | [Workbench][menu-workbench] | [Workbench&nbsp;Application&nbsp;Platform][menu-workbench-application-platform] | [Contributing][menu-contributing] | [Changelog][menu-changelog] | [Sponsoring][menu-sponsoring] | [Links][menu-links]
|---|---|---|---|---|---|---|

## How to prevent a view from being closed

Closing of a view can be intercepted by implementing `WbBeforeDestroy` lifecycle hook. In `wbBeforeDestroy` method, which is invoked when the view is about to be closed, control closing by returning a truthy or falsy value directly, or via `Observable` or `Promise`.

The following snippet asks the user whether to save changes.

```typescript 
@Component({...})
export class PersonComponent implements WbBeforeDestroy {

  constructor(private messageBoxService: MessageBoxService) {
  }

  public wbBeforeDestroy(): Observable<boolean> | Promise<boolean> | boolean {
    return this.messageBoxService.open({
      content: 'Do you want to save changes?',
      severity: 'info',
      actions: {
        yes: 'Yes',
        no: 'No',
        cancel: 'Cancel'
      }      
    }).then(action => {
      switch (action) {
        case 'yes':
          return this.persist$().toPromise();
        case 'no':
          return true;
        case 'cancel':
          return false;
      }
    });
  }

  private persist$(): Observable<boolean> {
    return ...;
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