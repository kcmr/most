# M.O.S.T.

> A collection of CLI tools for working with Polymer Web Components.

## Installation

```sh
npm i -g most
```

or

```sh
yarn global add most
```

## Usage

```sh
cd <component-path> && most <command>
```

## Commands

### `css-api`
The command compares your current CSS API docs inside your component's HTML (markdown table) with the CSS properties and mixins found in `<component-name>-styles.html`<sup>[(1)](#a1)</sup> and prints a markdown table with all the properties sorted alfabetically that you can happily copy and paste into your HTML and/or README.md.

The command also warns you about API diffs (new properties) and potentially BREAKING CHANGES (removed properties) that may require a major version upgrade for the component.

![Screenshot of the css-api command line output](https://github.com/kcmr/most/blob/master/images/most-cssapi.png?raw=true)

### `public-api` (_Work In Progress_)
The command writes a file (`public-api.json`) with the public properties, methods, events and CSS properties of the analyzed component. 


<sup id="a1">(1)</sup> <small>_The file is relative to the directory where the command is executed and will be configurable in the future_.</small>
