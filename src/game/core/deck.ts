import { card, capCard, memeCard, NewCapCard, NewMemeCard } from './card';

export type deckConfig = {
  memCardImages: string[];
  capCardTexts: string[];
};

export type captionCardDeck = CaptionCardDeck;
export type memeCardDeck = MemeCardDeck;

class CaptionCardDeck {
  readonly cards: capCard[] = [];
  public shuffle() {
    this._shuffleArray(this.cards);
  }
  private _shuffleArray(array: capCard[]): void {
    ShuffleArray(array);
  }
}

class MemeCardDeck {
  readonly cards: memeCard[] = [];
  public shuffle() {
    this._shuffleArray(this.cards);
  }
  private _shuffleArray(array: memeCard[]): void {
    ShuffleArray(array);
  }
}

export function ShuffleArray<T extends card>(array: T[]): void {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
}

export function NewCaptionCardDeck(captions: string[]): captionCardDeck {
  const d = new CaptionCardDeck();
  captions.map((t, i) => NewCapCard(i, t)).forEach((c) => d.cards.push(c));
  return d;
}

export function EmptyCaptionCardDeck(): captionCardDeck {
  return new CaptionCardDeck();
}

export function NewMemeCardDeck(memes: string[]): memeCardDeck {
  const d = new MemeCardDeck();
  const cards = memes.map((t, i) => NewMemeCard(i, t));
  cards.forEach((c) => d.cards.push(c));
  return d;
}

export function EmptyMemeCardDeck(): memeCardDeck {
  return new MemeCardDeck();
}
