import * as ssm from 'aws-cdk-lib/aws-ssm';
import { Construct } from 'constructs';

/**
 * The account's shared Cognito user pool, published for every app to read.
 *
 * Built in stages (household-manager spec §2). Right now these are literals
 * describing a pool the PosterWalls stack still owns; a later deploy imports
 * the pool here and replaces them with real references. The parameter NAMES
 * are the contract and do not change, so consuming apps are written once
 * and never revisited.
 */
export class AuthConstruct extends Construct {
  readonly userPoolId = 'us-east-1_1w3Dv2paU';
  readonly hostedDomain = 'poster-walls-0affce8adf47';

  constructor(scope: Construct, id: string) {
    super(scope, id);

    new ssm.StringParameter(this, 'UserPoolIdParam', {
      parameterName: '/core/auth/user-pool-id',
      stringValue: this.userPoolId,
      description: 'Shared Cognito user pool. Apps add their own client to it.',
    });

    new ssm.StringParameter(this, 'HostedDomainParam', {
      parameterName: '/core/auth/hosted-domain',
      // Prefix only, not the full URL: the region and suffix are knowable,
      // and storing the bare prefix keeps the value stable if the hosted-UI
      // URL format ever changes.
      stringValue: this.hostedDomain,
      description: 'Cognito hosted UI domain prefix.',
    });
  }
}
