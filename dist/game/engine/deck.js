import { NewCapCard, NewMemeCard } from './card';
class Deck {
    memCards;
    capCards;
    constructor(deckConfig) {
        this.memCards = deckConfig.memCardImages.map((image, index) => NewMemeCard(index, image));
        this.capCards = deckConfig.capCardTexts.map((text, index) => NewCapCard(index, text));
    }
    /**
     * Shuffles both the meme and caption card decks using the Fisher-Yates algorithm.
     */
    shuffle() {
        this._shuffleArray(this.memCards);
        this._shuffleArray(this.capCards);
    }
    /**
     * Shuffles an array in-place using the Fisher-Yates (aka Knuth) shuffle.
     * @param array The array to be shuffled.
     */
    _shuffleArray(array) {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
    }
}
export function NewDeck(deckConfig) {
    return new Deck(deckConfig);
}
