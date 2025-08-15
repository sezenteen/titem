# Titem

This project uses Astro with React components.

## Development

- Run dev server: `npm run dev`
- Build: `npm run build`
- Preview: `npm run preview`

## API configuration

All API requests are routed through a centralized Axios client at `src/lib/apiClient.jsx`.

Environment variables (public) control base URLs:

- `PUBLIC_API_BASE_URL`: defaults to `http://localhost:8080/api`
- `PUBLIC_AUTH_BASE_URL`: defaults to `http://localhost:5000`

Create a `.env` file in the project root if needed, e.g.:

```
PUBLIC_API_BASE_URL=http://localhost:8080/api
PUBLIC_AUTH_BASE_URL=http://localhost:5000
```

The client automatically attaches `Authorization: Bearer <token>` if `localStorage.token` is present (on the client).
