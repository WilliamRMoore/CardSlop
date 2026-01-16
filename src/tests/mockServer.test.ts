import { deckConfig } from '../game/core/deck';
import { csResponse, responseCallBack } from '../game/server/server';
import { MockNetworkServer } from '../network/mockServer';

describe('MockNetworkServer tests', () => {
  let dc: deckConfig;
  const hostId = 'host';

  beforeEach(() => {
    dc = {
      memCardImages: ['meme1.png'],
      capCardTexts: ['caption1'],
    };
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  test('messages and responses are delayed by the mock network', () => {
    const clientCallback: responseCallBack = jest.fn();
    const mockServer = new MockNetworkServer(hostId, clientCallback);

    // Send a message to the server
    mockServer.PostMessage({
      msgType: 'wait_for_players',
      data: { requestingWaitPlayerId: hostId },
    });

    // At this point, the message is "in flight" to the server,
    // so the server has not processed it yet, and no response is sent.
    expect(clientCallback).not.toHaveBeenCalled();

    // Advance time by 500ms for the message to reach the server
    jest.advanceTimersByTime(500);

    // The server has now processed the message and sent a response.
    // However, the response is "in flight" back to the client.
    // So the client callback should still not have been called.
    expect(clientCallback).not.toHaveBeenCalled();

    // Advance time by another 500ms for the response to reach the client
    jest.advanceTimersByTime(500);

    // Now the client callback should have received the response.
    expect(clientCallback).toHaveBeenCalledTimes(1);
    const response = (clientCallback as jest.Mock).mock
      .calls[0][0] as csResponse;
    expect(response.respType).toBe('wait_for_players');
  });
});
