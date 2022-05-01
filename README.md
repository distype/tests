<div align="center">
    <br>
    <h1>@distype/tests</h1>
    <br><br>
    <p>
        <a href="https://github.com/distype/tests/actions/workflows/tests.yml"><img src="https://img.shields.io/github/workflow/status/distype/tests/Tests?label=tests&style=for-the-badge&logo=github"><a>
        <a href="https://discord.gg/E2JsYPPJYN"><img src="https://img.shields.io/discord/773939670505619486?color=5162F1&style=for-the-badge&logo=discord&logoColor=white"></a>
    </p>
</div>

## About

A testing suite for [Distype](https://github.com/distype/distype). Note that the version of Distype installed from `npm install` is from the [build branch](https://github.com/distype/distype/tree/build), so it may be unstable.

### Using a local Distype repository

In the folder of a local Distype repository, run this command:
```sh
npm link
```

You can then run the following command in this directory:
```sh
npm link distype
```

The same applies for `@distype/cmd`.

### Prerequisites

- **[Node.js >=16.13.0](https://nodejs.org/)**
- **[NPM >=8.1.0](https://www.npmjs.com/)**

### Optional packages

- **[bufferutil](https://www.npmjs.com/package/bufferutil/):** Improves ws performance
- **[utf-8-validate](https://www.npmjs.com/package/utf-8-validate/):** Improves ws performance
