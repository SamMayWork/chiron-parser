# Chiron-Parser

This module is responsible for compiling MarkDown DESL into text and command content that can be read by chiron-client.

## Running the Parser

To run the parser use the following command:

```
npm start <path/to/file/to/compile.md> <optional/output/path.json>
```

If a second parameter for output is not defined, an `out.json` file will be created in the same directory at the input file.

## Running the Tests

Run `npm t`

## Samples

Samples of the DESL can be found in the `samples/` directory.