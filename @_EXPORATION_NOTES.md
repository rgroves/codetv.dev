# Recon: Contributing Developer DX Issues

This file will contain notes regarding rough edges that need to be smoothed out for a nice DX for those that want to help contribute to the `codetv.dev` website.

I've cloned the repo and am going to document every issue I hit, no matter how obvious or small. Then these will become a reference map for what needs to be solved for and possibly creating a contributor guide outlining what is needed to setup locally to contribute to the repo.

## Issue #1: `environment variables defined in env.schema are invalid:`

Hit this issue after cloning the codetv.dev repo, running `pnpm i` then `pnpm run dev`:

```shell
rgroves@hiro:~/dev/codetv.dev$ npm run dev

> @codetv/website@0.0.1 dev
> astro dev

00:06:24 [@astrojs/netlify] Enabling sessions with filesystem storage
00:06:24 [types] Generated 1ms
00:06:24 [ERROR] [content] The following environment variables defined in `env.schema` are invalid:
- PUBLIC_CLERK_PUBLISHABLE_KEY is missing
- PUBLIC_ALGOLIA_API_KEY is missing
- PUBLIC_ALGOLIA_APP_ID is missing

00:06:24 [WARN] [content] Content config not loaded
[EnvInvalidVariables] The following environment variables defined in `env.schema` are invalid:
- PUBLIC_CLERK_PUBLISHABLE_KEY is missing
- PUBLIC_ALGOLIA_API_KEY is missing
- PUBLIC_ALGOLIA_APP_ID is missing

  Error reference:
  https://docs.astro.build/en/reference/errors/env-invalid-variables/
  Location:
  /home/rgroves/dev/codetv.dev/node*modules/.pnpm/astro@5.11.0*@netlify+blobs@8.2.0_@types+node@24.0.13_rollup@4.44.2_typescript@5.8.3_yaml@2.8.0/node*modules/astro/dist/env/vite-plugin-env.js:101:11
  Stack trace:
  at validatePublicVariables (file:///home/rgroves/dev/codetv.dev/node_modules/.pnpm/astro@5.11.0*@netlify+blobs@8.2.0_@types+node@24.0.13_rollup@4.44.2_typescript@5.8.3_yaml@2.8.0/node*modules/astro/dist/env/vite-plugin-env.js:101:11)
  at PluginContext.buildStart (file:///home/rgroves/dev/codetv.dev/node_modules/.pnpm/astro@5.11.0*@netlify+blobs@8.2.0_@types+node@24.0.13_rollup@4.44.2_typescript@5.8.3_yaml@2.8.0/node*modules/astro/dist/env/vite-plugin-env.js:44:7)
  at EnvironmentPluginContainer.buildStart (file:///home/rgroves/dev/codetv.dev/node_modules/.pnpm/vite@6.3.5*@types+node@24.0.13_yaml@2.8.0/node*modules/vite/dist/node/chunks/dep-DBxKXgDP.js:42171:12)
  at initServer (file:///home/rgroves/dev/codetv.dev/node_modules/.pnpm/vite@6.3.5*@types+node@24.0.13_yaml@2.8.0/node*modules/vite/dist/node/chunks/dep-DBxKXgDP.js:38717:6)
  at file:///home/rgroves/dev/codetv.dev/node_modules/.pnpm/vite@6.3.5*@types+node@24.0.13_yaml@2.8.0/node_modules/vite/dist/node/chunks/dep-DBxKXgDP.js:25034:16

```

### Workaround for `environment variables defined in env.schema are invalid:`

I started by creating an `.env.local` from the template:

```shell
cp .env.TEMPLATE .env.local
```

Then updated the following lines in `.env.local`:

```shell
PUBLIC_ALGOLIA_API_KEY=
PUBLIC_ALGOLIA_APP_ID=
```

to this:

```shell
PUBLIC_ALGOLIA_API_KEY=CONTRIBUTOR_DEV_STUB
PUBLIC_ALGOLIA_APP_ID=CONTRIBUTOR_DEV_STUB
```

## Issue #2: Error via dev server: Invalid Environment Variables

After successfully running the dev server and hitting http://localhost:4321/, this error occurred:

```shell
00:17:41 [ERROR] [EnvInvalidVariables] The following environment variables defined in `env.schema` are invalid:

- NETLIFY_PERSONAL_ACCESS_TOKEN is missing

  Error reference:
    https://docs.astro.build/en/reference/errors/env-invalid-variables/
  Stack trace:
    at /home/rgroves/dev/codetv.dev/node_modules/.pnpm/astro@5.11.0_@netlify+blobs@8.2.0_@types+node@24.0.13_rollup@4.44.2_typescript@5.8.3_yaml@2.8.0/node_modules/astro/dist/env/runtime.js:18:10
    [...] See full stack trace in the browser, or rerun with --verbose.
```

### Workaround

I updated the following lines in `.env.local`:

```shell
NETLIFY_PERSONAL_ACCESS_TOKEN=
```

to this:

```shell
NETLIFY_PERSONAL_ACCESS_TOKEN=CONTRIBUTOR_DEV_STUB
```

## Issue #3: Error via dev server: Invalid Environment Variables

More of the same (grouping all of the env vars I hit into this issue, but only showing the first error):

```shell
00:23:47 [ERROR] [EnvInvalidVariables] The following environment variables defined in `env.schema` are invalid:

- MUX_JWT_SIGNING_KEY is missing

  Error reference:
    https://docs.astro.build/en/reference/errors/env-invalid-variables/
  Stack trace:
    at /home/rgroves/dev/codetv.dev/node_modules/.pnpm/astro@5.11.0_@netlify+blobs@8.2.0_@types+node@24.0.13_rollup@4.44.2_typescript@5.8.3_yaml@2.8.0/node_modules/astro/dist/env/runtime.js:18:10
    [...] See full stack trace in the browser, or rerun with --verbose.
```

### Workaround

I changed these lines for all the env vars in issue:

```shell
MUX_JWT_SIGNING_KEY=
MUX_TOKEN_ID=
MUX_TOKEN_SECRET=
...
CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=
...
CONVERTKIT_API_KEY=
CONVERTKIT_SECRET_KEY=
...
SANITY_SECRET_TOKEN=
...
DISCORD_BOT_TOKEN=
```

to this:

```shell
MUX_JWT_SIGNING_KEY=CONTRIBUTOR_DEV_STUB
MUX_TOKEN_ID=CONTRIBUTOR_DEV_STUB
MUX_TOKEN_SECRET=CONTRIBUTOR_DEV_STUB
...
CLOUDINARY_CLOUD_NAME=CONTRIBUTOR_DEV_STUB
CLOUDINARY_API_KEY=CONTRIBUTOR_DEV_STUB
CLOUDINARY_API_SECRET=CONTRIBUTOR_DEV_STUB
...
CONVERTKIT_API_KEY=CONTRIBUTOR_DEV_STUB
CONVERTKIT_SECRET_KEY=CONTRIBUTOR_DEV_STUB
...
SANITY_SECRET_TOKEN=CONTRIBUTOR_DEV_STUB
...
DISCORD_BOT_TOKEN=CONTRIBUTOR_DEV_STUB
...
# For Google Sheets
GOOGLE_SHEETS_SERVICE_ACCOUNT=CONTRIBUTOR_DEV_STUB
```

- Note: The Google Sheets section with `GOOGLE_SHEETS_SERVICE_ACCOUNT` had to be added entirely (missing from the .env.template)
  - TODO create PR for this or mention it in Issue #28

## Issue #4: Error during resolution of profiles collection in `src/content.config.ts`

Here is the error:

```shell
Unauthorized - Session not found
  Location:
    /home/rgroves/dev/codetv.dev/node_modules/.pnpm/@sanity+client@7.6.0/node_modules/@sanity/client/dist/index.js:176:13
  Stack trace:
    at onResponse (file:///home/rgroves/dev/codetv.dev/node_modules/.pnpm/@sanity+client@7.6.0/node_modules/@sanity/client/dist/index.js:176:13)
    at file:///home/rgroves/dev/codetv.dev/node_modules/.pnpm/get-it@8.6.10/node_modules/get-it/dist/_chunks-es/createRequester.js:1:910
    at M (file:///home/rgroves/dev/codetv.dev/node_modules/.pnpm/get-it@8.6.10/node_modules/get-it/dist/_chunks-es/node-request.js:1:4118)
    at Transform.<anonymous> (file:///home/rgroves/dev/codetv.dev/node_modules/.pnpm/get-it@8.6.10/node_modules/get-it/dist/_chunks-es/node-request.js:1:7985)
    at Transform.emit (node:events:518:28)
 ELIFECYCLE  Command failed with exit code 1.
```

The profiles collection loader uses `getAllUsers` from the `./util/sanity` file:

```typescript
import { getAllUsers } from './util/sanity';
...
const profiles = defineCollection({
	loader: async () => {
		const users = await getAllUsers();
...
```

Since there is a stubbed/invalid `SANITY_SECRET_TOKEN` in the `.env.local` file, it makes sense that the `Unauthorized - Session not found` error is being thrown.

### Possible solution: proxy objects with mocked methods and return data

For all the modules within `./util` that connect to 3rd party providers, create proxy object versions of those, and update the code base to only use the proxy object versions. In production, the proxy objects will just act as pass through objects, but for developement we can use an environment flag to stub the necessary methods returning mock data.

### Temporary workaround: replace `getAllUsers`

As a temporary workaround, going to replace that method with a stub that just returns an empty array.

## Minor Nit Sidequest: `src/util/sanity.ts` has a mixture of leading tabs and leading spaces which causes save on format to change a bunch of lines on save.

- TODO: To fix or not to fix? Maybe this is just due to my vs code settings, but probably makes sense to standardize.

## Issue #5: Clerk error in middleware

Getting an error in `src/middleware.ts` due to not having a valid Clerk key in place when calling `clerkMiddleware`

Error is:

```shell
20:29:21 [ERROR] Publishable key not valid.
  Stack trace:
    at /home/rgroves/dev/codetv.dev/node_modules/.pnpm/@clerk+shared@3.11.0_react-dom@19.1.0_react@19.1.0__react@19.1.0/node_modules/@clerk/shared/dist/chunk-IV7BOO4U.mjs:40:13
    [...] See full stack trace in the browser, or rerun with --verbose.
```

### Possible solution: proxy

- could go the proxy route again and have a controllable mock function that will allow navigation to /dashboard or redirect to sign-in based on local configuration

### Temporary workaround:

Commenting out the clerk middleware stuff for now and just creating a stub onRequest to export in order to continue.

## Issue #6: `Astro2.locals.currentUser is not a function`

In `components/user-button.astro` the use of `Astro.locals.currentUser()`, which is no longer initialized since the clerkMiddleware is what did that, is now erroring out.

Error:

```shell
20:48:01 [ERROR] Astro2.locals.currentUser is not a function
  Stack trace:
    at /home/rgroves/dev/codetv.dev/src/components/user-button.astro:4:33
    [...] See full stack trace in the browser, or rerun with --verbose.
```

### Possible solution: handle in a proxy

The same way the clerk middleware set this up, the proxy object can do similarly setting this to a function that returns a mock User object

### Temporary workaround

To move forward just hardcoding a basic User object with sample values used in the UserButton component:

```typescript
const user = {
  fullName: "Robert Groves",
  firstName: "Robert",
  imageUrl:
    "https://res.cloudinary.com/jlengstorf/image/upload/f_auto/q_auto/v1738215362/codetv/codetv-default-cover.png",
};
```

## Minor Broken Image Sidequest

When index page's main hero image wasn't displaying properly, discovered that if the CLOUDINARY_CLOUD_NAME env var was set properly (like it is in production, to `jlengstorf`) could at least get images from Cloudinary.

## Issue #7: Usage of Sanity in Series component

Error:

```shell
21:28:37 [ERROR] Unauthorized - Session not found
  Stack trace:
    at /home/rgroves/dev/codetv.dev/node_modules/.pnpm/@sanity+client@7.6.0/node_modules/@sanity/client/dist/index.js:176:13
    [...] See full stack trace in the browser, or rerun with --verbose.
```

Again makes sense given not having the appropriate env vars, these need proxying to return mock data.

### Temporary workaround

Stubbed out with:

```typescript
const earlyAccess:
  | Awaited<ReturnType<typeof getNextEarlyAccessEpisode>>
  | false = false;
const recentEps: Awaited<ReturnType<typeof getRecentEpisodes>> = [];
const series: Awaited<ReturnType<typeof getFeaturedSeries>> = [];
```

## Issue #8: Usage of Sanity in Series component in the Supporters component

The Support component on the index page uses the Supporters component which uses sanity and hits the Unauthorized due to no key issue seen previously.

Error:

```shell
21:52:51 [ERROR] Unauthorized - Session not found
  Stack trace:
    at onResponse (file:///home/rgroves/dev/codetv.dev/node_modules/.pnpm/@sanity+client@7.6.0/node_modules/@sanity/client/dist/index.js:176:13)
    [...] See full stack trace in the browser, or rerun with --verbose.
```

### Temporary workaround

Stubbed, changing this:

```typescript
const supporters = await getSupporters();
```

to this:

```typescript
const supporters: Awaited<ReturnType<typeof getSupporters>> = [];
```

## Issue #9: Use of sanity on /watch page

More of the same with sanity usage.

Error:

```shell
22:08:58 [ERROR] Unauthorized - Session not found
  Stack trace:
    at onResponse (file:///home/rgroves/dev/codetv.dev/node_modules/.pnpm/@sanity+client@7.6.0/node_modules/@sanity/client/dist/index.js:176:13)
    [...] See full stack trace in the browser, or rerun with --verbose.
```

## Temporary workaround

Stubbed, changed this:

```typescrip
const allSeries = await getAllSeries();
```

to this...

```typescript
const allSeries: Awaited<ReturnType<typeof getAllSeries>> = [];
```

## Minimal success

At this point can navigate between (most\*) pages successfully, however they obviously lack any of the dynamic content.  
\* See Other Notes below

Time to brainstorm the feasibility of possibly proxying objects, stubbing required methods, and have them return mock data generated based on return types (maybe using zod and faker, or something along those lines)

## Other Notes

There are still other issues at the minimal success point, those below and possibly ones I haven't run into:

- Hitting the dashboard still blows up (likely due to clerk/sanity keys)
- There are a bunch of errors thrown in the browser console, related to Clerk, not sure how to track these down to see what could possibly be done about them, but there likely related to not having a publishable key in place.

  ```text
  localhost/:834  GET https://img.clerk.com/eyJ0eXBlIjoicHJveHkiLCJzcmMiOiJodHRwczovL2ltYWdlcy5jbGVyay5kZXYvdXBsb2FkZWQvaW1nXzJzZEt6Q01PU2dzMDlhQnFUVGpvcUJKelM5ViJ9 net::ERR_CONNECTION_RESET
  page.js:34  GET https://npm/@clerk/clerk-js@5/dist/clerk.browser.js net::ERR_NAME_NOT_RESOLVED
    (anonymous) @ chunk-PJOQRAC4.js?v=6cb220b3:834
    load @ chunk-PJOQRAC4.js?v=6cb220b3:812
    retry @ chunk-PJOQRAC4.js?v=6cb220b3:791
    loadScript @ chunk-PJOQRAC4.js?v=6cb220b3:837
    loadClerkJsScript @ chunk-PJOQRAC4.js?v=6cb220b3:921
    createClerkInstanceInternal @ chunk-PJOQRAC4.js?v=6cb220b3:1042
    (anonymous) @ chunk-PJOQRAC4.js?v=6cb220b3:1024
    runner @ @clerk_astro_internal.js?v=6cb220b3:67
    (anonymous) @ page.js:34
  page.js:34  GET https://npm/@clerk/clerk-js@5/dist/clerk.browser.js net::ERR_NAME_NOT_RESOLVED
    (anonymous) @ chunk-PJOQRAC4.js?v=6cb220b3:834
    load @ chunk-PJOQRAC4.js?v=6cb220b3:812
    retry @ chunk-PJOQRAC4.js?v=6cb220b3:791
    await in retry
    loadScript @ chunk-PJOQRAC4.js?v=6cb220b3:837
    loadClerkJsScript @ chunk-PJOQRAC4.js?v=6cb220b3:921
    createClerkInstanceInternal @ chunk-PJOQRAC4.js?v=6cb220b3:1042
    (anonymous) @ chunk-PJOQRAC4.js?v=6cb220b3:1024
    runner @ @clerk_astro_internal.js?v=6cb220b3:67
    (anonymous) @ page.js:34

  ...<snip: same error above repeats multiple times at intervals>...

  chunk-PJOQRAC4.js?v=6cb220b3:927 Uncaught Error: Clerk: Failed to load Clerk
      at chunk-PJOQRAC4.js?v=6cb220b3:927:11
      at async createClerkInstanceInternal (chunk-PJOQRAC4.js?v=6cb220b3:1042:5)
      at async runner (@clerk_astro_internal.js?v=6cb220b3:67:5)
      at async page.js:34:15
  ```

  - Thinking that maybe at a minimum a contributing developer should create a Clerk account and use their own Clerk developement environment & keys. That way they can really test auth'ed vs unauth'ed flows if needed, since Clerk is kind of deeply embeded into the middleware and UI components and it probably be a real pain to abstract that away.

- Trying to run a build blows up; mainly do to the encrypted env
  ```shell
  23:23:44   ├─ /blog/web-dev-challenge-hackathon-s2e3-devious-video-player-mux/index.html# WARNING: no env variable DOTENVENC_PASS found; prompting for encryption password
  ✔ Type password: …
  Restored no env variables. Either empty input file or wrong password.
  Hint:
    This issue often occurs when your MDX component encounters runtime errors.
  Location:
    /home/rgroves/dev/codetv.dev/node_modules/.pnpm/@tka85+dotenvenc@5.4.2_@types+node@24.0.13_typescript@5.8.3/node_modules/@tka85/dotenvenc/dist/src/index.js:62:15
  Stack trace:
    at decrypt (/home/rgroves/dev/codetv.dev/node_modules/.pnpm/@tka85+dotenvenc@5.4.2_@types+node@24.0.13_typescript@5.8.3/node_modules/@tka85/dotenvenc/dist/src/index.js:62:15)
    at async file:///home/rgroves/dev/codetv.dev/.netlify/build/chunks/MuxVideoPlayer_KM88nJXU.mjs:15:15
   ELIFECYCLE  Command failed with exit code 1.
  ```

### 3rd Party Systems requiring a key

Just noting the third-party systems involved here:

- Clerk
- Stripe
- Mux
- Cloudinary
- ConvertKit
- Sanity
- Inngest
- Discord
- Netlify
- Algolia
