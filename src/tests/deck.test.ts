import { NewDeck, deckConfig } from '../game/engine/deck';

describe('Deck', () => {
  const deckConfig: deckConfig = {
    memCardImages: ['meme1.png', 'meme2.png', 'meme3.png'],
    capCardTexts: ['caption1', 'caption2', 'caption3'],
  };

  it('should create a new deck with the correct number of cards', () => {
    const deck = NewDeck(deckConfig);
    expect(deck.memCards.length).toBe(deckConfig.memCardImages.length);
    expect(deck.capCards.length).toBe(deckConfig.capCardTexts.length);
  });

  it('should shuffle the cards', () => {
    const deck = NewDeck(deckConfig);
    const originalMemCards = [...deck.memCards];
    const originalCapCards = [...deck.capCards];

    deck.shuffle();

    // It's technically possible for a shuffle to result in the same order,
    // but with 3 items, it's a 1 in 6 chance. For a simple test, this is acceptable.
    expect(deck.memCards).not.toEqual(originalMemCards);
    expect(deck.capCards).not.toEqual(originalCapCards);
  });
});
