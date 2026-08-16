import { CfnOutput, Stack, type StackProps } from 'aws-cdk-lib';
import { Construct } from 'constructs';
import { AuthConstruct } from './constructs/auth.js';
import { BudgetConstruct } from './constructs/budget.js';

export interface MainStackProps extends StackProps {
  readonly budgetLimitUsd: number;
  readonly alertEmail: string;
}

export class MainStack extends Stack {
  constructor(scope: Construct, id: string, props: MainStackProps) {
    super(scope, id, props);

    new BudgetConstruct(this, 'Budget', {
      limitUsd: props.budgetLimitUsd,
      alertEmail: props.alertEmail,
    });

    new CfnOutput(this, 'BudgetAlertEmail', {
      description: 'Check this inbox for an SNS subscription-confirmation email after first deploy — alerts do not deliver until it is confirmed',
      value: props.alertEmail,
    });

    const auth = new AuthConstruct(this, 'Auth');

    new CfnOutput(this, 'UserPoolId', { value: auth.userPoolId });
    new CfnOutput(this, 'CognitoHostedDomain', { value: auth.hostedDomain });
  }
}
