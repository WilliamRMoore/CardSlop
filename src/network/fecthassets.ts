const url = '';

async function getDeckWithFetch(deckName: string) {
  try {
    const response = await fetch(`/decks/${deckName}/captions.json`);

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching deck:', error);
    throw error;
  }
}
