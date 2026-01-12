# CardSlop Game Logic

This document explains the game logic for the CardSlop server. It covers the game states, the actions that can be taken in each state, and how the state changes.

## Game States

The game can be in one of the following states:

- `never_started`: The initial state of the game.
- `waiting`: The game is waiting for players to join.
- `judgeSelect`: The judge is selecting a meme card.
- `playing`: Players are selecting a caption card to play.
- `judging`: The judge is selecting the winning caption card.
- `roundWinnerSelected`: The winner of the round has been selected.
- `reset`: The game is being reset.

## State Diagram

```ascii
+-------------------+
|  never_started    |
+-------------------+
          |
          | host starts waiting
          v
+-------------------+
|      waiting      |
+-------------------+
          |
          | host starts game
          v
+-------------------+
|    judgeSelect    |<---------------------------------+
+-------------------+                                  |
          |                                            |
          | judge selects meme                         |
          v                                            |
+-------------------+                                  |
|      playing      |                                  |
+-------------------+                                  |
          |                                            |
          | all players play card                      |
          v                                            |
+-------------------+                                  |
|      judging      |                                  |
+-------------------+                                  |
          |                                            |
          | judge selects winner                       |
          v                                            |
+-----------------------+                              |
| roundWinnerSelected   |                              |
+-----------------------+                              |
          |                                            |
          | all players ready                          |
          +--------------------------------------------+
```

## Decision Matrix and State Transitions

### `never_started`

- **Description:** The initial state of the game.
- **Possible Actions:**
  - `wait_for_players` (host only): Moves the game to the `waiting` state.
- **State Transition:**
  - `never_started` -> `waiting`

### `waiting`

- **Description:** The game is waiting for players to join.
- **Possible Actions:**
  - `plr_join`: A player joins the game.
  - `start` (host only): Starts the game if there are at least 2 players.
- **State Transition:**
  - `waiting` -> `judgeSelect`

### `judgeSelect`

- **Description:** The judge is selecting a meme card.
- **Possible Actions:**
  - `get_judge_hand` (judge only): The judge requests their hand of meme cards.
  - `judge_selected_meme_card` (judge only): The judge selects a meme card.
- **State Transition:**
  - `judgeSelect` -> `playing`

### `playing`

- **Description:** Players are selecting a caption card to play.
- **Possible Actions:**
  - `pl_card` (players who are not the judge): A player plays a caption card.
- **State Transition:**
  - `playing` -> `judging` (once all non-judge players have played a card)

### `judging`

- **Description:** The judge is selecting the winning caption card.
- **Possible Actions:**
  - `judge_selected_caption_card` (judge only): The judge selects the winning caption card.
- **State Transition:**
  - `judging` -> `roundWinnerSelected`

### `roundWinnerSelected`

- **Description:** The winner of the round has been selected. The winning player is awarded the meme card.
- **Possible Actions:**
  - `ready_next_turn`: A player indicates they are ready for the next round.
- **State Transition:**
  - `roundWinnerSelected` -> `judgeSelect` (once all players are ready)

### `reset` (Any state after `never_started`)

- **Description:** The game is being reset. All cards are returned to the decks, and the decks are shuffled. The game then returns to a `ready` state, which is not currently used but is in the `gameStates` type. It then moves to `judgeSelect`.
- **Possible Actions:**
  - `reset`: Resets the game.
- **State Transition:**
  - `*` -> `ready` -> `judgeSelect`

## Technical Architecture

The game server is built using TypeScript and follows a message-driven architecture.

### Core Components

- **`CSServer` Class:** This is the main class that encapsulates all the game logic. It holds the game state and provides a single public method, `PostMessage`, to interact with the game.

- **State Management:** The game's state is managed within the `CSServer` class instance. Key properties include:

  - `gameState`: A string literal type that tracks the current state of the game (e.g., `'waiting'`, `'playing'`).
  - `playerIds`: An array of strings representing the players in the game.
  - `capCardHands`: A `Map` that associates each `playerId` with their hand of caption cards.
  - `memeCardJudgeHand`: An array of `memeCard` objects for the judge's hand.
  - `judgingPile`: An array of objects that holds the caption cards played by players in a round.

- **Message-Driven Interaction:**

  - **`message` type:** A discriminated union type that defines all possible actions that can be sent to the server. Each message has a `msgType` and a `data` payload.
  - **`PostMessage(msg: message)` method:** This is the single entry point for all game actions. It uses a `switch` statement on the `msg.msgType` to delegate to the appropriate private method to handle the action.

- **Type Safety:** The use of TypeScript's static typing, especially with discriminated unions for messages and responses, ensures that the server handles a well-defined set of actions and data structures. This reduces the likelihood of runtime errors.

- **Asynchronous Communication:**

  - **`responseCallBack`:** The `CSServer` constructor takes a callback function. This function is used to send responses back to the clients.
  - **`csResponse` type:** A discriminated union type that defines all possible responses the server can send. This allows the client to handle different types of server messages.

- **Deck and Card Management:**
  - The server manages `captionDeck` and `memeDeck`.
  - It handles shuffling, dealing cards to players, and moving cards between the decks, player hands, and discard piles.
