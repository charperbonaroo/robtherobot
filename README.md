# Rob the Robot

Rob The Robot is an AI powered footgun that might be somewhat useful. It can read and write files, and execute shell commands. It will do so based on your prompt.

```sh
robtherobot --help
robtherobot "Describe this repo"
robtherobot --continue "Fix the thing you did"
```

**THIS THING HAS ACCESS TO YOUR SHELL. IT BASICALLY READS ANY FILE ON YOUR SYSTEM, UPLOADS IT TO CHATGPT, AND EXECUTES THE OUTPUT. PLEASE USE WITH CAUTION.**

You'll need an [OpenAI API key](https://platform.openai.com/settings/organization/api-keys). Make sure it is available on your ENV as `OPENAI_API_KEY`, EG:

```sh
echo 'export OPENAI_API_KEY="sk-proj-XXXXXXXX"' > .envrc.local
bin/robtherobot "Hello"
```

Add the bin dir to your PATH and you're set. This following README is written by Rob the Robot.
