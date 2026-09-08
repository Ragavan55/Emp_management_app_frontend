This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:
# Frontend

Next.js 16 and React 19 client for the employee management API. The UI uses the App Router and Tailwind CSS 4, with client-side fetches for authenticated data.

## Setup

The frontend uses the deployed Render API directly at `https://emp-management-app-backend.onrender.com`; no frontend environment variable is required:

```powershell
cd frontend
npm install
npm run dev
```

Open `http://localhost:3000`. The same deployed API is used in local development and in Vercel. Run `npm run build` to create a production build and `npm run start` to serve it.

## User workflow

- `/` redirects to `/login`.
- `/login` validates credentials, calls `POST /auth/login`, saves the returned JWT, and navigates to the dashboard.
- `/dashboard` displays total, active, and inactive counts plus department and designation distributions from `/employees/stats/summary`.
- `/employees` displays a desktop table or mobile cards. It supports debounced name/email search, multi-select department and status filters, URL-backed pagination, view, edit, and delete actions.
- `/employees/new` validates and creates an employee, and confirms before discarding unsaved values.
- `/employees/[id]` shows one employee record.
- `/employees/[id]/edit` loads and updates an existing record.

## Authentication behavior

After login the backend sets an HttpOnly `token` cookie and returns an access token in JSON. The frontend stores the returned token in localStorage under `employee_mgmt_token` and adds `Authorization: Bearer <token>` to API calls. A `401` response clears local storage and redirects to `/login`.

## Frontend structure

- `app/layout.tsx`: global layout, metadata, and navigation.
- `app/page.tsx`: root redirect.
- `app/login/page.tsx`: login form and error handling.
- `app/dashboard/page.tsx`: summary dashboard.
- `app/employees/page.tsx`: listing, filters, pagination, and delete confirmation.
- `app/employees/new/page.tsx`: create form.
- `app/employees/[id]/page.tsx`: detail view.
- `app/employees/[id]/edit/page.tsx`: edit form.
- `components/AppNavigation.tsx`: responsive navigation and logout.
- `components/ui/`: reusable button, input, status, loading, and modal components.
- `lib/api.ts`: typed generic request helper with JSON, 204, and 401 handling.
- `lib/auth.ts`: localStorage token helpers.

## API contract used by the UI

The frontend expects the FastAPI service to expose:

| Method | Path | Used by |
| --- | --- | --- |
| POST | `/auth/login` | Login |
| POST | `/auth/logout` | Navigation logout |
| GET | `/employees/stats/summary` | Dashboard and department filter options |
| GET | `/employees` | Employee list |
| GET | `/employees/{id}` | Detail and edit pages |
| POST | `/employees` | New employee page |
| PUT | `/employees/{id}` | Edit employee page |
| DELETE | `/employees/{id}` | List delete action |

Employee forms send `name`, `email`, `phone`, `department`, `designation`, `joining_date`, and `status`. The API performs final validation, so client validation only improves feedback and cannot replace backend authorization or validation.

## Commands

```powershell
npm run dev
npm run lint
npm run build
npm run start
```

If requests fail in the browser, check that the deployed backend is reachable and backend `CORS_ORIGINS` includes `https://emp-management-app-frontend.vercel.app`. Backend secrets must never be placed in frontend code or environment variables exposed to the browser.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
