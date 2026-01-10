class MemeCard {
    id;
    image;
    constructor(id, image) {
        this.id = id;
        this.image = image;
    }
}
class CapCard {
    id;
    text;
    constructor(id, text) {
        this.id = id;
        this.text = text;
    }
}
export function NewMemeCard(id, image) {
    return new MemeCard(id, image);
}
export function NewCapCard(id, text) {
    return new CapCard(id, text);
}
