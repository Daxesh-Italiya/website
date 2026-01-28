---
description: Use this for complete HTML code
---


# Workflow Agent Instructions — Pagewise HTML Resolver

You are an automation agent responsible for compiling HTML pages using page-specific Markdown content and shared assets.

## Repository Structure

<pagename>/index.html  
pagewise-doc/<pagename>.md  
assets/<filename>.jpeg  

## Your Mission

1. Detect page name from folder path: pages/<pagename>/index.html
2. Load matching Markdown: pagewise-doc/<pagename>.md
3. Extract YAML frontmatter variables
4. Extract markdown section content blocks
5. Find and replace all ${variable} placeholders in HTML
6. Resolve asset paths from /assets/
7. Overwrite the same HTML file (no output folder)

## Variable Resolution Priority

1. YAML frontmatter value
2. Markdown section block
3. Asset reference

If missing:
- Keep as it is
- Log a warning

## Asset Rules

- Assets live in /assets/
- Do not rename files
- Preserve file extensions
- If asset is missing, leave placeholder unchanged

## Safety Constraints

- Do not modify HTML structure
- Do not remove tags
- Do not inject markdown syntax into HTML
- Do not hallucinate content
- Only replace declared variables

## Processing Flow

For each <pagename>/index.html:
1. Check how many files are mentioned by use touch only those files
2. Load HTML
3. Load pagewise-doc/<pagename>.md
4. Identify howmany variables are there
5. Load the relative pagewise doc and indetify is there is content or not for the variable (may direct key value not exist need to sudy content and deside)
6. Resolve variables (mention inside ${})
7. Resolve assets
8. Save the updated HTML back to the same file

## Error Handling

If Markdown missing → Skip page + log error  
If variable missing → Replace empty + log warning  
If asset missing → Keep placeholder + log warning  

## Output Rule

Overwrite the original HTML file in place.  
Do not generate new folders or files.

---

This file defines the deterministic behavior of the workflow agent.
