# Contributing

<!-- TOC -->

- [Local development](#local-development)
  - [Requirements](#requirements)
  - [Process](#process)
- [Content](#content)
  - [Writing a Content-Related PR](#writing-a-content-related-pr)
- [Contributors](#contributors)

For contribution guidelines that may have archived or are currently being moved over to this repo, please refer to [archive/CONTRIBUTING.md](./archive/CONTRIBUTING.md)

<!-- /TOC -->

## Local development

Some of the automation for GitHub Pages and autoversioned documentation requires this repository be called "cpac-docs".

### Requirements

- [node](https://nodejs.org/en/download/releases/) `>=18.0.0`
- [yarn](https://yarnpkg.com/getting-started/releases) `>=1.22.22`
- [pre-commit](https://pre-commit.com) `>=3.5.0`

### Process

1. Clone [`FCP-INDI/cpac-docs`](https://github.com/FCP-INDI/cpac-docs).
2. In your local clone,
    1. [install `pre-commit`](https://pre-commit.com/#install),
        and
    2. run `yarn`.
3. Run `yarn dev` to start a local hot-refreshing development server. By default, the compiled code will be served at `http://localhost:5173`.

## Content

In upholding our SSOT goal for this iteration of C-PAC Documentation, the majority of content has been stored in topic-specific `.yamls` in `src/assets/content`.  To propose a content-related change to these docs, please submit a pull request targeting a specific `.yaml` file in one of the following folders:

- [Index](./src/assets/content/pages/index)
- [About](./src/assets/content/pages/about)
- [Neuroimaging](./src/assets/content/pages/neuroimaging)
- [Pipelines](./src/assets/content/pages/pipelines)
  - [Nodeblocks](./src/assets/content/pages/pipelines/nodeblock_descriptors)
- [How to Use](./src/assets/content/pages/use)
- [Tutorials](./src/assets/content/pages/tutorials)
- [Projects](./src/assets/content/pages/projects)
- [User Support](./src/assets/content/pages/support)
- [Appendix](./src/assets/content/pages/appendix)

### Writing a Content-Related PR

- To contribute content-specific changes, create a new branch and make edits to the appropriate .yaml file
See [FCP-INDI/cpac-docs#78](https://github.com/FCP-INDI/cpac-docs/pull/78) for an example.

## Contributors

To add a contributor using the [@all-contributors bot](https://allcontributors.org/docs/en/bot/usage), use the following syntax in a comment: "@all-contributors please add `@username` for `contributions`".  See [allcontributors.org](https://allcontributors.org/docs/en/bot/usage) for usage and command specifications.
