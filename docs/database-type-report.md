# Database Type Validation Report

Generated: 2025-09-19T02:01:12.452Z

## Summary

- **Total Issues**: 117
- **Missing Properties**: 46
- **Type Mismatches**: 71
- **Affected Tables**: 0

## Recommendations

- ⚠️ Type Safety: Many type mismatches detected. Run TypeScript strict mode and fix all any types.

## Common Patterns

### missing_from (30 occurrences)
**Fix Strategy**: Add 'from' to type definition or check if property name is correct
**Files**: 3 files affected

### missing_auth (13 occurrences)
**Fix Strategy**: Add 'auth' to type definition or check if property name is correct
**Files**: 3 files affected

### missing_organization (1 occurrences)
**Fix Strategy**: Add 'organization' to type definition or check if property name is correct
**Files**: 1 files affected

### missing_tier_id (1 occurrences)
**Fix Strategy**: Try camelCase version: 'tierId'
**Files**: 1 files affected

### missing_last_visit_at (1 occurrences)
**Fix Strategy**: Try camelCase version: 'lastVisitAt'
**Files**: 1 files affected

## Top Missing Properties

### `from` (30 occurrences)
**Suggestion**: Add 'from' to type definition or check if property name is correct
**Example files:**
- core/customer/dal/appointments.ts:25
- core/customer/dal/appointments.ts:187
- core/customer/dal/appointments.ts:290

### `auth` (13 occurrences)
**Suggestion**: Add 'auth' to type definition or check if property name is correct
**Example files:**
- core/customer/dal/appointments.ts:15
- core/customer/dal/appointments.ts:181
- core/customer/dal/appointments.ts:284

### `organization` (1 occurrences)
**Suggestion**: Add 'organization' to type definition or check if property name is correct
**Example files:**
- core/analytics/dal/analytics-types.ts:62

### `tier_id` (1 occurrences)
**Suggestion**: Try camelCase version: 'tierId'
**Example files:**
- core/loyalty/dal/loyalty.ts:264

### `last_visit_at` (1 occurrences)
**Suggestion**: Try camelCase version: 'lastVisitAt'
**Example files:**
- core/loyalty/dal/loyalty.ts:265
