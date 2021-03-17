import GameState from '../GameState'
import GameView from '../GameView'
import {isPlayer} from '../typeguards'
import Move, {MoveView} from './Move'
import MoveType from './MoveType'

type PassCards = { type: typeof MoveType.PassCards }

export default PassCards

export type PassCardsView = PassCards & { receivedCards: number[] }

export function passCards(state: GameState) {
  const players = state.players.filter(player => player.cardsToPass)
  const draftDirection = state.round % 2 ? -1 : 1
  for (let i = 0; i < players.length; i++) {
    let previousPlayer = players[(i + players.length + draftDirection) % players.length]
    players[i].hand = previousPlayer.cardsToPass!
  }
  players.forEach(player => delete player.cardsToPass)
}

export function passCardsInView(state: GameView, move: PassCards | PassCardsView) {
  const player = state.players.find(isPlayer)
  if (player && isPassCardsView(move)) {
    player.hand = move.receivedCards
  }
}

export function isPassCards(move: Move | MoveView): move is (PassCards | PassCardsView) {
  return move.type === MoveType.PassCards
}

export function isPassCardsView(move: PassCards | PassCardsView): move is PassCardsView {
  return (move as PassCardsView).receivedCards !== undefined
}