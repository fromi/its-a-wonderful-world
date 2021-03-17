import GameState from '../GameState'
import GameView from '../GameView'
import EmpireName from '../material/EmpireName'
import Resource from '../material/Resource'
import MoveType from './MoveType'

export default interface TransformIntoKrystallium {
  type: typeof MoveType.TransformIntoKrystallium
  playerId: EmpireName
}

export function transformIntoKrystallium(state: GameState | GameView, move: TransformIntoKrystallium) {
  const player = state.players.find(player => player.empire === move.playerId)
  if (!player) return console.error('Cannot apply', move, 'on', state, ': could not find player')
  for (let i = 0; i < 5; i++) {
    player.empireCardResources.splice(player.empireCardResources.findIndex(resource => resource !== Resource.Krystallium), 1)
  }
  player.empireCardResources.push(Resource.Krystallium)
}