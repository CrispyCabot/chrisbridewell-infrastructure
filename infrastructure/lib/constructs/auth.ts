import { RemovalPolicy } from 'aws-cdk-lib';
import * as cognito from 'aws-cdk-lib/aws-cognito';
import * as ssm from 'aws-cdk-lib/aws-ssm';
import { Construct } from 'constructs';

export class AuthConstruct extends Construct {
  readonly userPool: cognito.UserPool;
  readonly hostedDomain = 'poster-walls-0affce8adf47';

  get userPoolId(): string {
    return this.userPool.userPoolId;
  }

  constructor(scope: Construct, id: string) {
    super(scope, id);

    // Imported, not created. These properties must match the live pool
    // exactly: `cdk import` adopts the existing resource without diffing
    // its properties, so any difference here is applied as an UPDATE to
    // production auth on the next deploy.
    this.userPool = new cognito.UserPool(this, 'UserPool', {
      selfSignUpEnabled: true,
      signInAliases: { email: true },
      autoVerify: { email: true },
      standardAttributes: { email: { required: true, mutable: true } },
      passwordPolicy: {
        minLength: 12,
        requireDigits: true,
        requireLowercase: true,
        requireUppercase: true,
        requireSymbols: false,
      },
      accountRecovery: cognito.AccountRecovery.EMAIL_ONLY,
      mfa: cognito.Mfa.OFF,
      removalPolicy: RemovalPolicy.RETAIN,
    });

    // PosterWalls' client, adopted so its callback URLs are managed again.
    this.userPool
      .addClient('PosterWallsClient', {
        generateSecret: false,
        authFlows: { userSrp: true },
        oAuth: {
          flows: { authorizationCodeGrant: true },
          scopes: [
            cognito.OAuthScope.OPENID,
            cognito.OAuthScope.EMAIL,
            cognito.OAuthScope.PROFILE,
          ],
          callbackUrls: [
            'https://poster-editor.chrisbridewell.dev/callback',
            'https://d12a9gq33m9h8u.cloudfront.net/callback',
            'http://localhost:5173/callback',
          ],
          logoutUrls: [
            'https://poster-editor.chrisbridewell.dev',
            'https://d12a9gq33m9h8u.cloudfront.net',
            'http://localhost:5173',
          ],
        },
        preventUserExistenceErrors: true,
      })
      .applyRemovalPolicy(RemovalPolicy.RETAIN);

    new ssm.StringParameter(this, 'UserPoolIdParam', {
      parameterName: '/core/auth/user-pool-id',
      stringValue: this.userPoolId,
      description: 'Shared Cognito user pool. Apps add their own client to it.',
    });

    new ssm.StringParameter(this, 'HostedDomainParam', {
      parameterName: '/core/auth/hosted-domain',
      stringValue: this.hostedDomain,
      description: 'Cognito hosted UI domain prefix.',
    });
  }
}
