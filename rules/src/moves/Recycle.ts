import GameState from '../GameState'
import GameView from '../GameView'
import {developmentCards} from '../material/Developments'
import EmpireName from '../material/EmpireName'
import Move, {MoveView} from './Move'
import MoveType from './MoveType'

export default interface Recycle {
  type: typeof MoveType.Recycle
  playerId: EmpireName
  card: number
}

export function recycle(state: GameState | GameView, move: Recycle) {
  const player = state.players.find(player => player.empire === move.playerId)
  if (!player) return console.error('Cannot apply', move, 'on', state, ': could not find player')
  const indexInDraftArea = player.draftArea.findIndex(card => card === move.card)
  if (indexInDraftArea !== -1) {
    player.draftArea.splice(indexInDraftArea, 1)
    player.availableResources.push(developmentCards[move.card].recyclingBonus)
  } else {
    player.constructionArea = player.constructionArea.filter(construction => construction.card !== move.card)
    player.bonuses.push(developmentCards[move.card].recyclingBonus)
  }
  state.discard.push(move.card)
}

export function isRecycle(move: Move | MoveView): move is Recycle {
  return move.type === MoveType.Recycle
}