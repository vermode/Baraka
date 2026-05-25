# How to add a new API endpoint

Example: `GET /api/hello` that returns `{ "message": "hi" }`.

There are TWO ways: the **quick way** (just write Express code) or the **proper way** (update the OpenAPI contract first so the frontend gets a typed hook automatically). Use the quick way to learn, then graduate to the proper way.

---

## Quick way

1. **Create the route** at `backend/src/routes/hello.ts`:
   ```ts
   import { Router, type IRouter } from "express";
   const router: IRouter = Router();

   router.get("/hello", (_req, res) => {
     res.json({ message: "hi" });
   });

   export default router;
   ```

2. **Register it** in `backend/src/routes/index.ts`:
   ```ts
   import helloRouter from "./hello";
   // ...
   router.use(helloRouter);
   ```

3. Restart backend (`Ctrl+C` then `pnpm dev:backend`) and test:
   `curl http://localhost:8080/api/hello`

---

## Proper way (so the frontend gets a typed hook)

1. Add the endpoint to `api-contract/spec/openapi.yaml` (look at existing entries to copy the shape).
2. Run `pnpm codegen` from the project root.
3. Two things now exist automatically:
   - `HelloResponse` Zod schema in `api-contract/zod/src/generated/api.ts` — use it in your route to validate the response.
   - `useHello()` React Query hook in `api-contract/react-client/src/generated/api.ts` — use it in any frontend component.
4. Write the route handler in `backend/src/routes/hello.ts` (same as the quick way).
5. Use the hook in the frontend:
   ```tsx
   import { useHello } from "@workspace/api-client-react";
   const { data, isLoading } = useHello();
   ```

This way you get autocomplete and TypeScript will catch you if the frontend and backend ever disagree.

---

## Need authentication?

Add the `requireAuth` (any logged-in user) or `requireAdmin` (admin only) middleware before your handler:

```ts
import { requireAuth, requireAdmin } from "../middlewares/auth";

router.get("/hello", requireAuth, (req, res) => {
  res.json({ message: `hi ${req.user.name}` });
});
```
