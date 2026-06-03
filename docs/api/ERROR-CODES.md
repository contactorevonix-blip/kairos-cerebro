# API Error Codes Reference (S2.2)

## Format — RFC 7807 Problem Details

All errors return JSON with this structure:

```json
{
  "code": "ERROR_CODE",
  "message": "Human-readable message",
  "detail": "Additional context",
  "timestamp": "2026-06-03T15:42:00Z",
  "requestId": "req_abc123...",
  "fieldErrors": [
    { "field": "email", "message": "Must be valid email" }
  ]
}
```

---

## Error Codes

| Code | HTTP | Meaning | Action |
|------|------|---------|--------|
| `VALIDATION_ERROR` | 400 | Request validation failed | Check `fieldErrors` array for details |
| `AUTH_ERROR` | 401 | Authentication failed | Verify API key or session token |
| `RATE_LIMIT_EXCEEDED` | 429 | Rate limit hit | Wait `retryAfter` seconds |
| `NOT_FOUND` | 404 | Resource not found | Verify resource ID/URL |
| `INTERNAL_ERROR` | 500 | Server error | Retry; contact support if persists |

---

## Validation Errors (400)

**Example:**
```json
{
  "code": "VALIDATION_ERROR",
  "message": "Request validation failed",
  "detail": "Request validation failed",
  "fieldErrors": [
    { "field": "email", "message": "Invalid email format" },
    { "field": "name", "message": "Name required" }
  ]
}
```

---

## Authentication Errors (401)

**Missing API Key:**
```json
{
  "code": "AUTH_ERROR",
  "message": "API key required",
  "detail": "Provide key via Authorization header (Bearer <key>) or ?api_key=<key>"
}
```

**Invalid Key:**
```json
{
  "code": "AUTH_ERROR",
  "message": "Invalid or revoked API key",
  "detail": "Authentication failed"
}
```

---

## Rate Limit (429)

**Example:**
```json
{
  "code": "RATE_LIMIT_EXCEEDED",
  "message": "Rate limit exceeded. Retry after 60s",
  "detail": null,
  "retryAfter": 60
}
```

Use `retryAfter` header or response field to implement exponential backoff.

---

## Not Found (404)

**Example:**
```json
{
  "code": "NOT_FOUND",
  "message": "API key not found",
  "detail": "The requested api key does not exist"
}
```

---

## Server Errors (500)

**Example (production):**
```json
{
  "code": "INTERNAL_ERROR",
  "message": "Internal server error",
  "detail": "An unexpected error occurred"
}
```

Implementation details omitted for security. Check logs with `requestId`.

---

## Debugging with requestId

All errors include `requestId` for correlation with server logs:

```bash
grep requestId logs/error.log
```

Share `requestId` when reporting bugs.

---

**Last Updated:** 2026-06-03 (Sprint 2, Story S2.2)
