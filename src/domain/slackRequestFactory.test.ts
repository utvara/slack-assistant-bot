import { slackRequestFactory } from './slackRequestFactory';

describe('slackRequestFactory', () => {
  it('should correctly parse the event and return an ISlackRequest object', () => {
    const event = {
      text: '<@user> test query',
      user: 'user1',
      ts: 'timestamp1',
      thread_ts: 'timestamp2',
    };

    const result = slackRequestFactory(event);

    expect(result).toEqual({
      slackThreadId: 'timestamp2',
      slackEventId: 'timestamp1',
      userQuery: 'test query',
      fromUser: 'user1',
    });
  });

  it('should use ts as slackThreadId when thread_ts is not provided', () => {
    const event = {
      text: '<@user> test query',
      user: 'user1',
      ts: 'timestamp1',
    };

    const result = slackRequestFactory(event);

    expect(result).toEqual({
      slackThreadId: 'timestamp1',
      slackEventId: 'timestamp1',
      userQuery: 'test query',
      fromUser: 'user1',
    });
  });
});
