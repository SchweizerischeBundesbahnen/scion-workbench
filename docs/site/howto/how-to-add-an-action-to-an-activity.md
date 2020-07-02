<a href="/README.md"><img src="/resources/branding/scion-workbench-banner.svg" height="50" alt="SCION Workbench"></a>

| SCION Workbench | [Projects Overview][menu-projects-overview] | [Changelog][menu-changelog] | [Contributing][menu-contributing] | [Sponsoring][menu-sponsoring] |  
| --- | --- | --- | --- | --- |

## [SCION Workbench][menu-home] > [How To Guides][menu-how-to] > Activity

#### How to add an action to an activity

The platform allows to register actions with an activity. To register an action, go to the activity component template and model the action as a view child in the form of a `<ng-template>` decorated with `wbActivityAction` directive. The content of `ng-template` is then used to display the action.

The following snippet registers a Material-styled button as activity action. It is embedded in a `ng-template` decorated with `wbActivityAction` directive. When clicked, a view opens to create a new person.

```html 
<ng-template wbActivityAction>
    <button wbRouterLink="/person/new" mat-icon-button title="Create person">
        <mat-icon>add</mat-icon>
    </button>
</ng-template>
```

[menu-how-to]: /docs/site/howto/how-to.md

[menu-home]: /README.md
[menu-projects-overview]: /docs/site/projects-overview.md
[menu-changelog]: /docs/site/changelog/changelog.md
[menu-contributing]: /CONTRIBUTING.md
[menu-sponsoring]: /docs/site/sponsoring.md
