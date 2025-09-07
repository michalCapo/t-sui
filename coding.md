# Coding style for Typescript

- when using typescript write as golang code
- dont use spread operator
- dont user ternary operator
- dont use object destructuring
- dont use arrow functions
- dont use `any` type
- use `unknown` type for variables that can be of any type.
- return errors as values
- when creating new object initialize its field with default values
- always use tsx to run typescript files
- never compile, when using typescript use tsx, when need to compile, remove javascript files
- when using tsc, use --noEmit to check for type errors without compiling
- use `prettier` for formatting.

# Formatting

- **Indentation**
    - Use **tabs** (or 2/4 spaces if project convention differs) for indentation, never mixed.
    - Indent consistently for blocks (`if`, `for`, `switch`, functions, etc.).

- **Braces & Blocks**
    - Opening brace `{` goes on the **same line** as the declaration.
        ```ts
        if (x < y) {
            foo();
        } else {
            bar();
        }
        ```
    - Always use braces, even for single-line statements (avoids ambiguity).

- **Line Length**
    - Prefer lines ≤ **100 characters**.
    - Break long expressions across multiple lines with indentation.

- **Spacing**
    - One space after keywords (`if`, `for`, `switch`, `function`, etc.).
    - No extra spaces inside parentheses or brackets:
        ```ts
        foo(x, y); // ✅
        foo(x, y); // ❌
        ```
    - Add a space around operators (`=`, `+`, `-`, `===`, etc.).

- **Imports**
    - Group standard/builtin modules, then third-party, then local/project imports.
    - Alphabetize within groups.
    - Use single import lines (avoid multiple names per import).

- **Declarations**
    - One declaration per line (except closely related constants).
    - Prefer `const` over `let`, and avoid `var`.

- **Functions**
    - Keep functions short and focused.
    - Use explicit return types for clarity.

- **Error Handling**
    - In Go, errors are explicit; in TS, handle errors with `try/catch` or `Result`-like patterns.
    - Don’t swallow errors silently.

- **Comments**
    - Use `//` for single-line, `/** */` for doc comments.
    - Comments should explain **why**, not just restate **what** the code does.
    - Exported functions/types should have a doc comment starting with the name:
        ```ts
        // Greet prints a greeting message.
        export function Greet(name: string): void { ... }
        ```

- **Blank Lines**
    - Use blank lines to group related statements logically.
    - Avoid excessive vertical whitespace.
