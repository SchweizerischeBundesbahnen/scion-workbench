<a href="/README.md"><img src="/resources/branding/scion-workbench-banner.svg" height="50" alt="SCION Workbench"></a>

| SCION Workbench | [Projects Overview][menu-projects-overview] | [Changelog][menu-changelog] | [Contributing][menu-contributing] | [Sponsoring][menu-sponsoring] |  
| --- | --- | --- | --- | --- |

## [SCION Workbench][menu-home] > [How To Guides][menu-how-to] > Miscellaneous

#### How to open a popup
To open a popup, inject `PopupService` and invoke `open` method. Provide a `PopupConfig` options object to control the appearance of the popup, like which component to show or the anchor where to attach the popup. When the popup is closed, the `Promise` emits the popup result (if any).

```typescript
@Component({...})
export class PersonListComponent {

  constructor(private popupService: PopupService) {
  }

  public onPersonCreate(event: MouseEvent): void {
    const config: PopupConfig  = { ➀
      component: PersonCreatePopupComponent,
      anchor: new ElementRef(event.target),
      position: 'east'
    };

    this.popupService.open(config); ➁
  }
}
```

|#|Explanation|
|-|-|
|➀|Configures the popup: in its minimal form, provide the component to show in the popup and the anchor where to attach the popup.|
|➁|Opens the popup with given config and optional input. The method returns a promise to wait until the popup is closed.|

To interact with the popup in the popup component, inject a handle via `Popup` DI injection token. If the caller provided input for the popup, you can obtain it from the handle. Also, you can close the popup via the handle and optionally return a result to the caller.


```typescript
@Component({...})
export class PersonCreatePopupComponent {

  constructor(public popup: Popup) {
  }

  public onClose(): void {
    this.popup.close();
  }
}
```

[menu-how-to]: /docs/site/howto/how-to.md

[menu-home]: /README.md
[menu-projects-overview]: /docs/site/projects-overview.md
[menu-changelog]: /docs/site/changelog.md
[menu-contributing]: /CONTRIBUTING.md
[menu-sponsoring]: /docs/site/sponsoring.md
