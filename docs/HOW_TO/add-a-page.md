# How to add a new page

Example: adding an "About Us" page at `/about`.

1. **Create the component**:
   `frontend/src/pages/About.tsx`
   ```tsx
   export default function About() {
     return (
       <div className="container mx-auto p-8">
         <h1 className="text-3xl font-bold">About Us</h1>
         <p>Some text here.</p>
       </div>
     );
   }
   ```

2. **Register the route** in `frontend/src/App.tsx`:
   ```tsx
   import About from "@/pages/About";
   // ...inside <Switch>:
   <Route path="/about" component={About} />
   ```

3. **(Optional) Add a link** in `frontend/src/components/layout/AppHeader.tsx` so users can find it.

4. **Reload** — `pnpm dev` auto-reloads. Visit `http://localhost:5173/about`.

That's it. You don't need to touch the backend unless the page needs data from the database.
