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

Command options can also be set in a [`.mostrc` file](#config-file) placed in the component's root or any other parent directory.

### `css-api`

```sh
$ cd your-component
$ most css-api --file your-component-styles.css --docs README.md
```

#### Options

Name | Description
:----|:-----------
`file` | Required. File where the CSS properties will be searched.
`docs` | Optional (defaults to `<component>`.html). File where the CSS docs in markdown format will be searched. 

The command compares your current CSS API docs inside your component's HTML (markdown table) or the specified file in `--docs` param with the CSS properties and mixins found in `--file` and prints a markdown table with all the properties sorted alfabetically that you can happily copy and paste into your HTML and/or README.md.

The command also warns you about API diffs (new properties) and potentially BREAKING CHANGES (removed properties) that may require a major version upgrade for the component.

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

Now you can run `most css-api` without the required `--file` param.
