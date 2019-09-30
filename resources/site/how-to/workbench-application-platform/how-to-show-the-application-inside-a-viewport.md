![SCION Workbench](/resources/site/logo/scion-workbench-banner.png)

[Overview][menu-overview] | [Workbench][menu-workbench] | [Workbench&nbsp;Application&nbsp;Platform][menu-workbench-application-platform] | [Contributing][menu-contributing] | [Changelog][menu-changelog] | [Sponsoring][menu-sponsoring] | [Links][menu-links]
|---|---|---|---|---|---|---|

## How to show the application inside a viewport

The platform does not show scrollbars if application content overflows in a view, popup or activity. Therefore, the application should put the entire application inside a viewport.

As a possible viewport implementation for Angular applications, you can use  `SciViewportModule` which provides a native viewport out of the box with scrollbars that sit on top of the viewport client.

#### 1. Use NPM command-line tool to install 'SciViewportModule'

  ```
  npm install --save @scion/toolkit
  ```

#### 2. Import 'SciViewportModule'

  Open `app.module.ts` and import 'SciViewportModule' from `@scion/toolkit/viewport`.
  ```typescript
  @NgModule({
    imports: [
      SciViewportModule,
    ]
  })
  export class AppModule {
  }
  ```

#### 3. Open 'app.component.html' and replace its content as follows to put the router outlet into a viewport

  ```html 
  <sci-viewport>
    <router-outlet></router-outlet> ➀
  </sci-viewport>
  ```

#### 4. Open 'app.component.scss' and replace its content as follows:

  ```scss 
  :host {
    display: block;
    position: absolute;
    top: 0; right: 0; bottom: 0; left: 0; ➀

    > sci-viewport {
      position: absolute;
      top: 0; right: 0; bottom: 0; left: 0; ➁

      router-outlet {
        position: absolute; ➂
      }
    }
  }
  ```
  |#|Explanation|
  |-|-|
  |➀|Stretches this component to be full width and full height.|
  |➁|Stretches the viewport to be full width and full height.|
  |➂|Takes the router outlet out of the document flow to not affect the positioning of other elements.|


[menu-overview]: /README.md
[menu-workbench]: /resources/site/workbench.md
[menu-workbench-application-platform]: /resources/site/workbench-application-platform.md
[menu-contributing]: /CONTRIBUTING.md
[menu-changelog]: /resources/site/changelog.md
[menu-sponsoring]: /resources/site/sponsors.md
[menu-links]: /resources/site/links.md
