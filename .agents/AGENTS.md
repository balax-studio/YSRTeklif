# Workspace Agent Rules - YSR Teklif Takip

These rules optimize how the AI Agent (Antigravity) plans, executes commands, recovers from errors, and manages context budget within this workspace.

---

## 1. Planning & Execution Protocol
*   **Check Before Action:** Before proposing any file modifications or running build commands, verify the file paths and verify the state of the workspace using `list_dir` or `grep_search`.
*   **Checklist Tracking:** For multi-step tasks, create a `task.md` file in the artifact directory to track progress (`[ ]`, `[/]`, `[x]`). Do not rely on memory for phase transitions.

## 2. Command Execution & Windows Environment (PowerShell)
*   **Non-interactive Execution:** Always run terminal commands with flags that prevent interactive prompts (e.g., use `-y` or `--force`).
*   **Path Safety:** The workspace runs on Windows. Use backslashes `\` for local shell commands, but always use forward slashes `/` with the `file://` scheme when displaying clickable file links to the user.
*   **No cd Commands:** Never use `cd` commands. Always specify the target path using the `Cwd` parameter in the `run_command` tool.

## 3. Error Recovery Contract
When a command, file edit, or build fails, follow this recovery loop:
1.  **Diagnose:** Analyze the error output. State the root cause hint clearly.
2.  **Instruction:** Formulate a safe retry instruction (e.g., package installation, permission request, syntax correction).
3.  **Explicit Stop:** If the retry fails twice, stop executing, report the log, and ask the user for guidance. Do not loop infinitely.

## 4. Context Budgeting & Token Management
*   **Targeted Viewing:** Never view more than 400 lines of a file at once if a smaller range can be targeted using `grep_search` line numbers.
*   **Compact Prompting:** Do not re-summarize files or long plan documents in the response. Let the artifact files stand as the source of truth and only highlight key action items or open decisions.
*   **Reference Over Inlining:** Link to existing source code files (e.g., [ui.js](file:///c:/Users/YSR_MONSTER/.antigravity/YSR%20Teklif%20Takip/js/ui.js)) instead of copy-pasting massive code snippets into the chat.
