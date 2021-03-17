import {Action} from '../../../Workshop/packages/rules-api'
import GameState from './GameState'
import GameView from './GameView'
import EmpireName from './material/EmpireName'
import Resource from './material/Resource'
import {isChosenDevelopmentCardVisible} from './moves/ChooseDevelopmentCard'
import {isCompleteConstruction} from './moves/CompleteConstruction'
import Move, {MoveView} from './moves/Move'
import MoveType from './moves/MoveType'
import {isPlaceResourceOnConstruction} from './moves/PlaceResource'
import {isRecycle} from './moves/Recycle'
import {isTellYouAreReady} from './moves/TellYouAreReady'
import {isOver, isPlaceItemOnCard} from './Rules'

type ItsAWonderfulWorldAction = Action<Move | MoveView, EmpireName>

export default function canUndo(state: GameState | GameView, action: ItsAWonderfulWorldAction, consecutiveActions: ItsAWonderfulWorldAction[]): boolean {
  const {playerId, move} = action
  if (isOver(state)) return false
  switch (move.type) {
    case MoveType.ChooseDevelopmentCard:
      const player = state.players.find(player => player.empire === playerId)!
      return isChosenDevelopmentCardVisible(move) && player.chosenCard === move.card
    case MoveType.Recycle:
    case MoveType.ReceiveCharacter:
      return !consecutiveActions.some(action => action.playerId === playerId)
    case MoveType.SlateForConstruction:
      return !consecutiveActions.some(action => action.playerId === playerId && (isTellYouAreReady(action.move) || isPlaceItemOnCard(action.move, move.card)))
    case MoveType.PlaceResource:
      if (isPlaceResourceOnConstruction(move)) {
        if (actionCompletedCardConstruction(action, move.card)) {
          return !consecutiveActions.some(action => action.playerId === playerId && (isTellYouAreReady(action.move) || isPlaceItemOnCard(action.move)))
        } else {
          return !consecutiveActions.some(action => action.playerId === playerId && (
            actionCompletedCardConstruction(action, move.card) || (isRecycle(action.move) && action.move.card === move.card)
            || (isTellYouAreReady(action.move) && move.resource !== Resource.Krystallium)
          ))
        }
      } else {
        return !consecutiveActions.some(action => action.playerId === playerId && (isTellYouAreReady(action.move)
          || (isPlaceResourceOnConstruction(action.move) && action.move.resource === Resource.Krystallium)))
      }
    case MoveType.PlaceCharacter:
      if (actionCompletedCardConstruction(action, move.card)) {
        return !consecutiveActions.some(action => action.playerId === playerId && (isTellYouAreReady(action.move) || isPlaceItemOnCard(action.move)))
      } else {
        return !consecutiveActions.some(action => actionCompletedCardConstruction(action, move.card))
      }
    case MoveType.TellYouAreReady:
      return !action.consequences.some(consequence => consequence.type === MoveType.StartPhase || consequence.type === MoveType.Produce)
        && !consecutiveActions.some(action => action.consequences.some(consequence => consequence.type === MoveType.StartPhase || consequence.type === MoveType.Produce))
    default:
      return false
  }
}

function actionCompletedCardConstruction(action: Action<Move | MoveView, EmpireName>, card: number) {
  return action.consequences.some(consequence => isCompleteConstruction(consequence) && consequence.card === card)
}