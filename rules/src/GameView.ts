import GameState from './GameState'
import Player from './Player'
import PlayerView from './PlayerView'

type GameView = Omit<GameState, 'deck' | 'players'> & {
  deck: number
  players: (Player | PlayerView)[]
}

export default GameView