![SCION Workbench](/resources/site/logo/scion-workbench-banner.png)

[Overview][menu-overview] | [Workbench][menu-workbench] | [Workbench&nbsp;Application&nbsp;Platform][menu-workbench-application-platform] | [Contributing][menu-contributing] | [Changelog][menu-changelog] | [Sponsoring][menu-sponsoring] | [Links][menu-links]
|---|---|---|---|---|---|---|

## How to open a popup
To open a popup, inject `PopupService` and invoke `open` method. Provide a `PopupConfig` options object to control the appearance of the popup, like which component to show or the anchor where to attach the popup. When the popup is closed, the `Promise` emits the popup result (if any). Do not forget to register the component as `entryComponents` in your application module, so it is available at runtime.

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

[menu-overview]: /README.md
[menu-workbench]: /resources/site/workbench.md
[menu-workbench-application-platform]: /resources/site/workbench-application-platform.md
[menu-contributing]: /CONTRIBUTING.md
[menu-changelog]: /resources/site/changelog.md
[menu-sponsoring]: /resources/site/sponsors.md
[menu-links]: /resources/site/links.md