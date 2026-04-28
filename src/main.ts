import "./styles.css";
import { createRetroRushGame } from "./game/createRetroRushGame";

const game = createRetroRushGame("game");

if (import.meta.hot) {
  import.meta.hot.dispose(() => {
    game.destroy(true);
  });
}
