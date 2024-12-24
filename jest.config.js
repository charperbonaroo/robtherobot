/** @type {import('ts-jest').JestConfigWithTsJest} **/
export default {
  testEnvironment: "node",
  transform: {
    "^.+.tsx?$": ["ts-jest", {
      diagnostics: {
        ignoreCodes: [151001],
      },
    }],
  },
};
