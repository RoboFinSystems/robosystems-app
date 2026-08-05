## Summary

<!-- What this PR does and why. Ground it in the actual change, not the diff mechanics. -->

## Changes

<!-- The substantive changes, grouped by route, page, or module. Name the user-visible surface —
     that is what a reviewer is looking for in a frontend PR. -->

-

## Deploy Notes

<!-- Anything that makes this more than a code merge. Deploys here are manual, so ordering matters:
     - Needs a newer RoboSystems API version? Say so — API deploys first.
     - New NEXT_PUBLIC_* or other env var? It is baked at BUILD time from a GitHub Actions
       variable, so it must exist before the deploy (`npm run setup:gha`), not after.
     - CloudFormation edited? Name the stack that will update.
     - @robosystems/core or @robosystems/client bump that changed call sites? Say which.
     Write "None" if it is a plain code change. -->

None

## Testing

<!-- How the change was verified. Run `npm run test:all` before opening. Note that it does NOT
     build — run `npm run build` too if this touches routing, layouts, 'use client' boundaries,
     or config. State what you actually ran; "Not run" is a valid answer. -->
