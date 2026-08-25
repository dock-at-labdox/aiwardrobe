Frontend

Notes for working on apps/web and apps/admin. General repo setup (Node, pnpm, env files, ports) is in DEVELOPER_SETUP.md, this is only the frontend stuff.

Folders
text
apps/web/src/
├── app/ routes and layouts
├── components/ shared UI
├── features/ one folder per feature
├── hooks/
├── lib/
└── providers/

Rule of thumb for components/ vs features/: if two or more features would use it, it's a component. Otherwise it lives in features/<name>/. A Button is a component. A ColorConfirmCard is not.

One folder per feature keeps us out of each other's files.

Route groups

(public) = no login needed (welcome, sign-in, sign-up). (app) = login required (wardrobe, consent, planner).

The group name doesn't show up in the URL. If a page needs a session it goes in (app), because that's where the auth check will sit once we have one. We had /consent in (public) for a bit, which meant anyone could open it.

App layout

(app)/layout.tsx holds the shared shell — header, navigation, page container. Screens inside (app) don't need their own <main>, max-w-\*, mx-auto or page padding. Add those and you get double padding with the width capped twice.

Write the screen as just its content:

tsx
export default function MyScreen() {
return (
<div>
<h1 className="text-2xl font-bold">Title</h1>
{/_ content _/}
</div>
);
}

Nav is a top bar on desktop and a bottom bar on mobile. New entries go in NAV_ITEMS at the top of the layout file.

Imports

@/ instead of relative paths:

ts
import { Button } from '@/components/ui/button';

Not ../../../components/ui/button. Doesn't break when you move files.

UI components

shadcn/ui (Base UI + Nova preset) sitting on Tailwind 4.

sh
pnpm dlx shadcn@latest add <name>

Lands in src/components/ui/. Use these, not raw <button> / <input>. Otherwise every screen ends up looking slightly different, which is exactly what happened before we standardised.

Calling the API

Everything goes through ApiClient. No fetch in components.

ts
import { ApiClient } from '@aiwardrobe/shared-web';

const apiClient = new ApiClient();
const data = await apiClient.get<WardrobeResponse>('/v1/wardrobe/items');

It handles the auth token, X-Correlation-Id, retries with backoff, and turns every failure into the ErrorEnvelope shape. The point is that when the contract changes we fix it in one place instead of forty.

Idempotency keys

Generate one per user action, not per retry. Make it when the button is clicked and reuse it on retry:

ts
const idempotencyKey = crypto.randomUUID();
await apiClient.post('/v1/tryon/requests', body, { idempotencyKey });

If you generate a fresh key inside the retry, the server sees two different requests and processes both. On a paid endpoint that means charging twice.

Token

ApiClient doesn't read the token itself, you hand it a function that returns one. We haven't picked an OIDC provider yet, so if the client read from localStorage directly and we later switched to cookies, the whole thing would need rewriting. This way one function changes.

Loading / error / empty

Use AsyncState, don't write these per screen:

tsx
<AsyncState
loading={loading}
error={error}
empty={!loading && items.length === 0}
loadingMessage="Loading your wardrobe..."
emptyMessage="Add your first item to start building your wardrobe."

>   <ItemGrid items={items} />
> </AsyncState>

error takes an ErrorEnvelope, not a string. If you flatten it to a string you lose code and details, and then you can't do things like list which items are conflicting on a CONSTRAINT_CONFLICT. "Something went wrong" is not an acceptable error message when the API told us exactly what went wrong.

A screen isn't done until these three states exist. Not a follow-up ticket.

Mocking

Backend is still being built so we mock with MSW. Not setTimeout, and definitely not by reassigning globalThis.fetch.

text
src/mocks/
├── handlers.ts mock responses go here
├── browser.ts setup, leave it alone
└── MswProvider.tsx starts MSW in dev, already in layout.tsx

Write the call as if the endpoint exists. MSW catches it. When Sarthak's real endpoint lands we delete the handler and the screen doesn't change at all.

Adding a mock:

ts
http.get('\*/v1/wardrobe/items', () => {
return HttpResponse.json({ items: [] });
}),

Item data comes from features/wardrobe/mock-data.ts rather than being written inline in the handler, so the same data feeds the list, the detail screen and the mock.

There are commented-out error handlers at the bottom of handlers.ts — low colour confidence, empty list, 500. Paste one in when you want to check how your screen behaves.

Dev only. NEXT_PUBLIC_API_MOCKING=disabled in .env turns it off.

Windows

Next 16's Turbopack throws a path error on Windows, so from inside apps/web or apps/admin:

sh
pnpm dev:windows
pnpm build:windows

Also keep the repo path free of spaces. C:\dev\aiwardrobe is fine, C:\AI wardrobe\ will break things in ways that are annoying to debug.

Before you push

From the repo root:

sh
pnpm lint
pnpm format
pnpm typecheck
pnpm test
pnpm build

The Python lint step fails without uv installed. Ignore it, that's the AI team's.

Use pnpm install --frozen-lockfile normally. Plain pnpm install will quietly bump versions on you (it tried to move us from Next 15 to 16). Only run it when you're actually adding a dependency, and commit pnpm-lock.yaml in the same commit — CI fails if package.json and the lockfile disagree.

Branches
text
your branch → PR → frontend/dev (I review and merge)
frontend/dev → PR → dev (I raise, Pratyush merges)

Pull frontend/dev and branch off it before you start. Working off a stale branch gives you CI failures that have nothing to do with your code, which wastes an hour figuring out.

Pull and merge daily too — backend and AI push to dev regularly and I merge that down. Small merges beat one painful one later.

Conventional commits: feat:, fix:, chore:.

Don't git add .. It grabs stuff you didn't touch — I deleted the Husky hooks that way on day one.

Why we picked what we picked

shadcn/ui. Tailwind 4 was already set up and shadcn builds on it. Accessibility comes built in, which we need since WCAG 2.2 AA is a stated target. Bundle stays small, which matters because this is mobile-first. MUI is heavy and fights Tailwind. Hand-rolling a component library in 12 weeks with three people was never going to happen.

Token as an injected function. Covered above — provider isn't decided, so don't couple to one.

MSW. We ended up with two screens mocking two different ways, one with setTimeout and one by swapping out globalThis.fetch. The second one is actually dangerous: it replaces fetch for the whole app while the request is running, so anything else loading at that moment gets the wrong response. MSW sits at the network layer and the app code doesn't know it exists.

frontend/dev as a lead branch. Everything gets reviewed here first, then one PR goes up to dev instead of three separate ones landing on Pratyush.

picsum.photos for mock images. placehold.co returns SVG and Next's <Image> blocks SVG by default, so nothing rendered. Any new image host also needs adding to remotePatterns in next.config.ts.

Known limitations

Stuff that's broken, missing, or worth knowing before you trip over it.

TanStack Virtual throws a react-hooks/incompatible-library warning on React 19. ESLint runs with --max-warnings=0 here, so a warning fails the build. It's suppressed on one line in WardrobeList.tsx. Don't delete that comment without running the build first. Revisit when the library catches up.
Auth is fake. Sign-in, sign-up and consent all run on mocked responses. Blocked on the OIDC provider decision, which is backend's call.
dependency-audit fails in CI. Pre-existing, project-wide, not ours.
No tests. Section 13 of the ownership doc wants component tests for every error state plus E2E on the critical flows. We have none of that yet.
No Core Web Vitals or bundle-size targets. Marked as undefined in the ownership doc and still undefined. Worth setting once there's enough UI to measure.
Onboarding progress uses sessionStorage, so it survives a refresh but not a closed tab. Once the profile endpoints exist this should save server-side instead.
Wardrobe list scroll doesn't reset when you switch category. Filter down to a short list while scrolled and you get a blank viewport.
Refine and Substitute on the results screen do nothing yet — no handlers wired up.
