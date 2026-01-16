# AI Assistant Guidelines for This Project

## Documentation Convention

### Explanation Files Location

All `.md` files created by AI assistants to explain bugs, implementations, or analyses should be placed in:

```
/explanations/
```

### Naming Convention

**Bug Fixes:**

- Format: `BUGNAME_FIX.md` or `BUGNAME_FIX_SUMMARY.md`
- Example: `AGE_BUG_FIX.md`, `AGE_RANGE_FIX_SUMMARY.md`

**Feature Implementations:**

- Format: `FEATURE_NAME_IMPLEMENTATION.md`
- Example: `CACHING_IMPLEMENTATION.md`, `COMPRESSION_FEATURE.md`

**Analysis/Investigation:**

- Format: `TOPIC_ANALYSIS.md` or `ISSUE_INVESTIGATION.md`
- Example: `BROWSER_FREEZING_FIX.md`, `PERFORMANCE_ANALYSIS.md`

**Success Reports:**

- Format: `FEATURE_SUCCESS.md` or `FIX_VERIFICATION.md`
- Example: `COUNT_ONLY_SUCCESS.md`

### Git Ignore Status

The `explanations/` directory is added to `.gitignore` to:

- Keep the repository clean
- Preserve documentation locally for reference
- Avoid cluttering commits with AI-generated docs

### Directory Structure

```
Viz2/
├── explanations/
│   ├── README.md (this file explains the directory)
│   ├── AGE_BUG_FIX.md
│   ├── AGE_RANGE_FIX_SUMMARY.md
│   └── [future explanation files]
├── src/
├── public/
└── .gitignore (contains "explanations/")
```

### When to Create Explanation Files

Create documentation in `explanations/` when:

1. **Fixing a bug** - Document the root cause and solution
2. **Implementing a feature** - Explain the approach and key decisions
3. **Performance optimization** - Detail the problem and improvements
4. **Investigating an issue** - Record findings and analysis
5. **Significant refactoring** - Explain the changes and rationale

### What to Include

Each explanation file should contain:

- **Problem Statement**: Clear description of the issue
- **Root Cause**: Technical explanation of why it occurred
- **Solution**: How it was fixed with code examples
- **Files Modified**: List of changed files
- **Testing Instructions**: How to verify the fix
- **Date**: When the fix was implemented
- **Impact Assessment**: Severity and user impact

### Example Template

```markdown
# [TITLE] Fix/Implementation

## Problem

[Clear problem description]

## Root Cause

[Technical explanation]

## Solution

[How it was fixed with code]

## Files Modified

1. path/to/file1.js
2. path/to/file2.js

## Testing

[How to verify]

## Date

[Date implemented]
```

## For AI Assistants

When working on this project:

1. Always place explanation `.md` files in `explanations/` directory
2. Use descriptive, ALL_CAPS_WITH_UNDERSCORES naming
3. Include comprehensive details with code examples
4. Reference specific file paths and line numbers
5. Provide clear testing instructions

---

*This convention helps maintain clean version control while preserving valuable development context.*

