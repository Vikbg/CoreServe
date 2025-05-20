// jest.config.js
/** @type {import('jest').Config} */
const config = {
  // When using --experimental-vm-modules, Jest handles ESM natively.
  // You still need `babel-jest` for transpiling modern JS features in your
  // application code (index.js, db.js, logger.js) that might not be fully
  // supported by your Node.js version, or if you're using TypeScript/JSX.
  transform: {
    '^.+\\.js$': 'babel-jest',
  },
  // With --experimental-vm-modules, Node.js's native ESM loader
  // should handle imports from node_modules.
  // So, typically, you can revert transformIgnorePatterns to its default.
  transformIgnorePatterns: ['/node_modules/'],

  testEnvironment: 'node',
};

export default config;
