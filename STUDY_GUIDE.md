# DJ Crate study guide

How to use this before Thursday: run the app, open one file per section below,
read the comments in it, then answer the "they might ask" questions out loud
without looking. Saying it aloud is the practice.

I don't know what the interviewers will actually ask. These are the topics a
senior React interview most often covers, and each one is something you can now
point to in code you have run.

**Suggested order (about 3 hours):** 1 → 2 → 3 → 4 on day one, 5 → 6 → 7 on day
two, then re-read section 8 the morning of.

---

## 1. Closures, finally at 100%

File: `src/hooks/useDebouncedValue.ts`

The "backpack" picture is right. The missing 10% is usually this:

> **A function does not carry a copy of the values. It carries a link to the
> variables that existed where it was created.** And in React, every render
> creates brand new variables.

```js
function Counter() {
  const [count, setCount] = useState(0);
  // Render 1 creates a `count` variable holding 0.
  // Render 2 creates a DIFFERENT `count` variable holding 1.
  useEffect(() => {
    const id = setInterval(() => console.log(count), 1000);
    return () => clearInterval(id);
  }, []); // <- runs once, so the arrow function is from render 1
}
```

That logs `0` forever. The arrow function was created in render 1, so its
backpack links to render 1's `count`. Later renders make new `count` variables
the old function has never heard of. This is a **stale closure**, and it is the
single most common React hooks bug.

In `useDebouncedValue`, the effect lists `[value, delayMs]` as dependencies, so
each new value creates a new timer function with a fresh backpack, and the
cleanup cancels the old one.

**They might ask**

- *What is a closure?* A function plus the variables in scope where it was
  defined, which it can still read after that outer function has returned.
- *What is a stale closure and how do you fix it?* A callback that captured
  values from an old render. Fix by listing the value in the dependency array,
  using the updater form `setCount(c => c + 1)`, or keeping the latest value in
  a ref.
- *Why does the dependency array exist?* It tells React when the effect's
  backpack is out of date and the effect must be re-created.

**Python bridge:** Python closures work the same way, including the link (not
copy) behaviour. The famous gotcha is identical:
`fns = [lambda: i for i in range(3)]` gives three functions that all return
`2`, because they share one `i`. JavaScript's `var` in a loop does the same;
`let` fixes it by making a new variable per iteration.

---

## 2. State management

Files: `src/cart/cartReducer.ts`, `src/cart/CartContext.tsx`,
`src/alternatives/cartStore.zustand.ts`

**The reducer.** Every way the crate can change is one `case` in one pure
function: `(state, action) => newState`. It never edits the old state; it
returns a new object. React checks "is this the same object as before?" to
decide whether to re-render, so mutating in place would hide the change. When
nothing changes (adding a duplicate) the reducer returns the *same* object, and
React skips the render.

**Why two contexts.** Any component that reads a context re-renders when that
context's value changes. `dispatch` never changes, so components that only send
actions read `CartDispatchContext` and never re-render because of the crate.
Components that display the crate read `CartStateContext`.

**Hydration.** The server cannot see `localStorage`. If the first browser render
showed 3 saved songs while the server HTML said 0, React would report a
hydration mismatch. So the first render is empty everywhere, and an effect loads
the saved crate right after.

**They might ask**

- *useState or useReducer?* useState for independent values. useReducer when the
  next state depends on the previous one in several ways, or when you want the
  rules testable without rendering anything (see `cartReducer.test.ts`, which
  has no React in it at all).
- *When is Context not enough?* Context has no "subscribe to one slice". Any
  change re-renders every reader. Fine for a small crate; for large, fast
  changing state use a store (Zustand, Redux Toolkit) whose selectors re-render
  a component only when its slice changes. The Zustand file shows the same
  reducer running in a store with no provider.
- *Redux Toolkit vs Zustand?* RTK: more structure, great devtools, common in
  big teams and government shops. Zustand: tiny, little ceremony. Both keep
  state outside React and use selectors.
- *Server state vs client state?* The crate is client state (the user owns it).
  Search results are server state (a cache of something the server owns), which
  is what TanStack Query or SWR manage: caching, de-duplication, refetching.
- *Why not put search results in the cart context?* Different lifetimes and
  owners. Keep state as close as possible to where it is used.

**Python bridge:** a reducer is just a pure function with a `match` statement:

```python
def cart_reducer(state, action):
    match action["type"]:
        case "added":
            return {**state, "items": [*state["items"], action["song"]]}
        case "removed":
            return {**state, "items": [s for s in state["items"] if s["id"] != action["id"]]}
```

`{**state}` is JavaScript's `{...state}`; the list comprehension is `.filter()`.

---

## 3. Performance and re-renders

Files: `src/components/SongResults.tsx`, `src/components/SongRow.tsx`

The mental model (this is the core of the *Advanced React* book):

1. A component re-renders when **its state changes**, **its parent re-renders**,
   or **a context it reads changes**. "Props changed" is not on the list; props
   only matter once a component is wrapped in `memo`.
2. Re-rendering is usually cheap. Measure with the React DevTools Profiler
   before optimizing.
3. `memo(Component)` skips the re-render if every prop is the same as last time
   (compared with `Object.is`, so objects and functions are compared by
   identity, not content).
4. That is the only reason `useCallback` and `useMemo` matter for re-renders:
   they keep a function or object *the same identity* between renders so a
   memoized child can skip.

In this app: adding a song changes the crate, so `SongResults` re-renders. Each
`SongRow` is memoized, `handleToggle` is stable thanks to `useCallback`, and
only the one row whose `inCrate` flipped re-renders.

**Virtualization.** 5,000 results loaded, about 20 rows in the DOM. A spacer
`<ul>` is as tall as all rows would be (`items.length * 56px`); from
`scrollTop` we work out which indexes are visible and render only those,
positioned by index. Fixed row height is what makes the maths trivial.

**Resetting state with `key`.** `SearchPanel` renders
`<SongResults key={resultKey} />`. A new key makes React discard the old
component and mount a new one, so its scroll state resets with no effect.

**They might ask**

- *What causes a re-render?* The three triggers above.
- *When would you NOT use useMemo/useCallback?* When nothing downstream is
  memoized and the calculation is cheap. They add code and comparisons for no
  gain.
- *What is the React Compiler?* A build step that adds this memoization
  automatically. It is available in Next.js 16 as an opt-in (`reactCompiler`),
  and is not enabled here so the manual version is visible.
- *How do you handle a list of 40,000 items?* Don't send them: search and page
  on the server. Then virtualize what is loaded. Debounce the input. Cancel
  stale requests.
- *Why is `key` important in lists? Why not the array index?* Keys tell React
  which item is which between renders. With index keys, removing or reordering
  items makes React reuse the wrong component state for the wrong item. The
  crate reorders, so it uses `song.id`.

---

## 4. Data fetching

Files: `src/hooks/useSongSearch.ts`, `src/app/api/songs/route.ts`,
`src/components/SiteStats.tsx`, `src/app/checkout/actions.ts`

Three different ways data moves in this app:

| Where | Mechanism | Why |
|---|---|---|
| Stats line on the home page | Server Component + `"use cache"` | Same for everyone; ship HTML, zero JS |
| Search results | Client fetch to a Route Handler | Depends on what the user types |
| Checkout | Server Action | A mutation: submit a form, run code on the server |

**Server vs Client Components.** Components are Server Components by default:
they run only on the server and can read files or databases directly, but
cannot use state, effects or event handlers. `"use client"` at the top of a file
marks the point where the browser bundle starts. A Client Component can still
receive Server Components as `children` (see `layout.tsx`).

**The fetch hook** solves the three problems interviewers like:

- *Race condition:* type "be", then "beatles". If the "be" response arrives
  last it would overwrite the right results. The effect cleanup aborts the old
  request, and results are tagged with the query they belong to.
- *Loading state:* not stored. `isLoading = state.key !== key`. Deriving it
  means it can never be out of sync.
- *Errors:* stored, shown with a retry button.

**Never trust the client.** The checkout action receives song IDs only and
checks each one against the real song list on the server. The Route Handler clamps `limit` and
validates `sort`.

**They might ask**

- *Why not fetch in useEffect?* You can, but you must handle cancellation,
  races, caching and de-duplication yourself, as this hook does for the first
  two. In production most teams use TanStack Query or SWR, or fetch in Server
  Components. (Good answer: "I wrote it by hand once so I know what the
  library is doing for me.")
- *What is hydration?* The server sends HTML; in the browser React attaches
  event handlers to that existing HTML instead of rebuilding it. The first
  client render must match the server HTML.
- *Route Handler or Server Action?* Route Handler for a URL other things can
  call or GET. Server Action for form submissions and mutations from your own
  UI.
- *How does caching work in current Next.js?* With Cache Components (on in this
  project), everything is dynamic by default and you opt in with `"use cache"`.
  The cached parts form a static shell that is served instantly; the rest
  streams in behind `<Suspense>`.

---

## 5. Testing

Run `npm test`. 56 tests across 11 files.

| File | Kind of test | Shows |
|---|---|---|
| `cartReducer.test.ts`, `search.test.ts`, `validation.test.ts`, `duration.test.ts`, `lookups.test.ts` | Unit | Pure functions need no React and no mocks |
| `useDebouncedValue.test.ts` | Hook | `renderHook`, fake timers |
| `useSongSearch.test.ts` | Hook | Mocked `fetch`, async `waitFor`, a race-condition test |
| `Crate.test.tsx`, `SongResults.test.tsx` | Component | Render with a real provider, click like a user |
| `app/api/routes.test.ts` | Route Handler | Call `GET` directly in a Node test environment, check status codes and JSON |

React Testing Library's rule: **test what the user sees and does, not how the
component is built.** Find elements the way a user would
(`getByRole("button", { name: "Move Respect up" })`), which doubles as an
accessibility check: if the test cannot find the button by its name, neither
can a screen reader.

**They might ask**

- *getBy vs queryBy vs findBy?* `getBy` throws if missing. `queryBy` returns
  null (use it to assert something is absent). `findBy` waits and returns a
  promise (use it for things that appear after async work).
- *What do you mock?* The edges: network, timers, storage. Not your own
  components.
- *What is the testing pyramid?* Many fast unit tests, fewer component tests, a
  few end-to-end tests (Playwright or Cypress). This repo has the first two.

---

## 6. Accessibility (Section 508 / WCAG)

Federal sites must meet Section 508, which points at WCAG 2.0 AA. You have done
508 work at SSA, so connect each item to that experience.

| In the app | Where | WCAG idea |
|---|---|---|
| "Skip to main content" link | `layout.tsx` | Bypass blocks |
| Every input has a `<label>` | `SearchPanel.tsx` | Labels |
| Result count announced | `role="status"` in `SearchPanel.tsx` | Status messages |
| Reorder by buttons, not drag only | `Crate.tsx` | Keyboard operable |
| Move/remove announced | live region in `Crate.tsx` | Status messages |
| Buttons named per song | `aria-label` in `SongRow.tsx` | Name, role, value |
| Toggle state exposed | `aria-pressed` | Name, role, value |
| Form errors linked to fields | `aria-invalid` + `aria-describedby` in `CheckoutForm.tsx` | Error identification |
| Visible focus ring | `:focus-visible` in `globals.css` | Focus visible |
| Scroll region is focusable | `tabIndex={0}` in `SongResults.tsx` | Keyboard operable |

**They might ask**

- *First rule of ARIA?* Don't use ARIA if a native element does the job. A
  `<button>` beats a `<div role="button">` because it brings focus, Enter and
  Space handling for free.
- *How do you test accessibility?* Automated checks (jest-axe here, axe
  DevTools in the browser) catch roughly a third of problems. Then keyboard
  only: Tab through everything. Then a screen reader (VoiceOver on your Mac:
  Cmd+F5).
- *What does a virtualized list cost in accessibility?* Off-screen rows are not
  in the DOM, so a screen reader cannot see them. `aria-setsize` and
  `aria-posinset` tell it "row 14 of 5,000". Honest trade-off to mention.

---

## 7. TypeScript you can point to

- **Discriminated unions:** `CartAction` in `cartReducer.ts` and `OrderState`
  in `actions.ts`. After checking `action.type === "moved"`, TypeScript knows
  `action.direction` exists. If you add a new action and forget its `case`, the
  reducer no longer returns on every path and the compiler tells you.
- **`unknown` over `any`:** `readSavedItems` in `CartContext.tsx` parses
  untrusted JSON as `unknown` and checks it before use.
- **`Partial<Record<...>>`:** `OrderErrors` in `validation.ts` says "an object
  that may have an error message for any of these field names".

---

## 8. One-line answers for the morning of

- **Closure:** function + link to the variables where it was created; each
  render makes new variables.
- **Re-render triggers:** own state, parent re-rendered, context changed.
- **memo / useCallback / useMemo:** only useful together, to keep prop
  identity stable for a memoized child, or to avoid a truly expensive
  calculation.
- **Reducer:** pure `(state, action) => newState`; never mutate.
- **Context limit:** every reader re-renders; split contexts or use a store
  with selectors.
- **Server Component:** runs on the server, no state or effects, zero JS
  shipped. `"use client"` marks where the browser bundle begins.
- **Hydration:** React attaching to server HTML; first client render must
  match.
- **Race condition in fetch:** abort in the effect cleanup.
- **Derived state:** if you can calculate it from props or state, don't store
  it.
- **`key`:** identity for list items; also a way to reset a component.
- **Security:** validate everything again on the server.
- **RTL:** query by role and name, like a user.
- **ARIA:** native element first.

## Stretch exercises (each is a good commit for the Gitlogue replay)

1. Put the search text and filters in the URL (`useSearchParams`) so a search
   can be shared as a link.
2. Replace `useSongSearch` with TanStack Query's `useInfiniteQuery` and compare
   how much code disappears.
3. Swap `CartContext` for the Zustand store and watch the Profiler.
4. Add a Playwright end-to-end test: search, add three songs, check out.
5. Write the reducer in Python and test it with `pytest`.
