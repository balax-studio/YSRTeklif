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

## 5. Premium Antislop Design & Visual Standards (design-taste-frontend & gpt-taste)
*   **The 3 Dials:** Calibrate UI density and motion using the dials: `DESIGN_VARIANCE` (default 8), `MOTION_INTENSITY` (default 6), and `VISUAL_DENSITY` (default 4).
*   **Hero H1 Line Limit:** The H1 main headline must NEVER exceed 2-3 lines. Set container width to `max-w-5xl` or `max-w-6xl` to allow horizontal flow. Avoid taglines/tag-pills inside the hero.
*   **Gapless Bento Grid:** Always apply `grid-flow-dense` to bento grids. Check col-span/row-span values mathematically to ensure there are no empty gaps/voids.
*   **Rhythm & Layout Alternation:** Do not use more than two consecutive sections with the same split layout (e.g., left-image/right-text). Break the pattern with a bento grid, marquee, full-width content, or scroll-stack.
*   **Spacing & Theme Lock:** Use generous vertical padding between sections (`py-32 md:py-48`). Maintain one consistent page theme; do not flip section backgrounds between light and dark modes within a single page.
*   **Eyebrow Restraint:** Max 1 uppercase/monospace eyebrow tag (e.g., `text-[11px] uppercase tracking-[0.18em]`) per 3 sections.
*   **CTA Wrap & Intent Check:** Desktop CTA button labels must fit on a single line. Avoid duplicate call-to-action intent with different labels (e.g., do not mix "Get started" and "Sign up free" on the same page).
*   **Logo Wall Rules:** Referencing logo walls must contain only SVG marks (preferably via Simple Icons). Do not display category or industry text labels under logos.
*   **AIDA Flow:** Structure pages following: Attention (Hero) -> Interest (Features/Bento) -> Desire (GSAP Scroll/Interactions) -> Action (Footer/CTA).
*   **No Placeholders:** Avoid fake UI screens, generic SVGs, or text wordmarks. Use real images or generate them with tools.
*   **Accessibility (A11y):** All text, inputs, and button components must pass WCAG AA contrast (min 4.5:1). Respect `prefers-reduced-motion` for all GSAP/Motion animations.

