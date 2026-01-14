const getEl = (id: string) => {
  return document.getElementById(id) as HTMLElement;
};

//window pieces
const gameWindow = getEl('game-window') as HTMLDivElement;
const gameHeader = getEl('game-header') as HTMLDivElement;
const gameBoard = getEl('game-board') as HTMLDivElement;

//screens

//menu-screen
const menuScreen = getEl('menu-screen') as HTMLDivElement;

//create-screen
const createScreen = getEl('create-screen') as HTMLDivElement;

//join-screen
const joinScreen = getEl('join-screen') as HTMLDivElement;

//wait-screen
const waitScreen = getEl('wait-others-screen') as HTMLDivElement;

//game-screen
const playGameScreen = getEl('game-player-screen') as HTMLDivElement;

//game-won-screen
const gameWonScreen = getEl('game-won-screen') as HTMLDivElement;

//game-ready-screen
const gameReadyScreen = getEl('game-ready-screen') as HTMLDivElement;

export const gameScreens = {
  gameWindow: gameWindow,
  gameHeader: gameHeader,
  gameBoard: gameBoard,
  menuScreen: menuScreen,
  createScreen: createScreen,
  joinScreen: joinScreen,
  waitScreen: waitScreen,
  playGameScreen: playGameScreen,
  gameWonScreen: gameWonScreen,
  gameReadyScreen: gameReadyScreen,
};

//menu-screen elements
const joinBtn = getEl('join-btn') as HTMLButtonElement;
const createBtn = getEl('create-btn') as HTMLButtonElement;

export const menuElements = {
  joinGameBtn: joinBtn,
  createGameBtn: createBtn,
};

//create-screen elements
const hostNameInput = getEl('host-id-input') as HTMLInputElement;
const createLobbyBtn = getEl('create-lobby-btn') as HTMLButtonElement;

export const createElements = {
  hostNameInput: hostNameInput,
  createLobbyBtn: createLobbyBtn,
};

//join-screen elements
const lobbyCodeInput = getEl('lobby-id-input') as HTMLInputElement;
const playerIdInput = getEl('player-id-input') as HTMLLabelElement;
const joinLobbyBtn = getEl('join-lobby-btn') as HTMLButtonElement;
const joinSpinner = getEl('join-spinner') as HTMLDivElement;
const joinError = getEl('join-error') as HTMLDivElement;

export const joinElements = {
  lobbyCodeInput: lobbyCodeInput,
  playerIdInput: playerIdInput,
  joinLobbyBtn: joinLobbyBtn,
  joinSpinner: joinSpinner,
  joinError: joinError,
};

//wait-screen elements
const hostWaitControls = getEl('host-wait-controls') as HTMLDivElement;
const playerJoinCount = getEl('player-join-count') as HTMLSpanElement;
const lobbyCodeDisplay = getEl('lobby-id-input') as HTMLInputElement;
const startGameBtn = getEl('start-game-btn') as HTMLButtonElement;

export const waitElements = {
  playerJoinCount: playerJoinCount,
  lobbyCodeDisplay: lobbyCodeDisplay,
  startGameBtn: startGameBtn,
  hostWaitControls: hostWaitControls,
};

//game-screen elements
const judgeView = getEl('judge-game-view') as HTMLDivElement;
const playerView = getEl('player-game-view') as HTMLDivElement;
const judgeHand = getEl('judge-hand') as HTMLDivElement;
const playerHand = getEl('player-hand') as HTMLDivElement;
const confirmJudgeCardBtn = getEl(
  'confirm-judge-card-btn'
) as HTMLButtonElement;
const confirmCapCardButton = getEl('confirm-cap-card-btn') as HTMLButtonElement;

export const gameElements = {
  judgeView: judgeView,
  playerView: playerView,
  judgeHand: judgeHand,
  playerHand: playerHand,
  confirmJudgeCardBtn: confirmJudgeCardBtn,
  confirmCapCardButton: confirmCapCardButton,
};
