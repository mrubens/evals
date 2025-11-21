# Project Rules for Roo Code Agents

## Content Addition and Modification

### Rule: Check for Duplicate Content Before Adding

**Problem:** Agents may add duplicate or near-duplicate content without checking if similar content already exists.

**Required Actions:**
1. Before adding any content to a file, ALWAYS read the entire file first
2. Search for similar or duplicate content that may already exist
3. If similar content exists:
   - Ask the user if they want to replace, merge, or add despite the duplication
   - Provide specific details about what already exists (line numbers, exact content)
4. Never add content without first verifying it doesn't duplicate existing content

**Example Violations:**
- Adding the same joke twice to a README
- Adding similar stories with slightly different titles
- Appending content that semantically duplicates existing sections

**Correct Approach:**
```
User: "Add a joke to the README"
Agent Actions:
1. Read README.md completely
2. Search for existing jokes or similar content
3. If joke exists: "I found an existing joke at line 2. Would you like me to replace it, or add a different joke?"
4. If no joke exists: Proceed with addition
```

### Rule: Consider Project Context for Content Additions

**Problem:** Agents may add inappropriate content without considering the project's purpose and tone.

**Required Actions:**
1. Before adding non-technical content (jokes, stories, etc.) to technical repositories:
   - Evaluate if this type of content fits the project's purpose
   - Check if similar non-technical content already exists
   - Consider the project's established tone and style
2. For technical documentation repositories, question requests for entertainment content
3. Ask clarifying questions: "I notice this is a technical repository. Would you like me to add this [joke/story/etc.] to make the README more engaging, or would you prefer a different approach?"

**Example:**
```
User: "Add a joke"
Agent: "I notice this is a coding exercises repository. Would you like me to add a programming-related joke to make the README more engaging? I can also suggest alternative ways to make the documentation more approachable."
```

### Rule: Read Before Writing or Modifying

**Problem:** Making changes without understanding the full context of existing content.

**Required Actions:**
1. ALWAYS read the complete file before making ANY modifications
2. For large files, read the relevant sections plus surrounding context
3. Understand the file's structure and organization before adding content
4. Identify the most appropriate location for new content based on existing structure

**Never:**
- Append content blindly without reading the file
- Make assumptions about file content without verification
- Add content without considering existing organization

### Rule: Validate Changes Against Existing Content

**Problem:** Changes may create inconsistencies or conflicts with existing content.

**Required Actions:**
1. After reading a file and before making changes:
   - Identify any content that might conflict with proposed changes
   - Check for naming conflicts, duplicate sections, or contradictory information
2. When adding sections with titles/headings:
   - Verify no existing section has the same or very similar title
   - If similar titles exist, suggest merging or using more specific titles
3. For numbered or ordered content:
   - Maintain consistent numbering/ordering
   - Don't create duplicate entries

### Rule: Ask Clarifying Questions for Vague Requests

**Problem:** Vague requests like "add a joke" or "make it longer" can lead to inappropriate or duplicate additions.

**Required Actions:**
1. When receiving vague content requests, ask specific clarifying questions:
   - What type of content? (technical, humorous, explanatory, etc.)
   - Where should it be placed?
   - What's the intended purpose?
   - Should it replace or supplement existing content?
2. Provide 2-4 specific suggestions based on the project context
3. Never make assumptions about vague requests without clarification

**Examples of Good Clarifying Questions:**
```
User: "Add a joke"
Agent: "I can add a programming joke to the README. Would you like me to:
1. Add it near the title as a tagline
2. Create a new 'Fun Facts' section
3. Replace the existing joke at line 2
4. Add it to a specific section you have in mind"

User: "Make the title longer"
Agent: "I can expand the title. Which approach would you prefer:
1. Add a descriptive subtitle explaining the repository's purpose
2. Include key technologies/languages in the title
3. Add a tagline that describes the content
4. Something else specific you have in mind"
```

## Documentation Quality

### Rule: Maintain Professional Documentation Standards

**Required Actions:**
1. Keep documentation clear, concise, and well-organized
2. Use consistent formatting and structure
3. Ensure all sections serve a clear purpose
4. Remove or consolidate redundant content
5. Follow markdown best practices

### Rule: Review Your Own Changes

**Required Actions:**
1. After making changes to a file, re-read the modified sections
2. Check for:
   - Duplicate content
   - Formatting issues
   - Logical flow and organization
   - Consistency with existing content
3. If issues are found, fix them immediately before presenting to the user

## Git and PR Workflow

### Rule: Use Descriptive Commit Messages

**Required Actions:**
1. Follow conventional commit format: `type: description`
2. Use appropriate types:
   - `docs:` for documentation changes
   - `feat:` for new features
   - `fix:` for bug fixes
   - `refactor:` for code restructuring
   - `chore:` for maintenance tasks
3. Make commit messages specific and descriptive
4. Reference issue/PR numbers when applicable

**Examples:**
- Good: `docs: expand README title to be more descriptive`
- Bad: `Update README.md`
- Good: `docs: add programming joke to README`
- Bad: `add joke`

### Rule: Create Feature Branches for All Changes

**Required Actions:**
1. Never commit directly to main branch
2. Create descriptive branch names: `feature/description`, `fix/issue-name`, `docs/update-name`
3. Branch names should be lowercase with hyphens
4. Keep branch names concise but descriptive

**Examples:**
- Good: `docs/improve-readme-title`
- Good: `fix/duplicate-content`
- Bad: `update`
- Bad: `changes`

## Content Review and Quality Control

### Rule: Detect and Report Duplicate Content

**Required Actions:**
1. When reviewing files, actively look for:
   - Identical or near-identical text blocks
   - Duplicate sections with similar titles
   - Repeated information in different formats
2. Report duplicates with specific line numbers and content excerpts
3. Suggest consolidation or removal of duplicates
4. Never create new duplicates

### Rule: Maintain Content Relevance

**Required Actions:**
1. Ensure all content serves the project's purpose
2. Question additions that don't align with project goals
3. Suggest removing or relocating off-topic content
4. Keep technical repositories focused on technical content

## Implementation Guidelines

### When to Apply These Rules

**Always:**
- Before adding any content to any file
- Before modifying existing content
- When reviewing changes made by others
- When responding to vague user requests

**Especially Important For:**
- README files and documentation
- Public-facing content
- Files with established structure
- Content that will be reviewed by others

### How to Apply These Rules

1. **Read First:** Always read the complete file before making changes
2. **Search:** Look for existing similar content
3. **Question:** Ask clarifying questions for vague requests
4. **Verify:** Check that your changes don't create duplicates or conflicts
5. **Review:** Re-read your changes before submitting
6. **Report:** Clearly communicate what you found and what you changed

### Priority Order

When multiple rules apply, follow this priority:
1. Prevent duplicate content (highest priority)
2. Maintain project context and appropriateness
3. Ask clarifying questions for vague requests
4. Follow git workflow and commit message standards
5. Maintain documentation quality standards

## Examples from Real Scenarios

### Scenario: User Requests "Add a joke"

**Wrong Approach:**
```
Agent: *immediately adds a joke without checking*
Result: Creates duplicate joke in the file
```

**Correct Approach:**
```
Agent Actions:
1. Read README.md completely
2. Find existing joke at line 2
3. Respond: "I found an existing programming joke at line 2: 'Why do programmers prefer dark mode? Because light attracts bugs!' Would you like me to:
   - Replace it with a different joke
   - Add a second joke in a new section
   - Keep the existing one as is"
```

### Scenario: User Requests "Add a story about a kangaroo"

**Wrong Approach:**
```
Agent: *appends story without checking*
Result: Creates duplicate or near-duplicate story
```

**Correct Approach:**
```
Agent Actions:
1. Read README.md completely
2. Find existing kangaroo story at lines 34-46
3. Respond: "I found an existing story about Roo the Coding Kangaroo at lines 34-46. Would you like me to:
   - Replace the existing story with a new one
   - Add a second story with a different focus
   - Expand the existing story with additional content"
```

### Scenario: Multiple Similar Requests

**Pattern Recognition:**
When a user makes multiple similar requests (add joke, add story, make longer), this suggests they may be testing or exploring. In such cases:

1. Check for accumulating duplicates after each request
2. Proactively suggest consolidation if duplicates are building up
3. Ask if the user wants to review and clean up before continuing
4. Don't assume each request should result in pure addition

## Summary

The core principle: **Always read and understand before writing or modifying.** This simple rule prevents most content quality issues, including duplicates, inappropriate additions, and structural problems.