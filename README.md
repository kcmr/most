# M.O.S.T.

> A collection of CLI tools for working with Polymer Web Components.

## Installation

```sh
$ npm i -g most-cli
```

or

```sh
$ yarn global add most-cli
```

## Usage

```sh
$ cd <component-path> && most <command>
```

## Commands

Command params can also be set in a [`.mostrc` file](#config-file) placed in the component's root or any other parent directory.

### `css-api`

```sh
$ cd your-component
$ most css-api
```

#### Params

Name | Description | Default
:----|:------------|:-------
`--file` | File where the CSS properties will be searched. | `<component>`.html
`--docs` | File where the CSS docs in markdown format will be searched. | `<component>`.html

The command compares your current CSS API docs inside your component's HTML (markdown table) with the CSS properties and mixins found in the component styles and prints a markdown table with all the properties sorted alfabetically that you can happily copy and paste into your HTML and/or README.

The command also warns you about API diffs (new properties) and potentially BREAKING CHANGES (removed properties) that may require a major version upgrade for the component.

Used without params, it will search CSS properties and docs in `<your-component-name>`.html.   
If you need to specify a different file for the styles, you can use the `--file` param. The placeholder `{{component}}` can be used instead of the component's name.

Example with custom path to styles:

```sh
$ most css-api --file {{component}}-styles.html
```

Example with custom path to docs:

```sh
$ most css-api --docs README.md
```

![Screenshot of the css-api command line output](https://github.com/kcmr/most/blob/master/images/most-cssapi.png?raw=true)

### `public-api` (_Work In Progress_)

```sh
$ cd your-component
$ most public-api
```

The command writes a file (`public-api.json`) with the public properties, methods, events and CSS properties of the analyzed component. 

## Config file

### `.mostrc` 

You can set the the params used for each command in a `.mostrc` file that can be placed in the component's root or any other parent directory. This file allows to use placeholders like `{{component}}` that will be replaced by the component's name.

Example:

```json
{
  "css-api": {
    "file": "{{component}}-styles.html",
    "docs": "README.md"
  }
}
```
