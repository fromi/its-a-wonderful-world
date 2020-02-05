import Development from '../material/Development'
import MoveType from './MoveType'

type PassCards = { type: typeof MoveType.PassCards }

export default PassCards

export type PassCardsView<P> = PassCards
  & { playerId?: P, receivedCards?: Development[] }

export function passCards(): PassCards {
  return {type: MoveType.PassCards}
}

export function isPassCardsView<P>(move: PassCards | PassCardsView<P>): move is PassCardsView<P> {
  return (move as PassCardsView<P>).receivedCards != undefined
}