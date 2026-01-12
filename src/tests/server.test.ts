import { deckConfig } from '../game/core/deck';
import {
  csResponse,
  CSServer,
  plyrJoinResp,
  responseCallBack,
} from '../game/server/server';

describe('server tests', () => {
  let dc: deckConfig;
  const hostId = 'host';
  beforeEach(() => {
    dc = {
      memCardImages: [
        'meme1.png',
        'meme2.png',
        'meme3.png',
        'meme4.png',
        'meme5.png',
        'meme6.png',
        'meme7.png',
        'meme8.png',
        'meme9.png',
        'meme10.png',
        'meme11.png',
        'meme12.png',
        'meme13.png',
        'meme14.png',
        'meme15.png',
        'meme16.png',
        'meme17.png',
        'meme18.png',
        'meme19.png',
        'meme20.png',
      ],
      capCardTexts: [
        'caption1',
        'caption2',
        'caption3',
        'caption4',
        'caption5',
        'caption6',
        'caption7',
        'caption8',
        'caption9',
        'caption10',
        'caption11',
        'caption12',
        'caption13',
        'caption14',
        'caption15',
        'caption16',
        'caption17',
        'caption18',
        'caption19',
        'caption20',
        'caption21',
        'caption22',
        'caption23',
        'caption24',
        'caption25',
        'caption26',
        'caption27',
        'caption28',
        'caption29',
        'caption30',
        'caption31',
        'caption32',
        'caption33',
        'caption34',
        'caption35',
        'caption36',
        'caption37',
        'caption38',
        'caption39',
        'caption40',
      ],
    };
  });

  test('request server wait for players as host resturns waiting response', () => {
    let resp: csResponse | undefined = undefined;
    const callback: responseCallBack = (r: csResponse) => {
      resp = r;
    };
    const sut = new CSServer(dc, callback, hostId);
    sut.PostMessage({
      msgType: 'wait_for_players',
      data: {
        requestingWaitPlayerId: hostId,
      },
    });

    expect(resp).not.toBeUndefined();
    expect(resp!.respType).toBe('wait_for_players');
  });

  test('request server wait for players as non host returns invalid request response', () => {
    let resp: csResponse | undefined = undefined;
    const callback: responseCallBack = (r: csResponse) => {
      resp = r;
    };
    const sut = new CSServer(dc, callback, hostId);
    sut.PostMessage({
      msgType: 'wait_for_players',
      data: {
        requestingWaitPlayerId: 'some other id',
      },
    });

    expect(resp).not.toBeUndefined();
    expect(resp!.respType).toBe('invalid_request');
  });

  test('players can join server', () => {
    let resp: csResponse | undefined = undefined;
    const callback: responseCallBack = (r: csResponse) => {
      resp = r;
    };
    const sut = new CSServer(dc, callback, hostId);
    sut.PostMessage({
      msgType: 'wait_for_players',
      data: {
        requestingWaitPlayerId: hostId,
      },
    });

    expect(resp).not.toBeUndefined();
    expect(resp!.respType).toBe('wait_for_players');

    sut.PostMessage({
      msgType: 'plr_join',
      data: {
        playerJoiningId: 'player1',
      },
    });

    expect(resp).not.toBeUndefined();
    expect(resp!.respType).toBe('plr_join_resp');
    const player1JoiningId = (resp! as plyrJoinResp).data.playerTyingToJoinId;
    expect(player1JoiningId).toBe('player1');

    sut.PostMessage({
      msgType: 'plr_join',
      data: {
        playerJoiningId: 'player2',
      },
    });

    expect(resp).not.toBeUndefined();
    expect(resp!.respType).toBe('plr_join_resp');
    const player2JoiningId = (resp! as plyrJoinResp).data.playerTyingToJoinId;
    expect(player2JoiningId).toBe('player2');
  });
});
