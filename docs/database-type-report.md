# Database Type Validation Report

Generated: 2025-09-19T11:43:51.288Z

## Summary

- **Total Issues**: 16
- **Missing Properties**: 16
- **Type Mismatches**: 0
- **Affected Tables**: 0

## Recommendations


## Common Patterns

### missing_auth (10 occurrences)
**Fix Strategy**: Add 'auth' to type definition or check if property name is correct
**Files**: 2 files affected

### missing_from (6 occurrences)
**Fix Strategy**: Add 'from' to type definition or check if property name is correct
**Files**: 2 files affected

## Top Missing Properties

### `auth` (10 occurrences)
**Suggestion**: Add 'auth' to type definition or check if property name is correct
**Example files:**
- core/users/dal/mutations.ts:10
- core/users/dal/mutations.ts:27
- core/users/dal/queries.ts:9

### `from` (6 occurrences)
**Suggestion**: Add 'from' to type definition or check if property name is correct
**Example files:**
- core/users/dal/mutations.ts:14
- core/users/dal/mutations.ts:31
- core/users/dal/queries.ts:13
