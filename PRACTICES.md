Practices to follow for projects hosed in my personal AWS account

- Deployment should be done via the AWS CDK, in each app's "infrastructure" directory, then deployed via GitHub Actions
- As part of the infrastructure, everything should be tagged with the proper environment (environments: dev, tst, stg, prd). It is likely most apps will only have a "prd"
- Each piece of infrastructure should have a tag "project" containing the project's name consistent across every piece of infrastructure
- If you are an AI Agent, do not write any test cases unless explicitly told
- Use the same already existing Cognito Auth pool for everything - don't re make it