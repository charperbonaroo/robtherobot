/** @type {import('ts-jest').JestConfigWithTsJest} **/
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  moduleNameMapper: {
    '^(\\.{1,2}/.*)\\.js$': '$1'
  },
  transformIgnorePatterns: [
    'node_modules/(?!(@llamaindex|llamaindex|@mastra|@ai-sdk|weaviate-client|@weaviate|protobufjs|@protobufjs|long|@grpc|@types/node|node-fetch|data-uri-to-buffer|fetch-blob|formdata-polyfill|web-streams-polyfill)/)'
  ],
  transform: {
    '^.+\\.(ts|tsx|js|jsx)$': [
      'ts-jest',
      {
        isolatedModules: true,
        transpileOnly: true
      }
    ]
  },
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node']
};
