# AykorGPT Superuser Credentials

The application uses a Quick Login mechanism for local development that bypasses database lookups entirely and grants instant, unlimited queries.

| Role | Email | Password | Database Check | Quota Limit |
| :--- | :--- | :--- | :--- | :--- |
| **Super Admin** | `admin@aykorgpt.com` | N/A (Quick Login) | ❌ Bypassed | ♾️ Unlimited |
| **Super User** | `superuser@aykorgpt.com` | N/A (Quick Login) | ❌ Bypassed | ♾️ Unlimited |
| **Test User** | `testuser@aykorgpt.com` | N/A (Quick Login) | ❌ Bypassed | ♾️ Unlimited |

---

## How it works

- **Fast Login**: Click any of the quick superuser login buttons at the bottom of the `/login` page.
- **Mock Token**: The frontend injects a local mock token (e.g. `superuser-admin.0.mock_signature`).
- **Unlimited Usage**: The backend API recognizes this mock signature and assigns the `superuser` plan, bypassing daily quota checks. This prevents the need to hardcode passwords in the API source code.
