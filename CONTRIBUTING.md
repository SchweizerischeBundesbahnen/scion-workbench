![SCION Workbench](/resources/site/logo/scion-workbench-banner.png)

[Overview][menu-overview] | [Workbench][menu-workbench] | [Workbench&nbsp;Application&nbsp;Platform][menu-workbench-application-platform] | [Contributing][menu-contributing] | [Changelog][menu-changelog] | [Sponsoring][menu-sponsoring] | [Links][menu-links]
|---|---|---|---|---|---|---|

# Contributing

[Contribution](#contribution)\
[Build, Test, Lint and Serve](#build-test-lint-and-serve)\
[Coding guidelines](#coding-guidelines)\
[Commit guidelines](#commit-guidelines)\
[Line endings](#line-endings)\
[NPM versioning guidelines](#npm-versioning-guidelines)\
[Release guidelines](#release-guidelines)

***

## Contribution
We encourage other developers to join the project and contribute to make SCION Workbench constantly better and more stable. If you are missing a feature, please create a feature request so we can discuss it and coordinate further development. To report a bug, please check existing issues first, and if found, leave a comment on the issue. Otherwise, file a bug or, even better, create a pull request (PR) with a fix.

### Submitting a Pull Request (PR)
Please follow the guidelines below:

1. Search GitHub for an open or closed PR that relates to your submission.
2. Login to your GitHub account and fork the `SchweizerischeBundesbahnen/scion-workbench` repo.
3. Make your changes in a new Git branch. Name your branch in the form 'issue/123' with '123' as the relevant GitHub issue number.
4. Create your patch and stick to our [Coding guidelines](#coding-guidelines). 
5. Run all specs using `ng test` command.
6. Lint source using `ng lint` command.
7. Commit your changes using a descriptive commit message that follows our [commit message conventions](#commit-guidelines). 
8. Push your branch to your fork on GitHub
9. In GitHub, send a pull request to `scion-workbench:master`.
10. If we suggest changes, please rebase your branch and force push to your GitHub repository.

> Please be in mind that large pull requests take a lot of time to review.

## Build, Test, Lint and Serve
The project is built with [Travis CI][link-travis-ci]. When pushing to GitHub, the project is built, its tests executed and linted. When merging a PR to the master branch, the demo application is deployed to https://scion-workbench-application-platform.now.sh. When a release tag is added to the master branch, SCION modules are deployed to NPM.

[![Build Status](https://travis-ci.com/SchweizerischeBundesbahnen/scion-workbench.svg?token=sT5ouhFsqwt9RmkLsQb8&branch=master)](https://travis-ci.com/SchweizerischeBundesbahnen/scion-workbench)

For local development, you can uncomment the section `PATH-OVERRIDE-FOR-LOCAL-DEVELOPMENT` in `tsconfig.json`. This allows running tests or serving the demo application without having to build dependent modules first.

Use following commands to build, lint and test the project.

```
npm run build-all
npm run lint-all
npm run test
```
You can serve SCION Workbench test application as follows:
```
npm run build ➀
npm run app:common:build ➀
npm run app:workbench:serve
```
Then, open your browser at following URL: http://localhost:4200.

You can serve SCION Workbench Application Platform test application as follows:
```
npm run build ➀
npm run app:common:build ➀
npm run app:workbench-application-platform:serve ➀
```
Then, open your browser at following URL: http://localhost:5000.

You can run e2e-tests for SCION Workbench as follows:
```
npm run build ➀
npm run app:common:build ➀
npm run app:workbench:e2e
```

You can run e2e-tests for SCION Workbench Application Platform as follows:
```
npm run build ➀
npm run app:common:build ➀
npm run app:workbench-application-platform:e2e
```

|#|Explanation|
|-|-|
|➀|If not using path overrides in `tsconfig.json`, the project and common lib must first be built.|

## Coding guidelines
Besides linting rules, the following rules apply:

- Observable names are suffixed with dollar sign $ to indicate that it represents a stream which must be subscribed to and unsubscribed from
- we use explicit public or private visibility modifiers (except for constructors) to make code more explicit
- we use single quotes for string literals or import statements
- we use 2 spaces per indentation
- all features or bug fixes related to `routing` or `view grid` must be tested by one or more specs placed in `/projects/scion/workbench/src/lib/spec` directory
- all public API must be documented

## Commit guidelines
We believe in a compact and well written Git commit history. Every commit should be a logically separate changeset.
As a general rule, your messages should start with a single line in imperative present tense and refer a GitHub issue.

### Commit message format
Each commit message consists of a **header**, a **body** and a **footer**.  The header has a special format that includes a **type** and a **subject**:

```
<type>: <subject>
<BLANK LINE>
<body>
<BLANK LINE>
<footer>
```

The **header** is mandatory.

Any line of the commit message cannot be longer 100 characters! This allows the message to be easier to read on GitHub as well as in various git tools.

The footer should contain a [closing reference to an issue](https://help.github.com/articles/closing-issues-via-commit-messages/) if any.

Samples:

```
docs: update changelog to beta.5
```
```
fix: need to depend on latest rxjs and zone.js

The version in our package.json gets copied to the one we publish, and users need the latest of these.

Fixes #xx
```

### Type
Must be one of the following:

* **build**: Changes that affect the build system or external dependencies (example scopes: gulp, broccoli, npm)
* **ci**: Changes to our CI configuration files and scripts (example scopes: Travis, Circle, BrowserStack, SauceLabs)
* **docs**: Documentation only changes
* **feat**: A new feature
* **fix**: A bug fix
* **perf**: A code change that improves performance
* **refactor**: A code change that neither fixes a bug nor adds a feature
* **style**: Changes that do not affect the meaning of the code (white-space, formatting, missing semi-colons, etc)
* **test**: Adding missing tests or correcting existing tests
* **release**: A new release

### Subject
The subject contains a succinct description of the change:

* use the imperative, present tense: "change" not "changed" nor "changes"
* don't capitalize the first letter
* no dot (.) at the end

### Body
Just as in the **subject**, use the imperative, present tense: "change" not "changed" nor "changes". The body should include the motivation for the change and contrast this with previous behavior.

### Footer
The footer should contain any information about **Breaking Changes** and is also the place to reference GitHub issues that this commit **Closes**.

**Breaking Changes** should start with the word `BREAKING CHANGE:` with a space or two newlines. The rest of the commit message is then used for this.


## Line endings
This project expects line endings of textual files to be Unix style (LF) only, and which is in the responsibility of the committer. There is no automatic line ending conversation done by Git on checkout nor when indexing files. Instead, configure your editor to use unix-style delimiter for new files and disable auto conversion in Git. However, the linting rule `linebreak-style` enforces a unix-style linebreak style for TypeScript files.

Global Git settings: `core.autocrlf=false`

Run the following command to find files with 'windows-style' line ending:

```
find . -type f | xargs file | grep CRLF
```

## NPM versioning guidelines
For SCION Workbench versioning, we stick to the versioning practices of the Angular project.

### NPM Pre-Releases
Pre-Releases are early versions of the next major release. They are are named in the form `x.0.0-beta.0`, where `x` is the major release number. When publishing a pre-release to NPM, its version number is increment like `x.0.0-beta.1`,  `x.0.0-beta.2`, ..., `x.0.0-beta.n`. Before the official stable release is published, one or more release candidates (RC0, RC1, etc.) are published: `x.0.0-rc.0`, `x.0.0-rc.1`, ..., `x.0.0-rc.n`. Then, if no critical problems are found, the stable major release is finally published at version `x.0.0`.

> Minor and patch releases do not require to publish pre-releases up front.

### NPM distribution tags:
We use NPM distribution tags to differentiate between pre-releases (x.0.0-beta.0, x.0.0-beta.1, x.0.0-rc.0, x.0.0-rc.0, etc) and stable releases (x.x.x). Pre-releases are tagged with the distribution tag `next`, and stable releases with `latest`. The latest tag is automatically updated by NPM whenever you publish without setting a distribution tag.

### Example for releasing 2.x.x

```
2.0.0-beta.0 with "next" distribution tag
2.0.0-beta.1 with "next" distribution tag
2.0.0-beta.x with "next" distribution tag

2.0.0-rc.0 with "next" distribution tag
2.0.0-rc.1 with "next" distribution tag
2.0.0-rc.x with "next" distribution tag

2.0.0 with "latest" distribution tag
2.0.1 with "latest" distribution tag
2.1.0 with "latest" distribution tag
```

## Release guidelines
Whenever you publish a new version to NPM (pre-release, major, minor, patch), please follow the instructions below:

- update all `package.json` files with the new version, e.g. `2.0.0-beta.1`
- update scion dependencies to the new version in all necessary 'package.json' files
- generate the new `changelog.md`, if necessary (see below)
- check if the `changelog.md` looks good (we use a custom header, make sure it stays there)
- create a Git release commit that consists of the changed files and a commit message like 'release: version 2.0.0-beta.1'
- create a Git release tag pointing to the previously added release commit, and use the exact version as tag name, e.g. `2.0.0-beta.1`.
- based on the Git release tag, travis will automatically build & publish the necessary npm packages

SCION workbench packages are published under `@scion` scope. To get access to SCION organization, please file an issue in the project issue tracker.

### Generating change logs
```bash
# Install the cli
npm install -g conventional-changelog-cli

# Generate the changelog since last release
conventional-changelog -p angular -i resources/site/changelog.md -s
```

[link-travis-ci]: https://travis-ci.com/SchweizerischeBundesbahnen/scion-workbench

[menu-overview]: /README.md
[menu-workbench]: /resources/site/workbench.md
[menu-workbench-application-platform]: /resources/site/workbench-application-platform.md
[menu-contributing]: /CONTRIBUTING.md
[menu-changelog]: /resources/site/changelog.md
[menu-sponsoring]: /resources/site/sponsors.md
[menu-links]: /resources/site/links.md
