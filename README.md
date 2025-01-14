
# Rob the Robot

## Overview

Rob the Robot is an AI-powered assistant, termed as a footgun, that has the capability to access your machine, execute shell commands, and manipulate files. Designed for performing simple code-related tasks, it operates within the current working directory but be aware of its broad access and capabilities.

### Features

- Execute tasks given by the user within a new context each time.
- Capable of continuing from a prior session using the `--continue` flag.
- Highly experimental; Use version control for safety.

## How to Start the App

1. Ensure you have dependencies and prerequisites installed as per the project requirements.
2. Run the following command to describe this repository:
   ```sh
   robtherobot "Describe this repo"
   ```

3. To continue working on a task from a previous session:
   ```sh
   robtherobot --continue "You made an oopsie, fix it"
   ```

## How to Add `bin/robtherobot` to PATH

To easily run `robtherobot` from any terminal session, you’ll need to add it to your system’s PATH environment variable. Here's how:

### For Linux/macOS

1. Open your terminal.
2. Open your shell profile file in a text editor. This file is usually located in your home directory and might be named something like `~/.bashrc`, `~/.bash_profile`, or `~/.zshrc` for Zsh users.
3. Add the following line to the file, replacing `/path/to/bin` with the actual path to the directory containing `robtherobot`:
   ```sh
   export PATH="/path/to/bin:$PATH"
   ```
4. Save the changes and close the text editor.
5. Apply the changes with the following command:
   ```sh
   source ~/.bashrc
   ```
   *(Replace `.bashrc` with the appropriate file you edited.)*

### For Windows

1. Right-click on `This PC` or `Computer` from the file explorer and select `Properties`.
2. Click on `Advanced system settings`.
3. Under the `Advanced` tab, click `Environment Variables`.
4. In the `System variables` section, find the `Path` variable and select it, then click `Edit`.
5. Add the path to your `bin` directory, ensuring `;` precedes the new entry if there's existing content.
6. Confirm all dialogues and relaunch your command prompt to see changes.
