<a href="/README.md"><img src="/docs/branding/scion-workbench-banner.svg" height="50" alt="SCION Workbench"></a>

| SCION Workbench | [Projects Overview][menu-projects-overview] | [Changelog][menu-changelog] | [Contributing][menu-contributing] | [Sponsoring][menu-sponsoring] |  
| --- | --- | --- | --- | --- |

## [SCION Workbench][menu-home] > [How To Guides][menu-how-to] > View

#### How to set a title of a view tab
Title and heading of a view tab are set by the component currently displayed in the view. For that, inject `WorkbenchView` to get a handle to interact with the current view.

```typescript
@Component({...})
export class PersonComponent implements OnDestroy {

  private destroy$ = new Subject<void>();

  constructor(route: ActivatedRoute,
              view: WorkbenchView,
              personService: PersonService) {
    route.paramMap
      .pipe(
        map(paramMap => paramMap.get('id')),
        distinctUntilChanged(),
        switchMap(id => personService.person$(id)),
        takeUntil(this.destroy$)
      )
      .subscribe(person => {
        view.title = `${person.firstname} ${person.lastname}`;
        view.heading = 'Person';
      });
  }

  public ngOnDestroy(): void {
    this.destroy$.next();
  }
}
```

[menu-how-to]: /docs/site/howto/how-to.md

[menu-home]: /README.md
[menu-projects-overview]: /docs/site/projects-overview.md
[menu-changelog]: /docs/site/changelog/changelog.md
[menu-contributing]: /CONTRIBUTING.md
[menu-sponsoring]: /docs/site/sponsoring.md
