import Resource from './material/Resource'
import Phase from './Phase'
import Player from './Player'

type GameState = {
  players: Player[]
  deck: number[]
  discard: number[]
  round: number
  phase: Phase
  productionStep?: Resource
  tutorial?: boolean
}

export default GameState