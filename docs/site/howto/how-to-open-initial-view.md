<a href="/README.md"><img src="/resources/branding/scion-workbench-banner.svg" height="50" alt="SCION Workbench"></a>

| SCION Workbench | [Projects Overview][menu-projects-overview] | [Changelog][menu-changelog] | [Contributing][menu-contributing] | [Sponsoring][menu-sponsoring] |  
| --- | --- | --- | --- | --- |

## [SCION Workbench][menu-home] > [How To Guides][menu-how-to] > View

### How to open an initial view in the main area
The workbench supports listening for the opened views. If the number of views is zero or drops to zero, perform a navigation to open the initial view. Also, consider configuring the initial view as non-closable.

```ts
@Component({selector: 'app-root'})
export class AppComponent {

  constructor(workbenchService: WorkbenchService, wbRouter: WorkbenchRouter) {
    workbenchService.views$
      .pipe(takeUntilDestroyed())
      .subscribe(views => {
        if (views.length === 0) {
          wbRouter.navigate(['path/to/view']);
        }
      });
  }
}
```

[menu-how-to]: /docs/site/howto/how-to.md

[menu-home]: /README.md
[menu-projects-overview]: /docs/site/projects-overview.md
[menu-changelog]: /docs/site/changelog.md
[menu-contributing]: /CONTRIBUTING.md
[menu-sponsoring]: /docs/site/sponsoring.md
