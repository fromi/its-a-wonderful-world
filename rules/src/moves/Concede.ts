import GameState from '../GameState'
import GameView from '../GameView'
import EmpireName from '../material/EmpireName'
import MoveType from './MoveType'

export default interface Concede {
  type: typeof MoveType.Concede
  playerId: EmpireName
}

export function concede(state: GameState | GameView, move: Concede) {
  const player = state.players.find(player => player.empire === move.playerId)
  if (!player) return console.error('Cannot apply', move, 'on', state, ': player id is missing')
  if (player.eliminated) return console.error('Cannot apply', move, 'on', state, ': player is already eliminated')
  player.eliminated = state.players.filter(player => player.eliminated).length + 1
}