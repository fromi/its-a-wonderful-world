import GameState from '../GameState'
import GameView from '../GameView'
import EmpireName from '../material/EmpireName'
import {numberOfCardsToDraft} from '../Rules'
import Move from './Move'
import MoveType from './MoveType'

type RevealChosenCards = { type: typeof MoveType.RevealChosenCards }

export default RevealChosenCards

export type RevealChosenCardsView = RevealChosenCards & {
  revealedCards: { [key in EmpireName]?: number }
}

export function revealChosenCards(state: GameState) {
  state.players.forEach(player => {
    if (player.chosenCard !== undefined) {
      player.draftArea.push(player.chosenCard)
      delete player.chosenCard
      if (player.draftArea.length < numberOfCardsToDraft) {
        player.cardsToPass = player.hand
      }
    }
  })
}

export function revealChosenCardsInView(state: GameView, move: RevealChosenCardsView) {
  state.players.forEach(player => {
    player.draftArea.push(move.revealedCards[player.empire]!)
    delete player.chosenCard
  })
}

export function isRevealChosenCards(move: Move): move is (RevealChosenCards | RevealChosenCardsView) {
  return move.type === MoveType.RevealChosenCards
}

export function isRevealChosenCardsView(move: RevealChosenCards | RevealChosenCardsView): move is RevealChosenCardsView {
  return (move as RevealChosenCardsView).revealedCards !== undefined
}