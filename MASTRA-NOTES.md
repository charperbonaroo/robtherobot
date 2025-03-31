I wanted to rewrite an existing project to use mastra. Here's my notes.

- Node v23.9.0
- TypeScript 5.7.2
- Yarn 4.5.3 (blank `.yarnrc`)

I started with "Manual Installation" (which cannot be linked to, you have to scroll to it from "Installation" - https://mastra.ai/docs/getting-started/installation).

- I ignored the tsconfig. Why does a library care about my tsconfig? Why is typescript required anyway?
- I don't like how the library is opinionated about importing Agent from `@mastra/core/agent`.
- I had to use package extensions for cohere-ai to fix a dependency error

```yml
packageExtensions:
  "cohere-ai@*":
    dependencies:
      "@aws-crypto/sha256-js": "*"

```
