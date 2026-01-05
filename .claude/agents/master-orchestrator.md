# AI-Assisted Testing Workflow - Master Orchestrator

## Overview

This document defines the **agent boundaries**, **handoff points**, and **workflow rules** for AI-assisted Playwright testing.

## The Agents

### 1. Scout Agent (`scout-agent.md`)
**Job:** Analyze pages and find element locators
**Input:** Specific feature/component to analyze from user
**Output:** Scout report with recommended locators
**Stops at:** Report delivery - does NOT write code

### 2. Writer Agent (`writer-agent.md`)
**Job:** Write test code and page objects
**Input:** Scout report
**Output:** Page object, fixture, and test files
**Stops at:** File creation - does NOT run tests

### 3. Healer Agent (`healer-agent.md`)
**Job:** Fix test failures
**Input:** Test failure output
**Output:** Updated code with fixes
**Stops at:** After one fix attempt - does NOT iterate forever

## Critical Rules

### Agent Boundaries (DO NOT CROSS)

**Scout Agent:**
- ✅ Takes screenshots
- ✅ Inspects DOM
- ✅ Recommends locators
- ✅ Reports findings
- ❌ Does NOT write code
- ❌ Does NOT run tests
- ❌ Does NOT fix failures

**Writer Agent:**
- ✅ Reads Scout reports
- ✅ Writes page objects
- ✅ Writes fixtures
- ✅ Writes tests
- ❌ Does NOT run tests
- ❌ Does NOT try to heal failures
- ❌ Does NOT iterate on code without user approval

**Healer Agent:**
- ✅ Reads test failures
- ✅ Re-scouts failed elements
- ✅ Updates locators
- ✅ Fixes code
- ❌ Does NOT make multiple fix attempts without user approval
- ❌ Does NOT redesign the test approach
- ❌ Does NOT scout new features

## Workflow Stages

### Stage 1: User Defines Test Scope

**User must provide:**
1. Specific feature/component to test
2. Specific elements to find
3. Expected assertions/actions

**Example:**
```
User: "I need to test the wallet connection modal.
Elements: modal container, close button, Google login, X login, Connect Wallet button
Assertions: modal opens, buttons are clickable, modal closes"
```

**Anti-pattern:**
```
User: "Test the homepage"  ← Too vague
```

### Stage 2: Scout Analysis

**Trigger:** User invokes Scout with specific instructions

**Process:**
1. Scout verifies instructions are specific enough
2. If vague → Scout asks for clarification
3. If clear → Scout analyzes the specified elements only
4. Scout produces report
5. **STOP** - Scout reports to user

**User checkpoint:** Review Scout report, approve/modify

### Stage 3: Code Writing

**Trigger:** User invokes Writer with Scout report

**Process:**
1. Writer reads Scout report
2. Writer creates/updates page object
3. Writer creates/updates fixture (if needed)
4. Writer creates test file
5. Writer presents files to user
6. **STOP** - Writer does not run tests

**User checkpoint:** Review code, save files

### Stage 4: Test Execution

**Trigger:** User runs tests (manually or asks Claude)

**Process:**
1. User runs: `npx playwright test [file]`
2. OR user asks: "Run the test"
3. Tests execute via Playwright MCP
4. Results shown to user

**Outcomes:**
- ✅ Tests pass → Done
- ❌ Tests fail → Go to Stage 5

### Stage 5: Healing Failures

**Trigger:** User invokes Healer with test failure output

**Process:**
1. Healer reads failure messages
2. Healer identifies which elements failed
3. Healer re-scouts those specific elements
4. Healer updates locators in page object
5. Healer presents updated code
6. **STOP** - Healer waits for user to re-run

**User checkpoint:** Review fixes, re-run tests

**If still failing:** User can invoke Healer again OR modify approach

## Handoff Protocol

### Scout → User
```markdown
Scout Report: [Feature Name]

[Elements and locators found]

---
**Handoff to User:**
- Review the locators above
- If approved, invoke Writer Agent
- If changes needed, provide feedback
```

### Writer → User
```markdown
Files Created:
1. Page Object: src/pages/[Page].ts
2. Fixture: src/fixtures/[page].fixture.ts
3. Test: tests/[Page].spec.ts

Summary:
- X locators created
- Y TODOs for missing data-testids
- Z wait strategies added

---
**Handoff to User:**
- Save these files to your project
- Run: npx playwright test tests/[Page].spec.ts
- If failures occur, invoke Healer Agent
```

### Healer → User
```markdown
Fixes Applied:
1. Updated locator for [element] in [file]
2. Added wait strategy for [element]
3. Fixed [specific issue]

---
**Handoff to User:**
- Review the fixes above
- Re-run the test
- If still failing, I can try again with different approach
```

## User Invocation Patterns

### Invoking Scout
```
"Use scout-agent.md context.
Scout the [specific feature].
Elements to find: [list]
Assertions needed: [list]"
```

### Invoking Writer
```
"Use writer-agent.md context.
Based on the Scout report above,
write the page object, fixture, and test."
```

### Invoking Healer
```
"Use healer-agent.md context.
The test failed with these errors: [paste errors]
Fix the locators."
```

## Anti-Patterns (NEVER DO)

❌ **Agent Crossing Boundaries**
```
Scout starts writing code → WRONG, Scout only analyzes
Writer runs tests → WRONG, Writer only writes
Healer scouts new features → WRONG, Healer only fixes
```

❌ **Vague User Instructions**
```
User: "Test the page"
Agent: Proceeds without clarification → WRONG
Correct: Agent asks "Which specific elements should I test?"
```

❌ **Infinite Loops**
```
Healer fixes → auto-runs → fails → auto-fixes → repeat → WRONG
Correct: Healer fixes → STOPS → waits for user
```

❌ **Skipping Handoffs**
```
Scout → Writer → Run → Heal → all automatic → WRONG
Correct: Scout → STOP → User reviews → Writer → STOP → User reviews → etc.
```

## Success Criteria

✅ **Clear Boundaries:** Each agent knows exactly where their job ends

✅ **User Control:** User approves each stage before proceeding

✅ **Specific Scope:** Tests are focused on defined features, not whole pages

✅ **Traceable:** Each stage produces clear output for user review

✅ **No Infinite Loops:** Agents stop and wait for user input

## Workflow Example (Full Cycle)

```
1. User: "Scout the wallet connection modal. Find: modal container, 
         close button, login buttons. Test: modal opens/closes, 
         buttons clickable."

2. Scout: [Analyzes] → [Reports findings] → STOPS

3. User: [Reviews] → "Looks good, proceed"

4. User: "Use Writer to create the test"

5. Writer: [Writes code] → [Presents files] → STOPS

6. User: [Saves files] → Runs: npx playwright test ConnectModal.spec.ts

7. Test: FAILS - "Close button not found"

8. User: "Use Healer to fix the close button locator"

9. Healer: [Re-scouts close button] → [Updates locator] → STOPS

10. User: [Reviews fix] → Re-runs test

11. Test: PASSES ✅

12. Done.
```

## Emergency Stop Protocol

If any agent starts doing things outside their role:

**User says:** "STOP. Stay in your role as [Agent Name]."

Agent acknowledges and returns to boundaries.

## Agent Self-Check Questions

Before proceeding, each agent asks itself:

**Scout:**
- "Do I have specific instructions?"
- "Am I analyzing only what was requested?"
- "Have I reported and STOPPED?"

**Writer:**
- "Did I receive a Scout report?"
- "Have I written the code?"
- "Have I STOPPED without running tests?"

**Healer:**
- "Did I receive test failure output?"
- "Have I fixed only what failed?"
- "Have I STOPPED without re-running?"

## Summary

The key to effective AI-assisted testing:

1. **User drives** - Agents execute
2. **Clear scope** - No vague instructions
3. **Agent boundaries** - Stay in your lane
4. **Stop points** - Always hand back to user
5. **One step at a time** - No automation soup

This creates a **collaborative, controlled, and effective** testing workflow.