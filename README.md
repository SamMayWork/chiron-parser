# Chiron Parser

This module is responsible for taking the content created by lecturers and compiling it down to a `JSON` file that can be loaded by students. 

---

- [Chiron Parser](#chiron-parser)
  - [Getting Started](#getting-started)
    - [Prerequisites](#prerequisites)
    - [Writing Content](#writing-content)
  - [Markdown Structure](#markdown-structure)
    - [Overview](#overview)
    - [PreCommands](#precommands)
    - [Markdown](#markdown)
    - [PostChecks](#postchecks)
  - [Samples](#samples)
  - [Sharing the JSON with Students](#sharing-the-json-with-students)

---

## Getting Started

---

### Prerequisites

To get started writing content for the Chiron Client Container, there are some prerequistes:
  - Ensure this repository is cloned to your machine
  - Download and install at least **Node 16, this will not work with versions less than 16**.

If you'd like to verify your installation was successful, run the tests and if all pass, you're correctly configured. 

---

### Writing Content

To write some content for the tool, create a directory within this repository with a Markdown file (for instance something like `rust-basics/tutorial.md`). Inside of this markdown file is where you will write your content. 

For more information about _how_ to write content in this file and the structure of the language, refer to [Markdown Structure](#markdown-structure)

---

## Markdown Structure

---

### Overview

Content in the Markdown files takes the following structure:

```Markdown
-> START PAGE
[Commands to configure the container for the learner]

# Markdown Title

Welcome to my awesome tutorial! The content between the commands at the start and the commands at the bottom is just pure Markdown!

[Commands to check the content the user has produced]
-> END PAGE

... n many more pages
```

Commands at the start (`PreCommands`) configure the container and environment for the student, checks at the end (`PostChecks`) wait for a condition to be fulfilled before continuing to the next page of content.

All commands intended for the parser start with `->` and then a command word, all other content is treated as Markdown.

_There is no limit on the number of pages a document can have._

---

### PreCommands

The available `PreCommands` are:
 - `INCLUDEFILE` - When given a file in the current working directory, copies the file and pastes it into the student container when that content is reached.
 - `EXECCOMMAND` - Executes a given command against the student container

More details about how each command works can be found in [the full documentation.](./docs/commands.md)

---

### Markdown

This tool support normal, GitHub style Markdown with support for Images and Code Blocks. 

Images must be placed in the same directory as the Markdown file to be compiled and referenced in normal Markdown, like so:

```
![Compile Image](./compiler.png)
```

---
### PostChecks

The available `PostChecks` are:
  - `COMMANDWAIT` - Waits until a specific command has been entered into the terminal
  - `CHECKCOMMANDOUT` - Runs a string match against command output, passes if the command output contains that string

More details about how each command works can be found in [the full documentation.](./commands.md)

---

## Samples

Some sample Markdown documents can found in the `samples/` directory, these show the usage of commands and different types of content.

---
## Sharing the JSON with Students

Students do _not_ need to have this tool installed, they only require the client container (more information available [here](https://github.com/SamMayWork/chiron-client/blob/main/README.md)). To share the content created here, the compiled JSON file must be uploaded somewhere accessible over the public internet without authentication.

The easiest way to share the compiled file is using [GitHub Gists](https://gist.github.com/) as this makes the file publiclly accessible without any required authentication. Create a 'secret' gist to share the content and then give the url (without the preceeding `https://`) to the student who will then be able to load the content.