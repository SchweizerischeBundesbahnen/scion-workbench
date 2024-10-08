<a href="/README.md"><img src="/resources/branding/scion-workbench-banner.svg" height="50" alt="SCION Workbench"></a>

| SCION Workbench | [Projects Overview][menu-projects-overview] | [Changelog][menu-changelog] | [Contributing][menu-contributing] | [Sponsoring][menu-sponsoring] |  
| --- | --- | --- | --- | --- |

## [SCION Workbench][menu-home] > [How To Guides][menu-how-to] > Installation

### How to install the SCION Workbench

Follow these steps to install the SCION Workbench in an Angular application.

<details>
    <summary><strong>Install SCION Workbench from NPM</strong></summary>
    <br>

Run the following command to install the SCION Workbench and required dependencies.

```console
npm install @scion/workbench @scion/workbench-client @scion/toolkit @scion/components @scion/microfrontend-platform @angular/cdk --save
```

</details>

<details>
    <summary><strong>Register SCION Workbench Providers</strong></summary>
    <br>

Open `app.config.ts` and register SCION Workbench providers.

```ts
import {ApplicationConfig} from '@angular/core';
import {provideRouter} from '@angular/router';
import {provideAnimations} from '@angular/platform-browser/animations';
import {provideWorkbench} from '@scion/workbench';

export const appConfig: ApplicationConfig = {
  providers: [
    provideWorkbench(),
    provideRouter([]), // required by the SCION Workbench
    provideAnimations(), // required by the SCION Workbench
  ],
};
```

If you are not using `app.config.ts`, register the SCION Workbench directly in `main.ts`.

```ts
import {bootstrapApplication} from '@angular/platform-browser';
import {provideRouter} from '@angular/router';
import {provideAnimations} from '@angular/platform-browser/animations';
import {provideWorkbench} from '@scion/workbench';

bootstrapApplication(AppComponent, {
  providers: [
    provideWorkbench(),
    provideRouter([]), // required by the SCION Workbench
    provideAnimations(), // required by the SCION Workbench
  ],
});
```

</details>

<details>
    <summary><strong>Insert workbench component</strong></summary>
    <br>

Open `app.component.html` and replace it with the following content:

```html 
<wb-workbench/>
```

The workbench itself does not position nor lay out the `<wb-workbench>` component. Depending on your requirements, you may want the workbench to fill the entire page viewport or only parts of it, for example, if you have a header, footer, or navigation panel.

For a quick start, position the workbench absolutely and align it with the page viewport. Open `app.component.scss` and replace it with the following content:
```scss
  wb-workbench {
    position: absolute;
    inset: 0;
  }
```
</details>

<details>
    <summary><strong>Add workbench styles</strong></summary>
    <br>

The workbench requires some styles to be imported into `styles.scss`, as follows:

```scss
@use '@scion/workbench';
``` 

Also, download the workbench icon font from <a href="https://github.com/SchweizerischeBundesbahnen/scion-workbench/raw/master/resources/scion-workbench-icons/fonts/fonts.zip">GitHub</a>, unzip the font files, and place the extracted files in the `/public/fonts` folder.

> Deploying the application in a subdirectory requires the additional steps described [here][link-how-to-configure-icons-if-deploying-app-in-subdirectory].

</details>

After completing the above steps, start your application by running `ng serve`. Open a browser at http://localhost:4200. You should see a blank page.

Continue with the guide [How to define the initial workbench layout][link-how-to-define-initial-workbench-layout] to define an initial layout for the workbench.

[link-how-to-define-initial-workbench-layout]: /docs/site/howto/how-to-define-initial-layout.md
[link-how-to-configure-icons-if-deploying-app-in-subdirectory]: /docs/site/howto/how-to-icons.md#deploying-the-app-in-a-subdirectory

[menu-how-to]: /docs/site/howto/how-to.md

[menu-home]: /README.md
[menu-projects-overview]: /docs/site/projects-overview.md
[menu-changelog]: /docs/site/changelog.md
[menu-contributing]: /CONTRIBUTING.md
[menu-sponsoring]: /docs/site/sponsoring.md
