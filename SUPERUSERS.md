# AykorGPT Superuser Credentials

The application uses a Quick Login mechanism for local development that bypasses database lookups entirely and grants instant, unlimited queries.

| Role | Email | Password | Database Check | Quota Limit |
| :--- | :--- | :--- | :--- | :--- |
| **Super Admin** | `admin@aykorgpt.com` | `password123` | ✅ Verified | ♾️ Unlimited |
| **Super User** | `superuser@aykorgpt.com` | `password123` | ✅ Verified | ♾️ Unlimited |
| **Test User** | `testuser@aykorgpt.com` | `password123` | ✅ Verified | ♾️ Unlimited |

---

## How it works

These accounts have been manually seeded into the production Supabase database. They have the `superuser` plan, which the backend API recognizes and bypasses all daily quota limits for. 

You can log in via the normal `/login` page using the credentials above.
