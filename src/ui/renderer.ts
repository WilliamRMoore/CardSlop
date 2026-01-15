import { CSClient } from '../game/client/client';
import {
  csResponse,
  CSServer,
  ICSServer,
  invalidRequestRsep,
} from '../game/server/server';
import { testDc } from '../network/mockServer';
import {
  createElements,
  gameElements,
  gameScreens,
  joinElements,
  menuElements,
  waitElements,
} from './elements';

export class Renderer {
  private screens = gameScreens;
  private activeScreen = this.screens.menuScreen;
  private connectCode: string | undefined;
  public client: CSClient | undefined;
  private dc = testDc;
  private clientUpdatecallBack = (res: csResponse) => {
    this.ClientUpdate(res);
  };

  constructor() {}

  public SetUpListeners() {
    menuElements.joinGameBtn.addEventListener('click', () => {
      this.GoToJoinLobbyScreen();
    });
    menuElements.createGameBtn.addEventListener('click', () => {
      this.GoToCreateLobbyScreen();
    });

    createElements.hostNameInput.addEventListener('input', () => {
      if (createElements.hostNameInput.value !== '') {
        createElements.createLobbyBtn.disabled = false;
      } else {
        createElements.createLobbyBtn.disabled = true;
      }
    });
    createElements.createLobbyBtn.addEventListener('click', () => {
      this.CreateLobby();
    });

    joinElements.lobbyCodeInput.addEventListener('input', () => {
      this.connectCode = joinElements.lobbyCodeInput.value;
      if (this.connectCode !== '' && this.client !== undefined) {
        joinElements.joinLobbyBtn.disabled = false;
      } else {
        joinElements.joinLobbyBtn.disabled = true;
      }
    });
    joinElements.joinLobbyBtn.addEventListener('click', () => {
      joinElements.joinSpinner.hidden = false;
    });
  }

  private get isHost(): boolean {
    return this.client!.hostId === this.client!.myId;
  }

  private waitScreenEnter() {
    if (this.isHost) {
      waitElements.hostWaitControls.hidden = false;
      waitElements.lobbyCodeDisplay.innerText = this.connectCode!;
    }
    waitElements.playerJoinCount.innerText =
      this.client!.players.length.toString();
  }

  private gameScreenEnter() {
    if (this.client?.iAmTheJudge) {
      gameElements.judgeView.hidden = false;
      gameElements.playerView.hidden = true;
      gameElements.judgeHand.hidden = false;
      gameElements.playerHand.hidden = true;
      gameElements.confirmJudgeCardBtn.hidden = false;
      gameElements.confirmCapCardButton.hidden = true;
    } else {
      gameElements.judgeView.hidden = true;
      gameElements.playerView.hidden = false;
      gameElements.judgeHand.hidden = true;
      gameElements.playerHand.hidden = false;
      gameElements.confirmJudgeCardBtn.hidden = true;
      gameElements.confirmCapCardButton.hidden = false;
    }
  }

  private gameScreenExit() {}

  private waitScreenExit() {
    waitElements.hostWaitControls.hidden = true;
    waitElements.playerJoinCount.innerText = '0';
    waitElements.lobbyCodeDisplay.innerText = '';
  }

  private changeScreen(screen: HTMLDivElement) {
    if (this.activeScreen.id === screen.id) {
      return;
    }
    switch (this.activeScreen.id) {
      case gameScreens.waitScreen.id:
        this.waitScreenExit();
        break;
      case gameScreens.playGameScreen.id:
        this.gameScreenExit();
        break;
    }

    this.activeScreen.hidden = true;
    this.activeScreen = screen;
    this.activeScreen.hidden = false;

    switch (this.activeScreen.id) {
      case gameScreens.waitScreen.id:
        this.waitScreenEnter();
        break;
      case gameScreens.playGameScreen.id:
        this.gameScreenEnter();
        break;
    }
  }

  public CreateLobby() {
    const hostName = createElements.hostNameInput.value;
    if (hostName === '') {
      // validate there is input and show error message to user.
      return;
    }

    const connectCode = 'We will get this value from peer js';
    const s = new CSServer(this.dc, this.clientUpdatecallBack, hostName);
    this.client = new CSClient(hostName, s, this.clientUpdatecallBack);
    this.client.hostId = hostName;
    this.connectCode = connectCode;
    createElements.createLobbyBtn.disabled = true;
    this.client.ServerWait();
  }

  public GotMenuScreen() {
    this.changeScreen(this.screens.menuScreen);
  }

  public GoToCreateLobbyScreen() {
    this.changeScreen(this.screens.createScreen);
  }

  public GoToJoinLobbyScreen() {
    this.changeScreen(this.screens.joinScreen);
  }

  public JoinError() {
    this.changeScreen(this.screens.joinScreen);
    joinElements.joinSpinner.hidden = true;
    joinElements.joinError.hidden = false;
  }

  public ClientUpdate(res: csResponse) {
    if (res.respType === 'invalid_request') {
      this.handlError(res);
      return;
    }
    switch (res.respType) {
      case 'wait_for_players':
        this.changeScreen(this.screens.waitScreen);
        waitElements.playerJoinCount.innerText =
          res.data.playersInLobby.length.toString();
        break;
      case 'plr_join_resp':
        this.changeScreen(this.screens.waitScreen);
        waitElements.playerJoinCount.innerText =
          res.data.playersInLobby.length.toString();
        break;
      case 'startResp':
        this.changeScreen(this.screens.playGameScreen);
        break;
    }
  }

  private handlError(res: invalidRequestRsep) {
    switch (res.data.error) {
    }
  }
}
