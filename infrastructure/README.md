# @chrisbridewell/infrastructure

Core AWS infrastructure shared across apps in the personal AWS account, as
[CDK](https://docs.aws.amazon.com/cdk/) v2 in TypeScript. Nothing is created
by hand in the console.

## Layout

```
bin/app.ts              entrypoint; instantiates the stacks
lib/
  main-stack.ts         composes the constructs below
  bootstrap-stack.ts    GitHub OIDC deploy role (references the account's
                         existing OIDC provider, owned by PosterWallsBootstrap)
  constructs/
    budget.ts            AWS Budgets cost alert + SNS email subscription
```

## Stacks

| Stack | Deployed by | Contains |
|---|---|---|
| `CoreInfra` | GitHub Actions on push to `main` | the shared infrastructure |
| `CoreInfraBootstrap` | by hand, once, from a local admin identity | the deploy role |

`CoreInfraBootstrap` is deployed by hand, once. GitHub Actions cannot deploy
it, because it is what grants GitHub the ability to deploy anything.

## Commands

```bash
npx cdk synth --quiet     # generate templates; no AWS access needed
npx cdk diff              # compare against what is deployed
npx cdk deploy CoreInfra --require-approval never
```

`cdk.out/` is generated and git-ignored.

## Notes

- The monthly budget alert is $10, notifying at 50/80/100% of actual spend
  plus a forecasted-to-exceed-100% warning. After the first deploy, AWS sends
  an SNS subscription-confirmation email to the alert address — alerts do not
  deliver until that link is clicked.
- The OIDC provider for GitHub Actions is an account-level singleton already
  created by the `poster-walls-editor` repo's bootstrap stack; this repo's
  bootstrap stack references it rather than creating a second one.
