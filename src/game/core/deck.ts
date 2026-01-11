import { card, capCard, memeCard, NewCapCard, NewMemeCard } from './card';

export type deckConfig = {
  memCardImages: string[];
  capCardTexts: string[];
};

export type deck = {
  readonly memCards: memeCard[];
  readonly capCards: capCard[];
  shuffle(): void;
};

class Deck implements deck {
  readonly memCards: memeCard[];
  readonly capCards: capCard[];
  constructor(deckConfig: deckConfig) {
    this.memCards = deckConfig.memCardImages.map((image, index) =>
      NewMemeCard(index, image)
    );
    this.capCards = deckConfig.capCardTexts.map((text, index) =>
      NewCapCard(index, text)
    );
  }

  /**
   * Shuffles both the meme and caption card decks using the Fisher-Yates algorithm.
   */
  public shuffle() {
    this._shuffleArray(this.memCards);
    this._shuffleArray(this.capCards);
  }

  /**
   * Shuffles an array in-place using the Fisher-Yates (aka Knuth) shuffle.
   * @param array The array to be shuffled.
   */
  private _shuffleArray<T extends card>(array: T[]): void {
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }
  }
}

export function NewDeck(deckConfig: deckConfig): deck {
  return new Deck(deckConfig);
}
