<a href="/README.md"><img src="/docs/branding/scion-workbench-banner.svg" height="50" alt="SCION Workbench"></a>

| [SCION Workbench][menu-home] | [Projects Overview][menu-projects-overview] | [Changelog][menu-changelog] | Contributing | [Sponsoring][menu-sponsoring] |  
| --- | --- | --- | --- | --- |

## Contributing
We encourage other developers to join the project and contribute to making SCION products constantly better and more stable. If you are missing a feature, please create a feature request so we can discuss it and coordinate further development. To report a bug, please check existing issues first, and if found, leave a comment on the issue. Otherwise, file a bug or create a pull request with a proposed fix.

<details>
  <summary><strong>Submitting a Pull Request</strong></summary>
  <br>
  
This section explains how to submit a pull request.

1. Login to your GitHub account and fork the `SchweizerischeBundesbahnen/scion-workbench` repo.
1. Make your changes in a new Git branch. Name your branch in the form `issue/123` with `123` as the related GitHub issue number. Before submitting the pull request, please make sure that you comply with our coding and commit guidelines.
1. Run the command `npm run before-push` to make sure that the project builds, passes all tests, and has no lint violations. Alternatively, you can also run the commands one by one, as following:
   - `npm run lint`\
      Lints all project files.
   - `npm run build`\
      Builds the project and related artifacts.
   - `npm run test:headless`\
      Runs all unit tests.
   - `npm run e2e:headless`\
      Runs all end-to-end tests.
1. Commit your changes using a descriptive commit message that follows our commit guidelines.
1. Before submitting the pull request, ensure to have rebased your branch based on the master branch as we stick to the rebase policy to keep the repository history linear. 
1. Push your branch to your fork on GitHub. In GitHub, send a pull request to `scion-workbench:master`.
1. If we suggest changes, please amend your commit and force push it to your GitHub repository.

> When we receive a pull request, we will carefully review it and suggest changes if necessary. This may require triage and several iterations. Therefore, we kindly ask you to discuss proposed changes with us in advance via the GitHub issue.

</details>

<details>
  <summary><strong>Development</strong></summary>
  <br>
  
For development, you can uncomment the section `PATH-OVERRIDE-FOR-DEVELOPMENT` in `tsconfig.json`. This allows running tests or serving applications without having to build dependent modules first.

The following is a summary of commands useful for development of `scion-workbench`. See file `package.json` for a complete list of available NPM scripts.

> Before you start development, we recommend that you build all projects using the `npm run build` command. Please make sure that path overrides are disabled in `tsconfig.json`. 
 
### Commands for working on the workbench
 
- `npm run workbench:lint`\
  Lints the workbench source.

- `npm run workbench:build`\
  Builds the workbench source.

- `npm run workbench:test`\
  Runs unit tests of the workbench.
  
- `npm run workbench:e2e`\
  Runs end-to-end tests of the workbench. Prior to test execution, the testing app is started using the Angular CLI.
  
### Commands for working on the workbench testing application
  
- `npm run workbench-testing-app:serve`\
  Serves the testing app on http://localhost:4200 using the Angular CLI.\
  Uncomment the section `PATH-OVERRIDE-FOR-DEVELOPMENT` in `tsconfig.json` to have hot module reloading support. 
  
- `npm run workbench-testing-app-localhost:build`\
  Builds the testing app into `dist` folder using the productive config.

- `npm run workbench-testing-app:lint`\
  Lints the testing app.

### Commands for generating the project documentation

- `npm run changelog`\
  Use to generate the changelog based on the commit history. The output is written to `CHANGELOG.md`, which will be included in `docs/site/changelog/changelog.md` using the template `docs/site/changelog/changelog.template.md`. 

</details>

<details>
  <summary><strong>Code Formatting</strong></summary>
  <br>

To ensure consistency within our code base, please use the following formatting settings.  
  
- **For IntelliJ IDEA**\
  Import the code style settings of `.editorconfig.intellij.xml` located in the project root.

- **For other IDEs**\
  Import the code style settings of `.editorconfig` located in the project root.
  
</details>

<details>
  <summary><strong>Coding Guidelines</strong></summary>
  <br>
  
In additional to the linting rules, we have the following conventions:

- We believe in the [Best practices for a clean and performant Angular application](https://medium.freecodecamp.org/best-practices-for-a-clean-and-performant-angular-application-288e7b39eb6f) and the [Angular Style Guide](https://angular.io/guide/styleguide).
- We expect line endings to be Unix style (LF) only. Please check your Git settings to not convert line endings to CRLF. You can run the following command to find files with `windows-style` line endings: `find . -type f | xargs file | grep CRLF`.
- Observable names are suffixed with the dollar sign (`$`) to indicate that it is an `Observable` which we must subscribe to and unsubscribe from.
- We use explicit public and private visibility modifiers (except for constructors) to make the code more explicit.
- We prefix private members with an underscore.
- We write each RxJS operator on a separate line, except when piping a single RxJS operator. Then, we write it on the same line as the pipe method.
- We avoid nested RxJS subscriptions.
- We document all public API methods, constants, functions, classes or interfaces.
- We structure the CSS selectors in CSS files similar to the structure of the companion HTML file and favor the direct descendant selector (`>`) over the non-restrictive descendant selector (` `), except if there are good reasons not to do it. This gives us a visual by only reading the CSS file. 
- When referencing CSS classes from within E2E tests, we always prefix them with `e2e-`. We never reference e2e prefixed CSS classes in stylesheets.

</details>

<details>
  <summary><strong>Commit Guidelines</strong></summary>
  <br>
  
We believe in a compact and well written Git commit history. Every commit should be a logically separated changeset. We use the commit messages to generate the changelog.
 
Each commit message consists of a **header**, a **summary** and a **footer**.  The header has a special format that includes a **type**, an optional **scope**, and a **subject**, as following:

```
<type>(<scope>): <subject>

[optional summary]

[optional footer]
```

<details>
  <summary><strong>Type</strong></summary>
  
- `feat`: new feature
- `fix`: bug fix
- `docs`: changes to the documentation
- `refactor`: changes that neither fixes a bug nor adds a feature
- `perf`: changes that improve performance
- `test`: adding missing tests, refactoring tests; no production code change
- `chore`: other changes like formatting, updating the license, updating dependencies, removal of deprecations, etc
- `ci`: changes to our CI configuration files and scripts
- `revert`: revert of a previous commit
- `release`: publish a new release
</details>

<details>
  <summary><strong>Scope</strong></summary>
  
The scope should be the name of the NPM package or application affected by the change.

The following scopes are allowed:
  
- `workbench`: If the change affects the `@scion/workbench` NPM package.
- `application-platform`: If the change affects the `@scion/workbench-application-platform` NPM package.
- `demo`: If the change affects the `SCION Workbench Demo Application`.
</details>


<details>
  <summary><strong>Subject</strong></summary>
  
The subject contains a succinct description of the change and follows the following rules:
- written in the imperative, present tense ("change" not "changed" nor "changes")
- starts with a lowercase letter
- has no punctuation at the end
</details>

<details>
  <summary><strong>Summary</strong></summary>
  
The summary describes the change. You can include the motivation for the change and contrast this with previous behavior.  
</details>

<details>
  <summary><strong>Footer</strong></summary>
  
In the footer, reference the GitHub issue and optionally close it with the `Closes` keyword, as following:

```
closes #123
```

And finally, add notes about breaking changes, if there are any. Breaking changes start with the keyword `BREAKING CHANGE: `. The rest of the commit message is then used to describe the breaking change and should contain information about the migration.
  
```
BREAKING CHANGE: Removed deprecated API for xy.

To migrate:
- do xy
- do xy
  ```
</details>

</details>


<details>
  <summary><strong>Deprecation Policy</strong></summary>
  <br>

You can deprecate API in any version. However, it will still be present in the next major release. Removal of deprecated API will occur only in a major release.

When deprecating API, mark it with the `@deprecated` JSDoc comment tag and include the current library version. Optionally, you can also specify which API to use instead, as following: 

```ts
/**
 * @deprecated since version 2.0. Use {@link otherMethod} instead.
 */
function someMethod(): void {
}

```  

</details>

<details>
  <summary><strong>Deployments</strong></summary>
  <br>
  
We deploy our documentations and applications to [Vercel](https://vercel.com/docs). Vercel is a cloud platform for static sites and serverless functions. Applications are deployed using the SCION collaborator account (scion.collaborator@gmail.com) under the [SCION organization](https://vercel.com/scion).

We have the following workbench and application platform related projects:
- https://vercel.com/scion/scion-workbench-application-platform
- https://vercel.com/scion/scion-workbench-application-platform-contact
- https://vercel.com/scion/scion-workbench-application-platform-communication
- https://vercel.com/scion/scion-workbench-application-platform-devtools

</details>

<details>
  <summary><strong>NPM Packages</strong></summary>
  <br>
  
We publish our packages to the [NPM registry](https://www.npmjs.com/). Packages are published using the SCION collaborator account (scion.collaborator) under the [SCION organization](https://www.npmjs.com/org/scion).

We have the following workbench and application platform related packages:
- https://www.npmjs.com/package/@scion/workbench
- https://www.npmjs.com/package/@scion/workbench-application-platform
- https://www.npmjs.com/package/@scion/workbench-application-platform.api
- https://www.npmjs.com/package/@scion/workbench-application.core
- https://www.npmjs.com/package/@scion/workbench-application.angular
- https://www.npmjs.com/package/@scion/dimension
- https://www.npmjs.com/package/@scion/viewport
- https://www.npmjs.com/package/@scion/mouse-dispatcher

</details>

<details>
  <summary><strong>Releasing Policy</strong></summary>
  <br>
  
SCION follows the semantic versioning scheme (SemVer) for its releases. In this scheme, a release is represented by three numbers: `MAJOR.MINOR.PATCH`. For example, version `1.5.3` indicates major version `1`, minor version `5`, and patch level `3`.

**Major Version:**\
The major version number is incremented when introducing any backwards incompatible changes to the API.

**Minor Version**\
The minor version number is incremented when introducting some new, backwards compatible functionality.

**Patch Level**\
The patch or maintenance level is incremented when fixing bugs.

In the development of a new major release, we usually release pre-releases and tag them with the beta tag (`-beta.x`). A beta pre-release is a snapshot of current development, so it is potentially unstable and incomplete. Before releasing the major version, we start releasing one or more release candidates, which we tag with the rc tag (`-rc.x`). We will publish the official and stable major release if the platform is working as expected and we do not find any critical problems.  
  
</details>

<details>
  <summary><strong>Release Checklist</strong></summary>
  <br>

This chapter describes the tasks to publish a new release to NPM.

1. Update the following `package.json` files with the new version:
    - `/package.json`
    - `/projects/scion/workbench/package.json`
    - `/projects/scion/workbench-application-platform/package.json`
    - `/projects/scion/workbench-application-platform.api/package.json`
    - `/projects/scion/workbench-application.core/package.json`
    - `/projects/scion/workbench-application.angular/package.json`
    - `/projects/scion/viewport/package.json`
    - `/projects/scion/mouse-dispatcher/package.json`
    - `/projects/scion/dimension/package.json`
    - `/projects/app-common/package.json`
1. Update inter-project dependencies.
1. Run `npm install` to update the version in `package-lock.json`.
1. Run `npm run changelog` to generate the changelog. Then, review the generated changelog carefully and correct typos and formatting errors, if any.
1. Commit the changed files using the following commit message: `release: vX.X.X`. Replace `X.X.X` with the current version. Later, when merging the branch into the master branch, a commit message of this format triggers the release action in our [GitHub Actions workflow][link-github-actions-workflow].
1. Push the commit to the branch `release/X.X.X` and submit a pull request to the master branch. Replace `X.X.X` with the current version.
1. When merged into the master branch, the release action in our [GitHub Actions workflow][link-github-actions-workflow] creates a Git release tag, publishes the package to NPM, and deploys related applications.
1. Verify that: 
   - **@scion/workbench** is published to: https://www.npmjs.com/package/@scion/workbench.
   - **@scion/workbench-application-platform** is published to: https://www.npmjs.com/package/@scion/workbench-application-platform.
   - **@scion/workbench-application-platform.api** is published to: https://www.npmjs.com/package/@scion/workbench-application-platform.api.
   - **@scion/workbench-application.core** is published to: https://www.npmjs.com/package/@scion/workbench-application.core.
   - **@scion/workbench-application.angular** is published to: https://www.npmjs.com/package/@scion/workbench-application.angular.
   - **@scion/dimension** is published to: https://www.npmjs.com/package/@scion/dimension.
   - **@scion/viewport** is published to: https://www.npmjs.com/package/@scion/viewport.
   - **@scion/mouse-dispatcher** is published to: https://www.npmjs.com/package/@scion/mouse-dispatcher.
   - **Workbench Application Platform Demo App** is deployed to:
      - https://vercel.com/scion/scion-workbench-application-platform
      - https://vercel.com/scion/scion-workbench-application-platform-contact
      - https://vercel.com/scion/scion-workbench-application-platform-communication
   - **DevTools for the Workbench Application Platform** is deployed to:
      - https://vercel.com/scion/scion-workbench-application-platform-devtools

</details>

[link-github-actions-workflow]: https://github.com/SchweizerischeBundesbahnen/scion-workbench/actions

[menu-home]: /README.md
[menu-projects-overview]: /docs/site/projects-overview.md
[menu-changelog]: /docs/site/changelog/changelog.md
[menu-contributing]: /CONTRIBUTING.md
[menu-sponsoring]: /docs/site/sponsoring.md
