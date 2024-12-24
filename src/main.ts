import OpenAI from "openai";
import { Workspace } from "./Workspace";
import { mkdirSync, rmSync } from "node:fs";
const openai = new OpenAI();

// const completion = await openai.chat.completions.create({
//   model: "gpt-4o-mini",
//   messages: [
//     { role: "system", content: "You are a helpful assistant." },
//     {
//       role: "user",
//       content: "Write a haiku about recursion in programming.",
//     },
//   ],
// });

// console.log(completion.choices[0].message);
