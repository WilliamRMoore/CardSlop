import { deckConfig } from '../game/core/deck';
import {
  csResponse,
  CSServer,
  ICSServer,
  message,
  responseCallBack,
} from '../game/server/server';

export class MockNetworkServer implements ICSServer {
  private server: CSServer;
  private clientCallback: responseCallBack;
  private networkDelay = 500; // in milliseconds

  constructor(hostId: string, clientCallback: responseCallBack) {
    this.clientCallback = clientCallback;
    const serverCallback: responseCallBack = (response: csResponse) => {
      this.sendResponseToClient(response);
    };
    this.server = new CSServer(testDc, serverCallback, hostId);
  }

  public PostMessage(msg: message): void {
    setTimeout(() => {
      this.server.PostMessage(msg);
    }, this.networkDelay);
  }

  private sendResponseToClient(response: csResponse): void {
    setTimeout(() => {
      this.clientCallback(response);
    }, this.networkDelay);
  }
}

export const testDc: deckConfig = {
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
