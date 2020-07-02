<a href="/docs/site/application-platform/README.md"><img src="/resources/branding/scion-workbench-banner.svg" height="50" alt="SCION Workbench Application Platform"></a>

| SCION Workbench Application Platform | [Projects Overview][menu-projects-overview] | [Changelog][menu-changelog] | [Contributing][menu-contributing] | [Sponsoring][menu-sponsoring] |  
| --- | --- | --- | --- | --- |

## [SCION Workbench Application Platform][menu-home] > [How To Guides][menu-how-to] > App Viewport

#### How to show the application inside a viewport

The platform does not show scrollbars if application content overflows in a view, popup or activity. Therefore, the application should put the entire application inside a viewport.

As a possible viewport implementation for Angular applications, you can use  `SciViewportModule` which provides a native viewport out of the box with scrollbars that sit on top of the viewport client.

##### 1. Use NPM command-line tool to install 'SciViewportModule'

  ```
  npm install --save @scion/viewport @scion/dimension
  ```
  > Viewport requires `@scion/dimension`. By using the above command, it is installed as well.

##### 2. Import 'SciViewportModule'

  Open `app.module.ts` and import 'SciViewportModule'.
  ```typescript
  @NgModule({
    imports: [
      SciViewportModule,
    ]
  })
  export class AppModule {
  }
  ```

##### 3. Open 'app.component.html' and replace its content as follows to put the router outlet into a viewport

  ```html 
  <sci-viewport>
    <router-outlet></router-outlet> ➀
  </sci-viewport>
  ```

##### 4. Open 'app.component.scss' and replace its content as follows:

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


[menu-how-to]: /docs/site/application-platform/howto/how-to.md

[menu-home]: /docs/site/application-platform/README.md
[menu-projects-overview]: /docs/site/projects-overview.md
[menu-changelog]: /docs/site/changelog/changelog.md
[menu-contributing]: /CONTRIBUTING.md
[menu-sponsoring]: /docs/site/sponsoring.md
