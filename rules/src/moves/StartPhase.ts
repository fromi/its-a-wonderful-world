import GameState from '../GameState'
import GameView from '../GameView'
import Phase from '../Phase'
import MoveType from './MoveType'

type StartPhase = { type: typeof MoveType.StartPhase, phase: Phase }

export default StartPhase

export function startPhase(state: GameState | GameView, move: StartPhase) {
  state.phase = move.phase
  state.players.forEach(player => player.ready = false)
  if (move.phase === Phase.Draft) {
    delete state.productionStep
    state.round++
  }
}