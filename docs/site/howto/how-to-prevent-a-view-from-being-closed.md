<a href="/README.md"><img src="/docs/branding/scion-workbench-banner.svg" height="50" alt="SCION Workbench"></a>

| SCION Workbench | [Projects Overview][menu-projects-overview] | [Changelog][menu-changelog] | [Contributing][menu-contributing] | [Sponsoring][menu-sponsoring] |  
| --- | --- | --- | --- | --- |

## [SCION Workbench][menu-home] > [How To Guides][menu-how-to] > View

#### How to prevent a view from being closed

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

[menu-how-to]: /docs/site/howto/how-to.md

[menu-home]: /README.md
[menu-projects-overview]: /docs/site/projects-overview.md
[menu-changelog]: /docs/site/changelog/changelog.md
[menu-contributing]: /CONTRIBUTING.md
[menu-sponsoring]: /docs/site/sponsoring.md
