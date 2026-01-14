import { MockNetworkServer, testDc } from '../../network/mockServer';
import { capCard, memeCard } from '../core/card';
import { NewCaptionCardDeck, NewMemeCardDeck } from '../core/deck';
import { csResponse, ICSServer, message } from '../server/server';

type clientState =
  | 'menu'
  | 'joining'
  | 'waiting_for_players'
  | 'judge_selecting_meme'
  | 'play_caption_cards'
  | 'judge_selecting_cap'
  | 'round_winner_selected'
  | 'not-ready'
  | 'ready';

export class CSClient {
  public state: clientState = 'menu';
  public deckConfig = testDc;
  private captionDeck = NewCaptionCardDeck(this.deckConfig.capCardTexts);
  private memeDeck = NewMemeCardDeck(this.deckConfig.memCardImages);
  private server: ICSServer;
  public myId: string;
  public hostId: string | undefined;
  private callBack: (response: csResponse) => void;
  private changeCallBack: (response: csResponse) => void;
  public players: string[] = [];
  public playersInPlay: string[] = [];
  public playersInReady: string[] = [];
  public judge: string = '';
  public judgeHand: memeCard[] = [];
  public judgeSelectedMemeCard: memeCard | undefined;
  public judgingPile: capCard[] = [];
  public myHand: capCard[] = [];
  public capCardInPlay: capCard | undefined;
  public turn = 0;

  constructor(
    myId: string,
    server: ICSServer | undefined,
    changeCallBack: (response: csResponse) => void
  ) {
    this.changeCallBack = changeCallBack;
    this.callBack = (res) => this.handleResponse(res);
    this.myId = myId;
    if (server === undefined) {
      this.server = new MockNetworkServer(this.myId, this.callBack);
    } else {
      this.server = server;
    }
  }

  public ServerWait() {
    this.server.PostMessage({
      msgType: 'wait_for_players',
      data: {
        requestingWaitPlayerId: this.myId,
      },
    });
  }

  public Join() {
    this.server.PostMessage({
      msgType: 'plr_join',
      data: {
        playerJoiningId: this.myId,
      },
    });
  }

  public Start() {
    this.server.PostMessage({
      msgType: 'start',
      data: {
        requestingStartPlayerId: this.myId,
      },
    });
  }

  public GetJudgeHand() {
    this.server.PostMessage({
      msgType: 'get_judge_hand',
      data: {
        playerId: this.myId,
      },
    });
  }

  public JudgeSelect(capCardId: number) {
    this.server.PostMessage({
      msgType: 'judge_selected_caption_card',
      data: {
        playerId: this.myId,
        cardId: capCardId,
      },
    });
  }

  public SelectJudgeMemeCard(cardId: number) {
    this.judgeSelectedMemeCard = this.judgeHand.find((c) => c.id === cardId)!;

    this.server.PostMessage({
      msgType: 'judge_selected_meme_card',
      data: {
        playerId: this.myId,
        cardId: cardId,
      },
    });
  }

  public PlayCapCard(cardId: number) {
    this.server.PostMessage({
      msgType: 'pl_card',
      data: {
        playerId: this.myId,
        cardId: cardId,
      },
    });
  }

  public ReadyForNextRound() {
    this.server.PostMessage({
      msgType: 'ready_next_turn',
      data: {
        playerId: this.myId,
      },
    });
  }

  public get iAmTheJudge(): boolean {
    return this.judge === this.myId;
  }

  private get amIReady(): boolean {
    return this.playersInReady.includes(this.myId);
  }

  private handleResponse(response: csResponse) {
    switch (response.respType) {
      case 'invalid_request':
        this.handleinvalidResponse(response);
        break;
      case 'wait_for_players':
        this.state = 'waiting_for_players';
        break;
      case 'plr_join_resp':
        //do something
        this.players = response.data.playersInLobby;
        break;
      case 'startResp':
        //do something
        this.judge = response.data.judge;
        this.myHand = response.data.playerHands
          .find((h) => h.playerId === this.myId)!
          .cardIds.map(
            (id) => this.captionDeck.cards.find((c) => c.id === id)!
          );
        this.state = 'judge_selecting_meme';
        break;
      case 'judgeing_Hand_Resp':
        this.judgeHand = response.data.memCardIds.map(
          (id) => this.memeDeck.cards.find((c) => c.id === id)!
        );
        break;
      case 'judge_selected_meme_card_resp':
        const mcId = response.data.memeCardId;
        const memeCard = this.memeDeck.cards.find((c) => c.id === mcId)!;
        if (this.iAmTheJudge) {
          this.judgeHand = [];
        }
        this.judgeSelectedMemeCard = memeCard;
        this.state = 'play_caption_cards';
        break;
      case 'pl_card_resp':
        //do something
        this.playersInPlay.push(response.data.playerId);
        if (response.data.playerId === this.myId) {
          this.capCardInPlay = this.myHand.find(
            (c) => c.id === response.data.cardId
          )!;
          this.myHand = this.myHand.filter(
            (c) => c.id !== this.capCardInPlay!.id
          );
        }
        break;
      case 'draw_resp':
        //do something
        const ccId = response.data.cardId;
        const draw = this.captionDeck.cards.find((c) => c.id === ccId)!;
        this.myHand.push(draw);
        break;
      case 'show_juding_pile_resp':
        this.state = 'judge_selecting_cap';
        this.judgingPile = response.data.capCardIds.map(
          (id) => this.captionDeck.cards.find((c) => c.id === id)!
        );
        break;
      case 'round_winner_selected_resp':
        this.state = 'round_winner_selected';
        // Celebrate? 🎉
        break;
      case 'player_ready_list':
        this.playersInReady = response.data.playersReady;
        if (this.amIReady) {
          this.state = 'ready';
        }
        break;
      default:
        break;
    }
    this.changeCallBack(response);
  }

  private newRound() {
    this.judgeHand = [];
    this.judgeSelectedMemeCard = undefined;
    this.judgingPile = [];
    this.capCardInPlay = undefined;
    this.playersInPlay = [];
  }

  private handleinvalidResponse(response: csResponse) {
    switch (response.respType) {
    }
  }
}
