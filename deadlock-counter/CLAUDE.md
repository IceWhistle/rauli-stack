# CLAUDE.md - Automated Self-Review

Before completing any task, run these checks:

## Security Checks
- [ ] Scan for hardcoded secrets, API keys, passwords
- [ ] Check for SQL injection, shell injection, path traversal
- [ ] Verify all user inputs are validated
- [ ] Check for prototype pollution in JS objects
- [ ] Ensure no sensitive data in error messages or logs

## Code Quality
- [ ] Run the test suite (`npm test`)
- [ ] Check for type errors
- [ ] Validate all external inputs (user data, IPC messages)
- [ ] Check for memory leaks in long-running processes

## Before Merge
- [ ] Run `npm audit` for dependency vulnerabilities
- [ ] Check for leaked secrets with gitleaks
- [ ] Ensure no console.log with sensitive data
- [ ] Verify error handling doesn't expose internals

## Electron-Specific
- [ ] nodeIntegration should be false in production (use contextBridge)
- [ ] Validate all IPC message inputs
- [ ] No shell commands with user-controlled input
- [ ] webSecurity should not be disabled
