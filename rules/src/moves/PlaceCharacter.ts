import Character from '../material/Character'
import EmpireName from '../material/EmpireName'
import Move, {MoveView} from './Move'
import MoveType from './MoveType'

export default interface PlaceCharacter {
  type: typeof MoveType.PlaceCharacter
  playerId: EmpireName
  character: Character
  card: number
  space: number
}

export function placeCharacter(playerId: EmpireName, character: Character, card: number, space: number): PlaceCharacter {
  return {type: MoveType.PlaceCharacter, playerId, character, card, space}
}

export function isPlaceCharacter(move: Move | MoveView): move is PlaceCharacter {
  return move.type === MoveType.PlaceCharacter
}