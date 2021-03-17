import GameState from './GameState'
import GameView from './GameView'
import Player from './Player'
import PlayerView from './PlayerView'

export function isGameView(game: GameState | GameView): game is GameView {
  return typeof game.deck === 'number'
}

export function isPlayer(player: Player | PlayerView): player is Player {
  return Array.isArray(player.hand)
}

export function isPlayerView(player: Player | PlayerView): player is PlayerView {
  return typeof player.hand === 'number'
}