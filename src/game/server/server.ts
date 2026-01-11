import { deck, NewDeck, deckConfig } from '../core/deck';
type playerId = string;
type cardId = number;

type message =
  | waitForplayersMsg
  | plyrJoinMsg
  | startMsg
  | playCardMsg
  | initMsg
  | resetMsg;

type initMsg = {
  msgType: 'init';
  data: undefined;
};

type resetMsg = {
  msgType: 'reset';
  data: undefined;
};

type waitForplayersMsg = {
  msgType: 'wait_for_players';
  data: undefined;
};

type plyrJoinMsg = {
  msgType: 'plr_join';
  data: string;
};

type startMsg = {
  msgType: 'start';
  data: undefined;
};

type playerCard = { playerId: string; cardId: number };

type playCardMsg = {
  msgType: 'pl_card';
  data: playerCard;
};

type response =
  | waitResp
  | plyrJoinResp
  | startResp
  | drawResponse
  | playCardResp
  | invalidRequestRsep;

type waitResp = {
  respType: 'wait_for_players';
  data: undefined;
};

type playCardResp = {
  respType: 'pl_card_resp';
  data: { playersInPlay: string[]; playersNotInPlay: string[] };
};

type plyrJoinResp = {
  respType: 'plr_join_resp';
  data: string;
};

type playerHands = { playerId: string; cardIds: number[] }[];

type startResp = {
  respType: 'startResp';
  data: { playerHands: playerHands; judge: string };
};

type drawResponse = {
  respType: 'draw_resp';
  data: { cardId: number; playerId: string };
};

type invalidRequestRsep = {
  respType: 'invalid_request';
  data: string;
};

type gameStates = 'init' | 'waiting' | 'playing';

class CSServer {
  private deck: deck;
  private playerIds: playerId[] = [];
  private currentJudge: playerId | undefined;
  private capCardHands: Map<playerId, cardId[]> = new Map();
  private memeCardHands: Map<playerId, cardId[]> = new Map();
  private gameState: gameStates = 'init';
  private turn = 0;
  private cardsInPlay: playerCard[] = [];

  constructor(deckConfig: deckConfig) {
    this.deck = NewDeck(deckConfig);
  }

  public PostMessage(msg: message): response | void {
    switch (msg.msgType) {
      case 'init':
        this.init();
        return { respType: 'wait_for_players', data: undefined };
      case 'reset':
        this.reset();
        return this.makeDealResponse();
      case 'wait_for_players':
        if (this.gameState !== 'init') {
          return {
            respType: 'invalid_request',
            data: 'Game already started',
          };
        }
        this.gameState = 'waiting';
        return { respType: 'wait_for_players', data: undefined };
      case 'plr_join':
        if (this.gameState !== 'waiting') {
          return {
            respType: 'invalid_request',
            data: 'Game not in waiting state',
          };
        }
        this.playerIds.push(msg.data);
        this.capCardHands.set(msg.data, []);
        this.memeCardHands.set(msg.data, []);
        return { respType: 'plr_join_resp', data: msg.data };
      case 'start':
        if (this.gameState !== 'waiting' || this.playerIds.length < 2) {
          return {
            respType: 'invalid_request',
            data: 'Not enough players',
          };
        }
        this.start();
        return this.makeDealResponse();
      case 'pl_card':
        if (this.gameState !== 'playing') {
          return {
            respType: 'invalid_request',
            data: 'Game not in playing state',
          };
        }
        this.playCard(msg.data);
        return this.currentPlayStatus();
      default:
        break;
    }
  }

  private start() {
    this.deck.shuffle();
    this.deal();
    this.gameState = 'playing';
  }

  private init() {
    this.currentJudge = undefined;
    this.capCardHands = new Map();
    this.memeCardHands = new Map();
    this.turn = 0;
    this.cardsInPlay = [];
    this.gameState = 'init';
    this.playerIds = [];
  }

  private reset() {
    this.currentJudge = undefined;
    this.capCardHands = new Map();
    this.memeCardHands = new Map();
    this.turn = 0;
    this.cardsInPlay = [];
    this.deck.shuffle();
    this.deal();
    this.gameState = 'playing';
  }

  private playCard(pc: playerCard) {
    this.cardsInPlay.push(pc);
  }

  private currentPlayStatus(): playCardResp {
    const playersInPlay = this.cardsInPlay.map((pc) => pc.playerId);
    const playersNotInPlay = this.playerIds.filter(
      (x) => !playersInPlay.includes(x)
    );
    return {
      respType: 'pl_card_resp',
      data: { playersInPlay, playersNotInPlay },
    };
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
      playerHhands.push({ playerId: k, cardIds: v });
    }
    return playerHhands;
  }

  private deal() {
    const capCards = this.deck.capCards;
    const cardsPerHand = 7;
    for (let i = 0; i < cardsPerHand; i++) {
      for (const playerId of this.playerIds) {
        const capCard = capCards.pop();
        if (capCard !== undefined) {
          this.capCardHands.get(playerId)?.push(capCard.id);
        }
      }
    }
  }
}
