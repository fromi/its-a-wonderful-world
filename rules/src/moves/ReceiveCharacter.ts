import GameState from '../GameState'
import GameView from '../GameView'
import Character, {ChooseCharacter} from '../material/Character'
import EmpireName from '../material/EmpireName'
import Move, {MoveView} from './Move'
import MoveType from './MoveType'

export default interface ReceiveCharacter {
  type: typeof MoveType.ReceiveCharacter
  playerId: EmpireName
  character: Character
}

export function receiveCharacter(state: GameState | GameView, move: ReceiveCharacter) {
  const player = state.players.find(player => player.empire === move.playerId)
  if (!player) return console.error('Cannot apply', move, 'on', state, ': could not find player')
  player.characters[move.character]++
  let bonusIndex = player.bonuses.indexOf(move.character)
  if (bonusIndex === -1) {
    bonusIndex = player.bonuses.indexOf(ChooseCharacter)
  }
  player.bonuses.splice(bonusIndex, 1)
}

export function isReceiveCharacter(move: Move | MoveView): move is ReceiveCharacter {
  return move.type === MoveType.ReceiveCharacter
}