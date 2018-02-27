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

### 1. `css-api`

```sh
$ cd your-component
$ most css-api
```

#### Params

     Name       | Alias |                                Description                                |      Default
:-------------- | :---- | :------------------------------------------------------------------------ | ------------------
`--file`        | `f`   | File where the CSS properties will be searched.                           | `<component>`.html
`--docs`        | `d`   | File where the CSS docs in markdown format will be searched.              | `<component>`.html
`--sort`        | `s`   | Set to true to sort CSS properties alphabetically.                        | `false`
`--unformatted` | `u`   | Set to true to render the markdown table without format (unaligned cells) | `false`

The command compares your current CSS API docs inside your component's HTML (markdown table) with the CSS properties and mixins found in the component styles and prints a markdown table with all the properties found in your component styles. If a property is not documented previously in your docs, it will take the value used in styles.

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

#### Screenshots

Default output   
![Screenshot of the default output](https://github.com/kcmr/most/blob/master/images/cssapi-default-output.png?raw=true)

Added properties   
![Screenshot of the output with added CSS properties](https://github.com/kcmr/most/blob/master/images/cssapi-added.png?raw=true)

Removed properties   
![Screenshot of the output with removed CSS properties](https://github.com/kcmr/most/blob/master/images/cssapi-removed.png?raw=true)

Unformatted table   
![Screenshot of the output with unformatted option](https://github.com/kcmr/most/blob/master/images/cssapi-unformatted.png?raw=true)

### 2. `public-api`

```sh
$ cd your-component
$ most public-api
```

The command writes a file (`public-api.json`) with the public properties, methods, events and CSS properties of the analyzed component. 

This command can be useful to detect breaking changes in the component's API by comparing the generated file with the same file generated in a previous version (release) of the component.

## Config file

### `.mostrc` 

You can set the the params used for each command in a `.mostrc` file that can be placed in the component's root or any other parent directory. This file allows to use placeholders like `{{component}}` that will be replaced by the component's name.

Example:

```json
{
  "css-api": {
    "file": "{{component}}-styles.html",
    "docs": "README.md",
    "sort": false,
    "unformatted": true
  }
}
```
