import GameState from '@gamepark/its-a-wonderful-world/GameState'
import GameView from '@gamepark/its-a-wonderful-world/GameView'
import EmpireName from '@gamepark/its-a-wonderful-world/material/EmpireName'
import TutorialAI from './TutorialAI'

export async function ai(game: GameView | GameState, playerId: EmpireName) {
  return new TutorialAI(playerId).play(game as GameState)
}
