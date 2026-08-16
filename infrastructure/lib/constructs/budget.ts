import * as budgets from 'aws-cdk-lib/aws-budgets';
import * as iam from 'aws-cdk-lib/aws-iam';
import * as sns from 'aws-cdk-lib/aws-sns';
import * as subscriptions from 'aws-cdk-lib/aws-sns-subscriptions';
import { Construct } from 'constructs';

export interface BudgetConstructProps {
  /** Monthly cost ceiling in USD that the thresholds below are percentages of. */
  readonly limitUsd: number;
  readonly alertEmail: string;
}

const ACTUAL_THRESHOLDS = [50, 80, 100];

/**
 * One monthly cost budget for the account, with email alerts at 50/80/100% of
 * actual spend plus a forecasted-to-exceed-100% warning so a trend surfaces
 * before it actually crosses the line.
 */
export class BudgetConstruct extends Construct {
  constructor(scope: Construct, id: string, props: BudgetConstructProps) {
    super(scope, id);

    const topic = new sns.Topic(this, 'AlertTopic', {
      displayName: 'AWS Budget Alerts',
    });
    topic.addSubscription(new subscriptions.EmailSubscription(props.alertEmail));

    // AWS Budgets publishes to the topic as a service, not as an account
    // principal — without this grant CloudFormation deploys fine but every
    // notification silently fails to deliver.
    topic.grantPublish(new iam.ServicePrincipal('budgets.amazonaws.com'));

    const subscribers: budgets.CfnBudget.SubscriberProperty[] = [
      { subscriptionType: 'SNS', address: topic.topicArn },
    ];

    // No L2 construct exists for AWS Budgets; this is the L1 straight through.
    new budgets.CfnBudget(this, 'MonthlyBudget', {
      budget: {
        budgetType: 'COST',
        timeUnit: 'MONTHLY',
        budgetLimit: { amount: props.limitUsd, unit: 'USD' },
      },
      notificationsWithSubscribers: [
        ...ACTUAL_THRESHOLDS.map((threshold) => ({
          notification: {
            notificationType: 'ACTUAL',
            comparisonOperator: 'GREATER_THAN',
            threshold,
            thresholdType: 'PERCENTAGE',
          },
          subscribers,
        })),
        {
          notification: {
            notificationType: 'FORECASTED',
            comparisonOperator: 'GREATER_THAN',
            threshold: 100,
            thresholdType: 'PERCENTAGE',
          },
          subscribers,
        },
      ],
    });
  }
}
