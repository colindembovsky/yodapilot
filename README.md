# yoda-extension

This is a TypeScript project that includes an Express API.

## Project Structure

```
yoda-extension
├── src
│   ├── app.ts
│   ├── controllers
│   │   └── index.ts
│   ├── routes
│   │   └── index.ts
│   └── types
│       └── index.ts
├── package.json
├── tsconfig.json
└── README.md
```

## Getting Started

To get started with the project, follow these steps:

1. Clone the repository.
2. Install the dependencies by running `npm install`.
3. Build the project by running `npm run build`.
4. Start the server by running `npm start`.

## Note

This project requires Node.js version 16. `ts-node` does not work with higher versions of Node.js with ESM modules. You may have to be on Node 18 to install the `@copilot-extensions/preview-sdk.js` and then switch to 18 to run.

## API Endpoints

- Root: [`/`]

## License

This project is licensed under the MIT License. See the LICENSE file for details.