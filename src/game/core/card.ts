export interface card {
  id: number;
}

export interface memeCard extends card {
  readonly image: string;
}

export interface capCard extends card {
  readonly text: string;
}

class MemeCard implements memeCard {
  readonly id: number;
  readonly image: string;
  constructor(id: number, image: string) {
    this.id = id;
    this.image = image;
  }
}

class CapCard implements capCard {
  readonly id: number;
  readonly text: string;

  constructor(id: number, text: string) {
    this.id = id;
    this.text = text;
  }
}

export function NewMemeCard(id: number, image: string): memeCard {
  return new MemeCard(id, image);
}

export function NewCapCard(id: number, text: string): capCard {
  return new CapCard(id, text);
}
