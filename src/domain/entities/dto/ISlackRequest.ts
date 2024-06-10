export default interface ISlackRequest {
  slackThreadId: string;
  slackEventId: string;
  userQuery: string;
  fromUser?: string;
}
