import GameState from '../GameState'
import GameView from '../GameView'
import {isConstructionBonus} from '../material/Development'
import {developmentCards} from '../material/Developments'
import EmpireName from '../material/EmpireName'
import Move, {MoveView} from './Move'
import MoveType from './MoveType'

export default interface CompleteConstruction {
  type: typeof MoveType.CompleteConstruction
  playerId: EmpireName
  card: number
}

export function completeConstruction(state: GameState | GameView, move: CompleteConstruction) {
  const player = state.players.find(player => player.empire === move.playerId)
  if (!player) return console.error('Cannot apply', move, 'on', state, ': could not find player')
  player.constructionArea = player.constructionArea.filter(construction => construction.card !== move.card)
  player.constructedDevelopments.push(move.card)
  const bonus = developmentCards[move.card].constructionBonus
  if (bonus) {
    if (isConstructionBonus(bonus)) {
      player.bonuses.push(bonus)
    } else {
      Object.keys(bonus).filter(isConstructionBonus).forEach(bonusType => player.bonuses.push(...new Array(bonus[bonusType]).fill(bonusType)))
    }
  }
}

export function isCompleteConstruction(move: Move | MoveView): move is CompleteConstruction {
  return move.type === MoveType.CompleteConstruction
}