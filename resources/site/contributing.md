![SCION Workbench](/resources/site/logo/scion-workbench-banner.png)

[Overview][menu-overview] | [Demo][menu-demo] | [Download][menu-download] | [Getting Started][menu-getting-started] | [How To][menu-how-to] | [Contributing][menu-contributing] | [Sponsoring][menu-sponsoring] | [Links][menu-links]
|---|---|---|---|---|---|---|---|

# Contributing

[Contribution](#contribution)\
[Build SCION Workbench](#build-scion-workbench)\
[Commit Guidelines](#commit-guidelines)\
[Coding guidelines](#coding-buidelines)\
[Line endings](#line-endings)

***

## Contribution
We encourage other developers to join the project and contribute to make SCION Workbench constantly better and more stable. If you are missing a feature, please create a feature request so we can discuss it and coordinate further development. To report a bug, please check existing issues first, and if found, leave a comment on the issue. Otherwise, file a bug or create a pull request. Please be in mind that large pull requests take a lot of time to review.

## Build SCION Workbench
The project is built with Travis CI and automatically be built, its tests executed and linted for violations as you push it to GitHub.

[![Build Status](https://travis-ci.com/SchweizerischeBundesbahnen/scion-workbench.svg?token=sT5ouhFsqwt9RmkLsQb8&branch=master)](https://travis-ci.com/SchweizerischeBundesbahnen/scion-workbench)

## Commit Guidelines
We believe in a compact and well written Git commit history. Every commit should be a logically separate changeset.
As a general rule, your messages should start with a single line in imperative present tense and refer a GitHub issue.

Example:

```
#Issue: Capitalized, short summary of changes in imperative present tense

More detailed explanatory text, if necessary.
```

## Coding Guidelines
Besides linting rules, the following rules apply:

- Observable names are suffixed with dollar sign $ to indicate that it represents a stream which must be subscribed to and unsubscribed from
- we use explicit public or private visibility modifiers (except for constructors) to make code more explicit
- we use single quotes for string literals or import statements
- we use 2 spaces per indentation

## Line endings
This project expects line endings of textual files to be Unix style (LF) only, and which is in the responsibility of the committer. There is no automatic line ending conversation done by Git on checkout nor when indexing files. Instead, configure your editor to use unix-style delimiter for new files and disable auto conversion in Git. However, the linting rule `linebreak-style` enforces a unix-style linebreak style for TypeScript files.

Global Git settings: `core.autocrlf=false`

Run the following command to find files with 'windows-style' line ending:

```
find . -type f | xargs file | grep CRLF
```

[menu-overview]: /README.md
[menu-demo]: https://blog.sbb.technology/scion-workbench-demo/#/(view.6:heatmap//view.5:person/79//view.4:person/39//view.3:person/15//view.2:person/38//view.1:person/66//activity:person-list)?viewgrid=eyJpZCI6MSwic2FzaDEiOlsidmlld3BhcnQuMSIsInZpZXcuMSIsInZpZXcuMiIsInZpZXcuMSJdLCJzYXNoMiI6eyJpZCI6Miwic2FzaDEiOlsidmlld3BhcnQuMiIsInZpZXcuMyIsInZpZXcuMyJdLCJzYXNoMiI6eyJpZCI6Mywic2FzaDEiOlsidmlld3BhcnQuNCIsInZpZXcuNiIsInZpZXcuNiJdLCJzYXNoMiI6WyJ2aWV3cGFydC4zIiwidmlldy40Iiwidmlldy40Iiwidmlldy41Il0sInNwbGl0dGVyIjowLjQ4NTk2MTEyMzExMDE1MTEsImhzcGxpdCI6ZmFsc2V9LCJzcGxpdHRlciI6MC41NTk0MjQzMjY4MzM3OTc1LCJoc3BsaXQiOnRydWV9LCJzcGxpdHRlciI6MC4zMjI2Mjc3MzcyMjYyNzczLCJoc3BsaXQiOmZhbHNlfQ%3D%3D
[menu-download]: https://www.npmjs.com/package/@scion/workbench
[menu-getting-started]: /resources/site/getting-started.md
[menu-how-to]: /resources/site/how-to.md
[menu-contributing]: /resources/site/contributing.md
[menu-sponsoring]: /resources/site/sponsors.md
[menu-links]: /resources/site/links.md

