import {Action, Game, Undo} from '../../../Workshop/packages/rules-api'
import canUndo from './canUndo'
import GameView from './GameView'
import EmpireName from './material/EmpireName'
import {chooseDevelopmentCardInView} from './moves/ChooseDevelopmentCard'
import {completeConstruction} from './moves/CompleteConstruction'
import {concede} from './moves/Concede'
import {revealDealtDevelopmentCards} from './moves/DealDevelopmentCards'
import {discardLeftOverCardsInView} from './moves/DiscardLeftoverCards'
import {MoveView} from './moves/Move'
import MoveType from './moves/MoveType'
import {passCardsInView} from './moves/PassCards'
import {placeCharacter} from './moves/PlaceCharacter'
import {placeResource} from './moves/PlaceResource'
import {produce} from './moves/Produce'
import {receiveCharacter} from './moves/ReceiveCharacter'
import {recycle} from './moves/Recycle'
import {revealChosenCardsInView} from './moves/RevealChosenCards'
import {slateForConstruction} from './moves/SlateForConstruction'
import {startPhase} from './moves/StartPhase'
import {tellYouAreReady} from './moves/TellYouAreReady'
import {transformIntoKrystallium} from './moves/TransformIntoKrystallium'
import {getPredictableAutomaticMoves} from './Rules'

export default class ItsAWonderfulWorldView implements Game<GameView, MoveView>, Undo<GameView, MoveView, EmpireName> {
  state: GameView

  constructor(state: GameView) {
    this.state = state
  }

  getAutomaticMove(): MoveView | void {
    getPredictableAutomaticMoves(this.state)
  }

  play(move: MoveView): void {
    switch (move.type) {
      case MoveType.DealDevelopmentCards:
        return revealDealtDevelopmentCards(this.state, move)
      case MoveType.ChooseDevelopmentCard:
        return chooseDevelopmentCardInView(this.state, move)
      case MoveType.RevealChosenCards:
        return revealChosenCardsInView(this.state, move)
      case MoveType.PassCards:
        return passCardsInView(this.state, move)
      case MoveType.DiscardLeftoverCards:
        return discardLeftOverCardsInView(this.state, move)
      case MoveType.StartPhase:
        return startPhase(this.state, move)
      case MoveType.SlateForConstruction:
        return slateForConstruction(this.state, move)
      case MoveType.Recycle:
        return recycle(this.state, move)
      case MoveType.PlaceResource:
        return placeResource(this.state, move)
      case MoveType.CompleteConstruction:
        return completeConstruction(this.state, move)
      case MoveType.TransformIntoKrystallium:
        return transformIntoKrystallium(this.state, move)
      case MoveType.TellYouAreReady:
        return tellYouAreReady(this.state, move)
      case MoveType.Produce:
        return produce(this.state, move)
      case MoveType.ReceiveCharacter:
        return receiveCharacter(this.state, move)
      case MoveType.PlaceCharacter:
        return placeCharacter(this.state, move)
      case MoveType.Concede:
        return concede(this.state, move)
    }
  }

  canUndo(action: Action<MoveView, EmpireName>, consecutiveActions: Action<MoveView, EmpireName>[]): boolean {
    return canUndo(this.state, action, consecutiveActions)
  }
}