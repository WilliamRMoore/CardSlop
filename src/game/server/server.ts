import { capCard, memeCard } from '../core/card';
import {
  captionCardDeck,
  deckConfig,
  EmptyCaptionCardDeck,
  EmptyMemeCardDeck,
  memeCardDeck,
  NewCaptionCardDeck,
  NewMemeCardDeck,
} from '../core/deck';
type playerId = string;
type cardId = number;

type message =
  | waitForplayersMsg
  | plyrJoinMsg
  | startMsg
  | playCardMsg
  | initMsg
  | drawMsg
  | resetMsg
  | getJudgeHandMsg
  | judgeSelectedMemeCardMsg
  | judgeSelectCaptionCardMsg
  | readyNextTurnMsg;

type initMsg = {
  msgType: 'init';
  data: undefined;
};

type resetMsg = {
  msgType: 'reset';
  data: { requestingResetPlayerId: string };
};

type waitForplayersMsg = {
  msgType: 'wait_for_players';
  data: { requestingWaitPlayerId: string };
};

type plyrJoinMsg = {
  msgType: 'plr_join';
  data: { playerJoiningId: string };
};

type startMsg = {
  msgType: 'start';
  data: { requestingStartPlayerId: string };
};

type drawMsg = {
  msgType: 'draw';
  data: { playerDrawingId: string };
};

type playerCard = { playerId: string; cardId: number };

type playCardMsg = {
  msgType: 'pl_card';
  data: playerCard;
};

type getJudgeHandMsg = {
  msgType: 'get_judge_hand';
  data: { playerId: string };
};

type judgeSelectedMemeCardMsg = {
  msgType: 'judge_selected_meme_card';
  data: { playerId: string; cardId: number };
};

type judgeSelectCaptionCardMsg = {
  msgType: 'judge_selected_caption_card';
  data: { playerId: string; cardId: number };
};

type readyNextTurnMsg = {
  msgType: 'ready_next_turn';
  data: { playerId: string };
};

export type csResponse =
  | waitResp
  | plyrJoinResp
  | startResp
  | drawResponse
  | playCardResp
  | judgeHandResp
  | invalidRequestRsep
  | judgeSelectedMemeCardResp
  | showJudgingPileResp
  | roundWinnerSelectedResp
  | playerReadyCountResp;

type waitResp = {
  respType: 'wait_for_players';
  data: undefined;
};

type playCardResp = {
  respType: 'pl_card_resp';
  data: { gameState: gameStates; playerId: string; cardId: number };
};

export type plyrJoinResp = {
  respType: 'plr_join_resp';
  data: { playerTyingToJoinId: string };
};

type playerHands = { playerId: string; cardIds: number[] }[];

type startResp = {
  respType: 'startResp';
  data: { playerHands: playerHands; judge: string };
};

type drawResponse = {
  respType: 'draw_resp';
  data: { playerId: string; cardId: number };
};

type judgeHandResp = {
  respType: 'judgeing_Hand_Resp';
  data: { judgeId: string; memCardIds: number[] };
};

type judgeSelectedMemeCardResp = {
  respType: 'judge_selected_meme_card_resp';
  data: { memeCardId: number };
};

type showJudgingPileResp = {
  respType: 'show_juding_pile_resp';
  data: { judgeId: string; capCardIds: number[] };
};

type roundWinnerSelectedResp = {
  respType: 'round_winner_selected_resp';
  data: {
    playerId: string;
  };
};

type playerReadyCountResp = {
  respType: 'player_ready_count';
  data: {
    playerCount: number;
  };
};

type errorCode =
  | 'game_already_started'
  | 'game_never_started'
  | 'not_in_waiting_state'
  | 'not_enough_players'
  | 'judge_cannot_play_card'
  | 'game_not_in_playing_state'
  | 'game_not_in_judgeSelect_state'
  | 'hand_at_max_size'
  | 'you_are_not_the_judge'
  | 'already_played_card'
  | 'game_not_in_judging_state'
  | 'card_not_in_judging_pile'
  | 'game_not_in_roundWinnerSelected_state'
  | 'you_are_already_ready'
  | 'you_are_not_the_host';

type invalidRequestRsep = {
  respType: 'invalid_request';
  data: { playerId: string; message: string; error: errorCode };
};

type gameStates =
  | 'never_started'
  | 'ready'
  | 'reset'
  | 'waiting'
  | 'judgeSelect'
  | 'playing'
  | 'judging'
  | 'roundWinnerSelected';

export type responseCallBack = (response: csResponse) => void;

export class CSServer {
  private hostId: string;
  private captionDeck: captionCardDeck;
  private memeDeck: memeCardDeck;
  private playerIds: playerId[] = [];
  private cardsWon: Map<playerId, memeCard[]> = new Map();
  private currentJudge: playerId | undefined;
  private capCardHands: Map<playerId, capCard[]> = new Map();
  private capCardDiscards = EmptyCaptionCardDeck();
  private memeCardDiscards = EmptyMemeCardDeck();
  private memeCardJudgeHand: memeCard[] = [];
  private selectedMemeCard: memeCard | undefined;
  private judgingPile: { pId: string; card: capCard }[] = [];
  private gameState: gameStates;
  private turn = 0;
  private playerReady: Set<string> = new Set();
  private callBack: responseCallBack;

  constructor(
    deckConfig: deckConfig,
    callBack: responseCallBack,
    hostId: string
  ) {
    this.callBack = (resp: csResponse) => {
      callBack(resp);
    };
    this.captionDeck = NewCaptionCardDeck(deckConfig.capCardTexts);
    this.memeDeck = NewMemeCardDeck(deckConfig.memCardImages);
    this.gameState = 'never_started';
    this.hostId = hostId;
    this.playerIds.push(hostId);
    this.capCardHands.set(hostId, []);
    this.cardsWon.set(hostId, []);
  }

  public PostMessage(msg: message): void {
    switch (msg.msgType) {
      case 'reset':
        if (this.gameState === 'never_started') {
          this.callBack({
            respType: 'invalid_request',
            data: {
              playerId: msg.data.requestingResetPlayerId,
              message: 'Game never started',
              error: 'game_never_started',
            },
          });
        }
        this.reset();
        this.callBack(this.makeDealResponse());
        break;
      case 'wait_for_players':
        if (this.hostId !== msg.data.requestingWaitPlayerId) {
          this.callBack({
            respType: 'invalid_request',
            data: {
              playerId: msg.data.requestingWaitPlayerId,
              message: 'You are not the host',
              error: 'you_are_not_the_host',
            },
          });
          break;
        }
        if (this.gameState === 'ready' || this.gameState === 'never_started') {
          this.gameState = 'waiting';
          this.callBack({ respType: 'wait_for_players', data: undefined });
          break;
        }
        this.callBack({
          respType: 'invalid_request',
          data: {
            playerId: msg.data.requestingWaitPlayerId,
            message: 'Game already started',
            error: 'game_already_started',
          },
        });
        break;
      case 'plr_join':
        if (this.gameState !== 'waiting') {
          this.callBack({
            respType: 'invalid_request',
            data: {
              playerId: msg.data.playerJoiningId,
              message: 'Game not in waiting state',
              error: 'not_in_waiting_state',
            },
          });
        }
        this.playerIds.push(msg.data.playerJoiningId);
        this.capCardHands.set(msg.data.playerJoiningId, []);
        this.cardsWon.set(msg.data.playerJoiningId, []);
        this.callBack({
          respType: 'plr_join_resp',
          data: { playerTyingToJoinId: msg.data.playerJoiningId },
        });
        break;
      case 'start':
        if (this.gameState !== 'waiting' || this.playerIds.length < 2) {
          this.callBack({
            respType: 'invalid_request',
            data: {
              playerId: msg.data.requestingStartPlayerId,
              message: 'Not enough players',
              error: 'not_enough_players',
            },
          });
        }
        this.start();
        this.callBack(this.makeDealResponse());
        break;
      case 'get_judge_hand':
        if (msg.data.playerId !== this.currentJudge) {
          this.callBack({
            respType: 'invalid_request',
            data: {
              playerId: msg.data.playerId,
              message: 'You are not the judge',
              error: 'you_are_not_the_judge',
            },
          });
          break;
        }
        if (this.gameState !== 'judgeSelect') {
          this.callBack({
            respType: 'invalid_request',
            data: {
              playerId: this.currentJudge!,
              message: 'Game not in judgeSelect state',
              error: 'game_not_in_judgeSelect_state',
            },
          });
          break;
        }
        for (let i = 0; i < 5; i++) {
          this.memeCardJudgeHand.push(this.memeDeck.cards.pop()!);
        }
        this.callBack({
          respType: 'judgeing_Hand_Resp',
          data: {
            judgeId: msg.data.playerId,
            memCardIds: this.memeCardJudgeHand.map((c) => c.id),
          },
        });
        break;
      case 'judge_selected_meme_card':
        if (this.gameState !== 'judgeSelect') {
          this.callBack({
            respType: 'invalid_request',
            data: {
              playerId: msg.data.playerId,
              message: 'Game not in judgeSelect state',
              error: 'game_not_in_judgeSelect_state',
            },
          });
          break;
        }
        if (this.currentJudge !== msg.data.playerId) {
          this.callBack({
            respType: 'invalid_request',
            data: {
              playerId: msg.data.playerId,
              message: 'You are not the judge',
              error: 'you_are_not_the_judge',
            },
          });
        }
        this.selectedMemeCard = this.memeCardJudgeHand.find(
          (m) => m.id === msg.data.cardId
        );
        this.memeCardJudgeHand = this.memeCardJudgeHand.filter(
          (m) => m.id !== this.selectedMemeCard!.id
        );
        this.putJudgeHandBackInDeck();
        this.gameState = 'playing';
        this.callBack({
          respType: 'judge_selected_meme_card_resp',
          data: { memeCardId: this.selectedMemeCard!.id },
        });
        break;
      case 'pl_card':
        if (this.gameState !== 'playing') {
          this.callBack({
            respType: 'invalid_request',
            data: {
              playerId: msg.data.playerId,
              message: 'Game not in playing state',
              error: 'game_not_in_playing_state',
            },
          });
          break;
        }
        if (this.judgingPile.find((ps) => ps.pId === msg.data.playerId)) {
          this.callBack({
            respType: 'invalid_request',
            data: {
              playerId: msg.data.playerId,
              message: 'You have already played a card',
              error: 'already_played_card',
            },
          });
        }
        if (msg.data.playerId === this.currentJudge) {
          this.callBack({
            respType: 'invalid_request',
            data: {
              playerId: msg.data.playerId,
              message: 'Judge cannot play card',
              error: 'judge_cannot_play_card',
            },
          });
          break;
        }
        this.playCard(msg.data);
        this.callBack({
          respType: 'pl_card_resp',
          data: {
            gameState: this.gameState,
            playerId: msg.data.playerId,
            cardId: msg.data.cardId,
          },
        });
        this.draw(msg.data.playerId);
        if (this.shouldAdvanceToJudging()) {
          this.gameState = 'judging';
          this.callBack({
            respType: 'show_juding_pile_resp',
            data: {
              judgeId: this.currentJudge!,
              capCardIds: this.judgingPile.map((ps) => ps.card.id),
            },
          });
        }
        break;
      case 'judge_selected_caption_card':
        if (this.gameState !== 'judging') {
          this.callBack({
            respType: 'invalid_request',
            data: {
              playerId: msg.data.playerId,
              message: 'Game not in judging state',
              error: 'game_not_in_judging_state',
            },
          });
        }
        if (this.currentJudge !== msg.data.playerId) {
          this.callBack({
            respType: 'invalid_request',
            data: {
              playerId: msg.data.playerId,
              message: 'You are not the judge',
              error: 'you_are_not_the_judge',
            },
          });
        }
        const selectedCapCard = this.judgingPile.find(
          (pc) => pc.card.id === msg.data.cardId
        );
        if (selectedCapCard === undefined) {
          this.callBack({
            respType: 'invalid_request',
            data: {
              playerId: msg.data.playerId,
              message: 'Card not in judging pile',
              error: 'card_not_in_judging_pile',
            },
          });
          break;
        }
        this.cardsWon.get(selectedCapCard.pId)!.push(this.selectedMemeCard!);
        this.gameState = 'roundWinnerSelected';
        this.callBack({
          respType: 'round_winner_selected_resp',
          data: { playerId: selectedCapCard.pId },
        });
        break;
      case 'ready_next_turn':
        if (this.gameState !== 'roundWinnerSelected') {
          this.callBack({
            respType: 'invalid_request',
            data: {
              playerId: msg.data.playerId,
              message: 'Game not in roundWinnerSelected state',
              error: 'game_not_in_roundWinnerSelected_state',
            },
          });
          break;
        }
        if (this.playerReady.has(msg.data.playerId)) {
          this.callBack({
            respType: 'invalid_request',
            data: {
              playerId: msg.data.playerId,
              message: 'You are already ready',
              error: 'you_are_already_ready',
            },
          });
        }
        this.playerReady.add(msg.data.playerId);
        this.callBack({
          respType: 'player_ready_count',
          data: { playerCount: this.playerReady.size },
        });
        if (this.playerReady.size === this.playerIds.length) {
          this.gameState = 'judgeSelect';
          this.newRound();
          this.playerReady.clear();
          this.callBack({
            respType: 'startResp',
            data: {
              playerHands: this.getPlayerHands(),
              judge: this.currentJudge!,
            },
          });
        }
      default:
        break;
    }
  }

  private start() {
    this.shuffle();
    this.deal();
    this.gameState = 'judgeSelect';
  }

  private reset() {
    this.turn = 0;
    this.putCapCardDiscardsBackInDeck();
    this.putMemeCardDiscardsBackInDeck();
    this.putHandsBackInDeck();
    this.shuffle();
    this.deal();
    this.gameState = 'ready';
  }

  private newRound() {
    this.playerReady.clear();
    this.turn++;
    this.currentJudge = this.playerIds[this.turn % this.playerIds.length];
    this.gameState = 'judgeSelect';
  }

  private playCard(pc: playerCard) {
    const hand = this.capCardHands.get(pc.playerId)!;
    const card = hand.find((c) => c.id === pc.cardId)!;
    const newHand = hand.filter((c) => c.id !== card.id);
    this.judgingPile.push({ pId: pc.playerId, card: card });
    this.capCardHands.set(pc.playerId, newHand);
  }

  private shouldAdvanceToJudging(): boolean {
    const playersInPlay = this.capCardHands.keys().toArray();
    if (playersInPlay.length === this.playerIds.length - 1) {
      return true;
    }
    return false;
  }

  private makeDealResponse(): startResp {
    const respData = this.getPlayerHands();
    this.pickRandomStartingJudge();
    return {
      respType: 'startResp',
      data: { playerHands: respData, judge: this.currentJudge! },
    };
  }

  private pickRandomStartingJudge(): void {
    this.currentJudge =
      this.playerIds[Math.floor(Math.random() * this.playerIds.length)];
  }

  private getPlayerHands(): playerHands {
    const playerHhands: playerHands = [];
    for (const [k, v] of this.capCardHands) {
      playerHhands.push({ playerId: k, cardIds: v.map((c) => c.id) });
    }
    return playerHhands;
  }

  private shuffle() {
    this.memeDeck.shuffle();
    this.captionDeck.shuffle();
  }

  private draw(pId: string): void {
    const hand = this.capCardHands.get(pId)!;
    if (hand.length >= 7) {
      this.callBack({
        respType: 'invalid_request',
        data: {
          playerId: pId,
          message: 'Hand at max size',
          error: 'hand_at_max_size',
        },
      });
      return;
    }
    if (this.captionDeck.cards.length === 0) {
      this.putCapCardDiscardsBackInDeck();
    }
    const c = this.captionDeck.cards.pop();
    this.callBack({
      respType: 'draw_resp',
      data: { playerId: pId, cardId: c!.id },
    });
  }

  private deal() {
    const capCards = this.captionDeck.cards;
    const cardsPerHand = 7;
    for (let i = 0; i < cardsPerHand; i++) {
      for (const playerId of this.playerIds) {
        const capCard = capCards.pop();
        if (capCard !== undefined) {
          this.capCardHands.get(playerId)?.push(capCard);
        }
      }
    }
  }

  private putHandsBackInDeck() {
    const playerCards = this.capCardHands.values();
    playerCards.forEach((cards) => {
      this.captionDeck.cards.unshift(...cards);
      cards.length = 0;
    });
  }

  private putCapCardDiscardsBackInDeck() {
    const discards = this.capCardDiscards;
    if (discards.cards.length <= 0) {
      return;
    }
    discards.shuffle();
    this.captionDeck.cards.unshift(...discards.cards);
    discards.cards.length = 0;
  }

  private putMemeCardDiscardsBackInDeck() {
    const discards = this.memeCardDiscards;
    if (discards.cards.length <= 0) {
      return;
    }
    discards.shuffle();
    this.memeDeck.cards.unshift(...discards.cards);
    discards.cards.length = 0;
  }

  private putJudgeHandBackInDeck() {
    this.memeDeck.cards.unshift(...this.memeCardJudgeHand);
    this.memeCardJudgeHand.length = 0;
  }
}
