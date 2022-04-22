# Command Documentation

---

- [Command Documentation](#command-documentation)
  - [PreCommands](#precommands)
    - [`INCLUDEFILE <file name>.<file extension>`](#includefile-file-namefile-extension)
    - [`EXECCOMMAND <command>`](#execcommand-command)
    - [`APPLY <file name>.<file extension>`](#apply-file-namefile-extension)
    - [`WAIT <resource type> NAME <name> COUNT <equality operator> <check number>`](#wait-resource-type-name-name-count-equality-operator-check-number)
  - [PostChecks](#postchecks)
    - [`COMMANDWAIT <command>`](#commandwait-command)
    - [`CHECKCOMMANDOUT <string>`](#checkcommandout-string)
    - [`CHECK <resource type> NAME <name> COUNT <equality operator> <check number>`](#check-resource-type-name-name-count-equality-operator-check-number)
---

## PreCommands

---

### `INCLUDEFILE <file name>.<file extension>`

Uploads a file to the student container when the line is executed by the client.

**Example Usage:**

Consider the `samples/rust-basics/` directory in this repository:

```
rust-basics/
  tutorial.md
  helloworld.rs
  compiler.png
  out.json
```

When the student starts the container the content of their `/host` directory would be:

```
drwxr-xr-x   3 samuelmay  staff   96 20 Apr 19:50 .
drwxr-xr-x  19 samuelmay  staff  608 20 Apr 19:50 ..
```

To include the `helloworld.rs` file in the students container using Markdown:

```
-> START PAGE
-> INCLUDEFILE helloworld.rs

...

-> END PAGE
```

When this page is processed by the client, it then creates the `helloworld.rs` file in the students `/host` directory with the same content as your copy in this directory. Their directory would then look like:

```
drwxr-xr-x   3 samuelmay  wheel   96 22 Apr 10:36 .
drwxrwxrwt  12 root       wheel  384 22 Apr 10:34 ..
-rw-r--r--   1 samuelmay  wheel   42 20 Apr 19:57 helloworld.rs
```

---

### `EXECCOMMAND <command>`

Executes a given command against the students container. The students container has access to `/bin/sh` so commands that work with `sh` will work when passed to this command.

**Example Usage:**

```
-> START PAGE
-> EXECCOMMAND touch helloworld.txt
-> EXECCOMMAND export VALUE=123

...

-> END PAGE
```

This would create a file, `helloworld.txt`, on the student container, so their directory would look like:

```
drwxr-xr-x   3 samuelmay  wheel   96 22 Apr 10:36 .
drwxrwxrwt  12 root       wheel  384 22 Apr 10:34 ..
-rw-r--r--   1 samuelmay  wheel   42 20 Apr 19:57 helloworld.txt
```

And the second command would export an environment variable, `VALUE` with the value `123`.

---

### `APPLY <file name>.<file extension>`

**This is a Kubernetes specific PreCommand not available for use with Rust**

---

### `WAIT <resource type> NAME <name> COUNT <equality operator> <check number>`

**This is a Kubernetes specific PreCommand not available for use with Rust**

---

## PostChecks

---

### `COMMANDWAIT <command>`

Waits until a specific command has been entered by the user into the terminal. `COMMANDWAIT` also supports wildcard matching using `*` for commands where any form is acceptable.

**Example Usage:**

```
-> START PAGE

...

-> COMMANDWAIT ls -al
-> COMMANDWAIT echo *
-> END PAGE
```

This example would not progress to the next page of content unless `ls -al` was executed first AND `echo <anything>` was executed after.

---

### `CHECKCOMMANDOUT <string>`

Waits until content of `stdout` matches the string that is provided, useful for seeing if the output of a command matches a given string.

**Example Usage:**

If students were given the task to print the fibonnaci sequence using Rust you could write:

```
-> START PAGE

...

-> CHECKCOMMANDOUT 0, 1, 1, 2, 3, 5, 8, 13, 21, 34
-> END PAGE
```

Which would progress the content if, and only if, the output of any command contained the string `0, 1, 1, 2, 3, 5, 8, 13, 21, 34`.

**Careful!**

Matching is done using simple `.includes()` which means that if any part of the output matches the given string, the content will progress, take the following example:

```
-> START PAGE

...

-> CHECKCOMMANDOUT e
-> END PAGE
```

If a command outputted the string `Hello, world!` the content would progress as `e` is included in `Hello, World!`.

---

### `CHECK <resource type> NAME <name> COUNT <equality operator> <check number>`

**This is a Kubernetes specific PreCommand not available for use with Rust**

---