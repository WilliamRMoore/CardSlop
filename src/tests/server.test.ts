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
    const player1JoiningId = (resp! as plyrJoinResp).data.playersInLobby.find(
      (p) => p === 'player1'
    );
    expect(player1JoiningId).toBe('player1');

    sut.PostMessage({
      msgType: 'plr_join',
      data: {
        playerJoiningId: 'player2',
      },
    });

    expect(resp).not.toBeUndefined();
    expect(resp!.respType).toBe('plr_join_resp');
    const player2JoiningId = (resp! as plyrJoinResp).data.playersInLobby.find(
      (p) => p === 'player2'
    );
    expect(player2JoiningId).toBe('player2');
  });

  test('after waiting for players and a player joins, host can start game', () => {
    const responses: csResponse[] = [];
    const callback: responseCallBack = (r: csResponse) => {
      responses.push(r);
    };
    const sut = new CSServer(dc, callback, hostId);
    sut.PostMessage({
      msgType: 'wait_for_players',
      data: {
        requestingWaitPlayerId: hostId,
      },
    });

    sut.PostMessage({
      msgType: 'plr_join',
      data: {
        playerJoiningId: 'player1',
      },
    });

    sut.PostMessage({
      msgType: 'start',
      data: {
        requestingStartPlayerId: hostId,
      },
    });

    const startResp = responses[responses.length - 1];
    expect(startResp).not.toBeUndefined();
    expect(startResp.respType).toBe('startResp');
    if (startResp.respType === 'startResp') {
      expect(startResp.data.playerHands.length).toBe(2);
      expect(startResp.data.playerHands[0].cardIds.length).toBe(7);
      expect(startResp.data.playerHands[1].cardIds.length).toBe(7);
      expect(startResp.data.judge).not.toBeUndefined();
    }
  });

  test('after game starts, judge can select a meme card', () => {
    const responses: csResponse[] = [];
    const callback: responseCallBack = (r: csResponse) => {
      responses.push(r);
    };
    const sut = new CSServer(dc, callback, hostId);
    sut.PostMessage({
      msgType: 'wait_for_players',
      data: { requestingWaitPlayerId: hostId },
    });
    sut.PostMessage({
      msgType: 'plr_join',
      data: { playerJoiningId: 'player1' },
    });
    sut.PostMessage({
      msgType: 'start',
      data: { requestingStartPlayerId: hostId },
    });

    const startResp = responses.find((r) => r.respType === 'startResp');
    if (startResp?.respType !== 'startResp') {
      fail('startResp not found');
    }
    const judgeId = startResp.data.judge;

    sut.PostMessage({
      msgType: 'get_judge_hand',
      data: { playerId: judgeId },
    });

    const judgeHandResp = responses.find(
      (r) => r.respType === 'judgeing_Hand_Resp'
    );
    if (judgeHandResp?.respType !== 'judgeing_Hand_Resp') {
      fail('judgeing_Hand_Resp not found');
    }

    const cardToSelect = judgeHandResp.data.memCardIds[0];

    sut.PostMessage({
      msgType: 'judge_selected_meme_card',
      data: { playerId: judgeId, cardId: cardToSelect },
    });

    const judgeSelectedMemeCardResp = responses.find(
      (r) => r.respType === 'judge_selected_meme_card_resp'
    );
    if (
      judgeSelectedMemeCardResp?.respType !== 'judge_selected_meme_card_resp'
    ) {
      fail('judge_selected_meme_card_resp not found');
    }
    expect(judgeSelectedMemeCardResp.data.memeCardId).toBe(cardToSelect);
  });

  test('after judge selects meme card, player can play card', () => {
    const responses: csResponse[] = [];
    const callback: responseCallBack = (r: csResponse) => {
      responses.push(r);
    };
    const player1Id = 'player1';
    const sut = new CSServer(dc, callback, hostId);
    sut.PostMessage({
      msgType: 'wait_for_players',
      data: { requestingWaitPlayerId: hostId },
    });
    sut.PostMessage({
      msgType: 'plr_join',
      data: { playerJoiningId: player1Id },
    });
    sut.PostMessage({
      msgType: 'start',
      data: { requestingStartPlayerId: hostId },
    });

    const startResp = responses.find((r) => r.respType === 'startResp');
    if (startResp?.respType !== 'startResp') {
      fail('startResp not found');
    }
    const judgeId = startResp.data.judge;
    const nonJudgeId = [hostId, player1Id].find((p) => p !== judgeId)!;
    const nonJudgeHand = startResp.data.playerHands.find(
      (h) => h.playerId === nonJudgeId
    )!;

    sut.PostMessage({
      msgType: 'get_judge_hand',
      data: { playerId: judgeId },
    });

    const judgeHandResp = responses.find(
      (r) => r.respType === 'judgeing_Hand_Resp'
    );
    if (judgeHandResp?.respType !== 'judgeing_Hand_Resp') {
      fail('judgeing_Hand_Resp not found');
    }

    const cardToSelect = judgeHandResp.data.memCardIds[0];

    sut.PostMessage({
      msgType: 'judge_selected_meme_card',
      data: { playerId: judgeId, cardId: cardToSelect },
    });

    const cardToPlay = nonJudgeHand.cardIds[0];
    sut.PostMessage({
      msgType: 'pl_card',
      data: { playerId: nonJudgeId, cardId: cardToPlay },
    });

    const playCardResp = responses.find((r) => r.respType === 'pl_card_resp');
    expect(playCardResp).not.toBeUndefined();

    const drawResp = responses.find((r) => r.respType === 'draw_resp');
    expect(drawResp).not.toBeUndefined();

    const judgingPileResp = responses.find(
      (r) => r.respType === 'show_juding_pile_resp'
    );
    expect(judgingPileResp).not.toBeUndefined();
    if (judgingPileResp?.respType === 'show_juding_pile_resp') {
      expect(judgingPileResp.data.capCardIds.length).toBe(1);
      expect(judgingPileResp.data.capCardIds[0]).toBe(cardToPlay);
    }
  });

  test('judge can select a winning card', () => {
    const responses: csResponse[] = [];
    const callback: responseCallBack = (r: csResponse) => {
      responses.push(r);
    };
    const player1Id = 'player1';
    const sut = new CSServer(dc, callback, hostId);
    sut.PostMessage({
      msgType: 'wait_for_players',
      data: { requestingWaitPlayerId: hostId },
    });
    sut.PostMessage({
      msgType: 'plr_join',
      data: { playerJoiningId: player1Id },
    });
    sut.PostMessage({
      msgType: 'start',
      data: { requestingStartPlayerId: hostId },
    });

    const startResp = responses.find((r) => r.respType === 'startResp');
    if (startResp?.respType !== 'startResp') {
      fail('startResp not found');
    }
    const judgeId = startResp.data.judge;
    const nonJudgeId = [hostId, player1Id].find((p) => p !== judgeId)!;
    const nonJudgeHand = startResp.data.playerHands.find(
      (h) => h.playerId === nonJudgeId
    )!;

    sut.PostMessage({
      msgType: 'get_judge_hand',
      data: { playerId: judgeId },
    });

    const judgeHandResp = responses.find(
      (r) => r.respType === 'judgeing_Hand_Resp'
    );
    if (judgeHandResp?.respType !== 'judgeing_Hand_Resp') {
      fail('judgeing_Hand_Resp not found');
    }

    const cardToSelect = judgeHandResp.data.memCardIds[0];

    sut.PostMessage({
      msgType: 'judge_selected_meme_card',
      data: { playerId: judgeId, cardId: cardToSelect },
    });

    const cardToPlay = nonJudgeHand.cardIds[0];
    sut.PostMessage({
      msgType: 'pl_card',
      data: { playerId: nonJudgeId, cardId: cardToPlay },
    });

    sut.PostMessage({
      msgType: 'judge_selected_caption_card',
      data: { playerId: judgeId, cardId: cardToPlay },
    });

    const winnerResp = responses.find(
      (r) => r.respType === 'round_winner_selected_resp'
    );

    expect(winnerResp).not.toBeUndefined();
    if (winnerResp?.respType === 'round_winner_selected_resp') {
      expect(winnerResp.data.playerId).toBe(nonJudgeId);
    }
  });

  test('after round winner is selected, players can ready for next round', () => {
    const responses: csResponse[] = [];
    const callback: responseCallBack = (r: csResponse) => {
      responses.push(r);
    };
    const player1Id = 'player1';
    const sut = new CSServer(dc, callback, hostId);
    sut.PostMessage({
      msgType: 'wait_for_players',
      data: { requestingWaitPlayerId: hostId },
    });
    sut.PostMessage({
      msgType: 'plr_join',
      data: { playerJoiningId: player1Id },
    });
    sut.PostMessage({
      msgType: 'start',
      data: { requestingStartPlayerId: hostId },
    });

    const startResp = responses.find((r) => r.respType === 'startResp');
    if (startResp?.respType !== 'startResp') {
      fail('startResp not found');
    }
    const firstJudgeId = startResp.data.judge;
    const nonJudgeId = [hostId, player1Id].find((p) => p !== firstJudgeId)!;
    const nonJudgeHand = startResp.data.playerHands.find(
      (h) => h.playerId === nonJudgeId
    )!;

    sut.PostMessage({
      msgType: 'get_judge_hand',
      data: { playerId: firstJudgeId },
    });

    const judgeHandResp = responses.find(
      (r) => r.respType === 'judgeing_Hand_Resp'
    );
    if (judgeHandResp?.respType !== 'judgeing_Hand_Resp') {
      fail('judgeing_Hand_Resp not found');
    }
    const cardToSelect = judgeHandResp.data.memCardIds[0];
    sut.PostMessage({
      msgType: 'judge_selected_meme_card',
      data: { playerId: firstJudgeId, cardId: cardToSelect },
    });

    const cardToPlay = nonJudgeHand.cardIds[0];
    sut.PostMessage({
      msgType: 'pl_card',
      data: { playerId: nonJudgeId, cardId: cardToPlay },
    });

    sut.PostMessage({
      msgType: 'judge_selected_caption_card',
      data: { playerId: firstJudgeId, cardId: cardToPlay },
    });

    // Ready up for next round
    sut.PostMessage({
      msgType: 'ready_next_turn',
      data: { playerId: hostId },
    });
    sut.PostMessage({
      msgType: 'ready_next_turn',
      data: { playerId: player1Id },
    });

    const readyResponses = responses.filter(
      (r) => r.respType === 'player_ready_list'
    );
    expect(readyResponses.length).toBe(2);

    const newRoundStartResp = responses[responses.length - 1];
    expect(newRoundStartResp.respType).toBe('startResp');
    if (newRoundStartResp.respType === 'startResp') {
      expect(newRoundStartResp.data.judge).not.toBe(firstJudgeId);
    }
  });
});
