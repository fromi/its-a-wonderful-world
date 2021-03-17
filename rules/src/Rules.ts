import {Action, Competitive, Eliminations, IncompleteInformation, SimultaneousGame, TimeLimit, Undo} from '@gamepark/rules-api'
import canUndo from './canUndo'
import GameState from './GameState'
import GameView from './GameView'
import Character, {characters, ChooseCharacter, isCharacter} from './material/Character'
import Construction from './material/Construction'
import Development, {totalCost} from './material/Development'
import {developmentCards} from './material/Developments'
import DevelopmentType, {developmentTypes, isDevelopmentType} from './material/DevelopmentType'
import EmpireName from './material/EmpireName'
import Empires from './material/Empires'
import EmpireSide from './material/EmpireSide'
import Resource, {isResource, resources} from './material/Resource'
import {chooseDevelopmentCard} from './moves/ChooseDevelopmentCard'
import {completeConstruction} from './moves/CompleteConstruction'
import {concede} from './moves/Concede'
import {dealDevelopmentCards} from './moves/DealDevelopmentCards'
import {discardLeftOverCards} from './moves/DiscardLeftoverCards'
import Move, {MoveView} from './moves/Move'
import MoveType from './moves/MoveType'
import {passCards} from './moves/PassCards'
import PlaceCharacter, {isPlaceCharacter, placeCharacter} from './moves/PlaceCharacter'
import PlaceResource, {isPlaceResourceOnConstruction, placeResource, PlaceResourceOnConstruction} from './moves/PlaceResource'
import {produce} from './moves/Produce'
import {receiveCharacter} from './moves/ReceiveCharacter'
import {recycle} from './moves/Recycle'
import {revealChosenCards} from './moves/RevealChosenCards'
import {slateForConstruction} from './moves/SlateForConstruction'
import {startPhase} from './moves/StartPhase'
import {tellYouAreReady} from './moves/TellYouAreReady'
import {transformIntoKrystallium} from './moves/TransformIntoKrystallium'
import {isGameOptions, ItsAWonderfulWorldOptions} from './Options'
import Phase from './Phase'
import Player from './Player'
import PlayerView from './PlayerView'
import shuffle from './shuffle'
import {isGameView, isPlayerView} from './typeguards'

export const numberOfCardsToDraft = 7
const numberOfCardsDeal2Players = 10
export const numberOfRounds = 4

const defaultEmpireCardsSide = EmpireSide.A

// noinspection JSUnusedGlobalSymbols
export default class ItsAWonderfulWorld extends SimultaneousGame<GameState, Move, EmpireName>
  implements IncompleteInformation<GameState, GameView, Move, MoveView, EmpireName>,
    Undo<GameState, Move, EmpireName>,
    Competitive<GameState, Move, EmpireName>,
    Eliminations<GameState, Move, EmpireName>,
    TimeLimit<GameState, Move, EmpireName> {

  constructor(state: GameState)
  constructor(options: ItsAWonderfulWorldOptions)
  constructor(arg: ItsAWonderfulWorldOptions | GameState) {
    if (isGameOptions(arg)) {
      super({
        players: setupPlayers(arg),
        deck: shuffle(Array.from(developmentCards.keys())),
        discard: [],
        round: 1,
        phase: Phase.Draft
      })
    } else {
      super(arg)
    }
  }

  isActive(playerId: EmpireName): boolean {
    const player = this.state.players.find(player => player.empire === playerId)
    if (!player) return false
    switch (this.state.phase) {
      case Phase.Draft:
        return player.chosenCard === undefined && getHandSize(player) > 0
      case Phase.Planning:
      case Phase.Production:
        return !player.ready
    }
  }

  isOver(): boolean {
    return isOver(this.state)
  }

  getAutomaticMove(): Move | void {
    switch (this.state.phase) {
      case Phase.Draft:
        const anyPlayer = this.state.players.filter(player => !player.eliminated)[0]
        if (anyPlayer && !anyPlayer.hand.length && !anyPlayer.draftArea.length) {
          return {type: MoveType.DealDevelopmentCards}
        } else if (this.state.players.every(player => player.chosenCard !== undefined || (player.eliminated && !player.hand.length))) {
          return {type: MoveType.RevealChosenCards}
        } else if (anyPlayer && anyPlayer.cardsToPass) {
          return {type: MoveType.PassCards}
        } else if (anyPlayer && anyPlayer.draftArea.length === numberOfCardsToDraft) {
          if (anyPlayer.hand.length) {
            return {type: MoveType.DiscardLeftoverCards}
          } else {
            return {type: MoveType.StartPhase, phase: Phase.Planning}
          }
        } else {
          for (const player of this.state.players) {
            if (player.chosenCard === undefined && player.hand.length === 1) {
              return {type: MoveType.ChooseDevelopmentCard, playerId: player.empire, card: player.hand[0]}
            }
          }
        }
        break
      case Phase.Planning:
        if (this.state.players.every(player => player.ready)) {
          return {type: MoveType.StartPhase, phase: Phase.Production}
        }
        break
      case Phase.Production:
        if (!this.state.productionStep) {
          return {type: MoveType.Produce, resource: Resource.Materials}
        } else if (this.state.players.every(player => player.ready)) {
          const nextProductionStep = getNextProductionStep(this.state)
          if (nextProductionStep) {
            return {type: MoveType.Produce, resource: nextProductionStep}
          } else if (this.state.round < numberOfRounds) {
            return {type: MoveType.StartPhase, phase: Phase.Draft}
          }
        }
        break
    }
    return getPredictableAutomaticMoves(this.state)
  }

  getLegalMoves(empire: EmpireName) {
    const player = this.state.players.find(player => player.empire === empire)
    if (!player || isPlayerView(player) || (this.state.round === numberOfRounds && this.state.productionStep === Resource.Exploration && player.ready)) {
      return []
    }
    return getLegalMoves(player, this.state.phase)
  }

  play(move: Move) {
    switch (move.type) {
      case MoveType.DealDevelopmentCards:
        return dealDevelopmentCards(this.state)
      case MoveType.ChooseDevelopmentCard:
        return chooseDevelopmentCard(this.state, move)
      case MoveType.RevealChosenCards:
        return revealChosenCards(this.state)
      case MoveType.PassCards:
        return passCards(this.state)
      case MoveType.DiscardLeftoverCards:
        return discardLeftOverCards(this.state)
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

  getScore(empire: EmpireName): number {
    return getScore(getPlayer(this.state, empire))
  }

  rankPlayers(empireA: EmpireName, empireB: EmpireName): number {
    const playerA = getPlayer(this.state, empireA), playerB = getPlayer(this.state, empireB)
    if (playerA.eliminated || playerB.eliminated) {
      return playerA.eliminated ? playerB.eliminated ? playerB.eliminated - playerA.eliminated : 1 : -1
    }
    const scoreA = getScore(playerA), scoreB = getScore(playerB)
    if (scoreA !== scoreB) {
      return scoreB - scoreA
    }
    const buildingsA = playerA.constructedDevelopments.length, buildingsB = playerB.constructedDevelopments.length
    if (buildingsA !== buildingsB) {
      return buildingsB - buildingsA
    }
    return countCharacters(playerB) - countCharacters(playerA)
  }

  canUndo(action: Action<Move, EmpireName>, consecutiveActions: Action<Move, EmpireName>[]) {
    return canUndo(this.state, action, consecutiveActions)
  }

  getView(playerId?: EmpireName | undefined): GameView {
    if (isGameView(this.state)) throw new Error('getView should only be used on server side')
    return {
      ...this.state, deck: this.state.deck.length,
      players: this.state.players.map(player => {
        if (player.empire === playerId) {
          return player
        } else {
          const playerView = {...player, hand: player.hand.length} as PlayerView
          if (player.chosenCard !== undefined) {
            playerView.chosenCard = true
          }
          return playerView
        }
      })
    }
  }

  getMoveView(move: Move, playerId?: EmpireName): MoveView {
    if (isGameView(this.state)) throw new Error('getMoveView should only be used on server side')
    switch (move.type) {
      case MoveType.DealDevelopmentCards:
        return playerId ? {...move, playerCards: this.state.players.find(player => player.empire === playerId)!.hand} : move
      case MoveType.ChooseDevelopmentCard:
        if (playerId !== move.playerId) {
          const {card, ...moveView} = move
          return moveView
        }
        break
      case MoveType.RevealChosenCards:
        return {
          ...move, revealedCards: this.state.players.reduce<{ [key in EmpireName]?: number }>((revealedCards, player) => {
            revealedCards[player.empire] = player.draftArea[player.draftArea.length - 1]
            return revealedCards
          }, {})
        }
      case MoveType.PassCards:
        return {...move, receivedCards: playerId ? this.state.players.find(player => player.empire === playerId)!.hand : undefined}
      case MoveType.DiscardLeftoverCards:
        return {...move, discardedCards: this.state.discard.slice((numberOfCardsToDraft - numberOfCardsDeal2Players) * this.state.players.length)}
    }
    return move
  }

  isEliminated(playerId: EmpireName): boolean {
    return !!getPlayer(this.state, playerId).eliminated
  }

  getConcedeMove(playerId: EmpireName): Move {
    return {type: MoveType.Concede, playerId}
  }

  giveTime(playerId: EmpireName): number {
    switch (this.state.phase) {
      case Phase.Draft:
        if (this.state.round === 1 && getPlayer(this.state, playerId).draftArea.length === 0) {
          return 180
        } else {
          return (numberOfCardsToDraft - getPlayer(this.state, playerId).draftArea.length - 1) * 10
        }
      case Phase.Planning:
        return (this.state.round + 1) * 60
      case Phase.Production:
        return 15
    }
  }
}

export function setupPlayers(options: ItsAWonderfulWorldOptions) {
  const players = options.players
  const empireSide = options.empiresSide
  const empiresLeft = shuffle(Object.values(EmpireName).filter(empire => players.some(player => player.id === empire)))
  return players.map<Player>(player => setupPlayer(player.id || empiresLeft.pop()!, empireSide))
}

function setupPlayer(empire: EmpireName, empireSide?: EmpireSide): Player {
  return {
    empire, empireSide: empireSide || defaultEmpireCardsSide, hand: [], draftArea: [], constructionArea: [], availableResources: [], empireCardResources: [],
    constructedDevelopments: [], ready: false, characters: {[Character.Financier]: 0, [Character.General]: 0}, bonuses: []
  }
}

export function getPlayer(game: GameState, empire: EmpireName): Player
export function getPlayer(game: GameState | GameView, empire: EmpireName): Player | PlayerView
export function getPlayer(game: GameState | GameView, empire: EmpireName): Player | PlayerView {
  return game.players.find(player => player.empire === empire)!
}

export function getPredictableAutomaticMoves(state: GameState | GameView): Move | void {
  for (const player of state.players) {
    for (const construction of player.constructionArea) {
      if (construction.costSpaces.every(space => space !== null)) {
        return {type: MoveType.CompleteConstruction, playerId: player.empire, card: construction.card}
      }
    }
    if (player.empireCardResources.filter(resource => resource !== Resource.Krystallium).length >= 5) {
      return {type: MoveType.TransformIntoKrystallium, playerId: player.empire}
    }
    const bonus = player.bonuses.find(bonus => bonus !== ChooseCharacter)
    if (isResource(bonus)) {
      return {type: MoveType.PlaceResource, playerId: player.empire, resource: bonus}
    } else if (isCharacter(bonus)) {
      return {type: MoveType.ReceiveCharacter, playerId: player.empire, character: bonus}
    }
    for (const resource of [...new Set(player.availableResources)]) {
      if (!player.draftArea.some(card => developmentCards[card].constructionCost[resource])
        && !player.constructionArea.some(construction => getSpacesMissingItem(construction, item => item === resource).length > 0)) {
        // Automatically place resources on the Empire card if there is 0 chance to place it on a development
        return {type: MoveType.PlaceResource, playerId: player.empire, resource}
      }
    }
  }
}

export function getLegalMoves(player: Player, phase: Phase) {
  const moves: Move[] = []
  switch (phase) {
    case Phase.Draft:
      if (player.chosenCard === undefined) {
        player.hand.forEach(card => moves.push({type: MoveType.ChooseDevelopmentCard, playerId: player.empire, card}))
      }
      break
    case Phase.Planning:
      player.draftArea.forEach(card => moves.push({type: MoveType.SlateForConstruction, playerId: player.empire, card}, {
        type: MoveType.Recycle, playerId: player.empire, card
      }))
      if (!player.draftArea.length && !player.availableResources.length && !player.ready) {
        moves.push({type: MoveType.TellYouAreReady, playerId: player.empire})
      }
      break
    case Phase.Production:
      if (!player.bonuses.length && !player.availableResources.length && !player.ready) {
        moves.push({type: MoveType.TellYouAreReady, playerId: player.empire})
      }
      break
  }
  [...new Set(player.availableResources)].forEach(resource => {
    player.constructionArea.forEach(construction => {
      getSpacesMissingItem(construction, item => item === resource)
        .forEach(space => moves.push({type: MoveType.PlaceResource, playerId: player.empire, resource, card: construction.card, space}))
    })
    moves.push({type: MoveType.PlaceResource, playerId: player.empire, resource})
  })
  if (player.bonuses.some(bonus => bonus === ChooseCharacter)) {
    characters.forEach(character => moves.push({type: MoveType.ReceiveCharacter, playerId: player.empire, character}))
  }
  player.constructionArea.forEach(construction => {
    moves.push({type: MoveType.Recycle, playerId: player.empire, card: construction.card})
  })
  if (player.empireCardResources.some(resource => resource === Resource.Krystallium)) {
    player.constructionArea.forEach(construction => {
      getSpacesMissingItem(construction, item => isResource(item))
        .forEach(space => moves.push({type: MoveType.PlaceResource, playerId: player.empire, resource: Resource.Krystallium, card: construction.card, space}))
    })
  }
  characters.forEach(character => {
    if (player.characters[character]) {
      player.constructionArea.forEach(construction => {
        getSpacesMissingItem(construction, item => item === character)
          .forEach(space => moves.push({type: MoveType.PlaceCharacter, playerId: player.empire, character, card: construction.card, space}))
      })
    }
  })
  return moves
}

export function getCost(card: number): (Resource | Character)[] {
  const development = developmentCards[card]
  return Array.of<Resource | Character>(...resources, ...characters)
    .flatMap(item => Array(development.constructionCost[item] || 0).fill(item))
}

export function getRemainingCost(construction: Construction): { item: Resource | Character, space: number }[] {
  const development = developmentCards[construction.card]
  return Array.of<Resource | Character>(...resources, ...characters)
    .flatMap(item => Array(development.constructionCost[item] || 0).fill(item))
    .map((item, index) => ({item, space: index}))
    .filter(item => !construction.costSpaces[item.space])
}

export function getSpacesMissingItem(construction: Construction, predicate: (item: Resource | Character) => boolean) {
  return getRemainingCost(construction).filter(cost => predicate(cost.item)).map(cost => cost.space)
}

export function getNextProductionStep(game: GameState | GameView) {
  switch (game.productionStep) {
    case Resource.Materials:
      return Resource.Energy
    case Resource.Energy:
      return Resource.Science
    case Resource.Science:
      return Resource.Gold
    case Resource.Gold:
      return Resource.Exploration
    default:
      return undefined
  }
}

export function getProduction(player: Player | PlayerView, resource: Resource): number {
  return getBaseProduction(player, resource) + player.constructedDevelopments.reduce((sum, card) => sum + getDevelopmentProduction(player, developmentCards[card], resource), 0)
}

function getBaseProduction(player: Player | PlayerView, resource: Resource): number {
  return Empires[player.empire][player.empireSide].production[resource] || 0
}

function getDevelopmentProduction(player: Player | PlayerView, development: Development, resource: Resource): number {
  if (!development.production) {
    return 0
  } else if (isResource(development.production)) {
    return development.production === resource ? 1 : 0
  } else {
    const production = development.production[resource]
    if (isDevelopmentType(production)) {
      return player.constructedDevelopments.filter(card => developmentCards[card].type === production).length
    } else {
      return production || 0
    }
  }
}

function getCardVictoryPointsMultiplier(item: DevelopmentType | Character, victoryPoints?: number | { [key in DevelopmentType | Character]?: number }): number {
  return victoryPoints && typeof victoryPoints !== 'number' && victoryPoints[item] ? victoryPoints[item]! : 0
}

export function getVictoryPointsBonusMultiplier(player: Player | PlayerView, item: DevelopmentType | Character): number {
  return getCardVictoryPointsMultiplier(item, Empires[player.empire][player.empireSide].victoryPoints) +
    player.constructedDevelopments.map(card => developmentCards[card].victoryPoints)
      .reduce<number>((sum, victoryPoints) => sum + getCardVictoryPointsMultiplier(item, victoryPoints), 0)
}

export function getVictoryPointsMultiplier(player: Player | PlayerView, item: DevelopmentType | Character): number {
  return isDevelopmentType(item) ? getVictoryPointsBonusMultiplier(player, item) : getVictoryPointsBonusMultiplier(player, item) + 1
}

export function getScore(player: Player | PlayerView): number {
  return getFlatVictoryPoints(player)
    + developmentTypes.reduce((sum, developmentType) => sum + getComboVictoryPoints(player, developmentType), 0)
    + characters.reduce((sum, characterType) => sum + getComboVictoryPoints(player, characterType), 0)

}

export function getFlatVictoryPoints(player: Player | PlayerView): number {
  return player.constructedDevelopments.map(card => developmentCards[card].victoryPoints)
    .reduce<number>((sum, victoryPoints) => sum + (typeof victoryPoints == 'number' ? victoryPoints : 0), 0)
}

export function getComboVictoryPoints(player: Player | PlayerView, item: DevelopmentType | Character): number {
  return getItemQuantity(player, item) * getVictoryPointsMultiplier(player, item)
}

export function getItemQuantity(player: Player | PlayerView, item: DevelopmentType | Character): number {
  return isDevelopmentType(item) ? player.constructedDevelopments.filter(card => developmentCards[card].type === item).length : player.characters[item]
}

export function canBuild(player: Player, card: number): boolean {
  const construction = player.constructionArea.find(construction => construction.card === card)
  if (!construction) {
    return false
  }
  return canPay(player, getRemainingCost(construction).map(cost => cost.item))

}

export function canPay(player: Player, cost: (Resource | Character)[]) {
  for (const character of characters) {
    if (player.characters[character] < cost.filter(item => item === character).length) {
      return false
    }
  }
  let krystalliumLeft = player.empireCardResources.filter(resource => resource === Resource.Krystallium).length
  for (const resource of resources) {
    const resourceCost = cost.filter(item => item === resource).length
    const resources = player.availableResources.filter(r => r === resource).length
    if (resources < resourceCost) {
      if (krystalliumLeft + resources < resourceCost) {
        return false
      }
      krystalliumLeft -= resourceCost - resources
    }
  }
  return true
}

export function getMovesToBuild(player: Player, card: number): (PlaceResourceOnConstruction | PlaceCharacter)[] {
  const moves: (PlaceResourceOnConstruction | PlaceCharacter)[] = []
  const construction = player.constructionArea.find(construction => construction.card === card)
    || {card, costSpaces: Array(totalCost(developmentCards[card])).fill(null)}
  const remainingCost = getRemainingCost(construction)
  for (const resource of resources) {
    const resourceCosts = remainingCost.filter(cost => cost.item === resource)
    let resources = player.availableResources.filter(r => r === resource).length
    for (const cost of resourceCosts) {
      if (resources > 0) {
        moves.push({type: MoveType.PlaceResource, playerId: player.empire, resource, card, space: cost.space})
        resources--
      } else {
        moves.push({type: MoveType.PlaceResource, playerId: player.empire, resource: Resource.Krystallium, card, space: cost.space})
      }
    }
  }
  for (const cost of remainingCost) {
    if (isCharacter(cost.item)) {
      moves.push({type: MoveType.PlaceCharacter, playerId: player.empire, character: cost.item, card, space: cost.space})
    }
  }
  return moves
}

export function isPlaceItemOnCard(move: Move | MoveView, card?: number): move is (PlaceResourceOnConstruction | PlaceCharacter) {
  if (card !== undefined) {
    return isPlaceItemOnCard(move) && move.card === card
  } else {
    return isPlaceResourceOnConstruction(move) || isPlaceCharacter(move)
  }
}

export function isActive(game: GameView, playerId: EmpireName) {
  const player = game.players.find(player => player.empire === playerId)!
  switch (game.phase) {
    case Phase.Draft:
      return player.chosenCard === undefined
    case Phase.Planning:
    case Phase.Production:
      return !player.ready
  }
}

export function countCharacters(player: Player | PlayerView) {
  return player.characters.Financier + player.characters.General
}

export function isOver(game: GameState | GameView): boolean {
  return game.round === numberOfRounds && game.phase === Phase.Production && game.productionStep === Resource.Exploration && game.players.every(player => player.ready)
}

export function constructionsThatMayReceiveCubes(player: Player | PlayerView): Construction[] {
  return player.constructionArea.filter(construction => getRemainingCost(construction).some(cost => isResource(cost.item) && player.availableResources.includes(cost.item)))
}

export function placeAvailableCubesMoves(player: Player | PlayerView, construction: Construction): PlaceResource[] {
  const moves: PlaceResource[] = []
  const availableResource = JSON.parse(JSON.stringify(player.availableResources)) as Resource[]
  getRemainingCost(construction).forEach(cost => {
    if (isResource(cost.item)) {
      if (availableResource.some(resource => resource === cost.item)) {
        moves.push({type: MoveType.PlaceResource, playerId: player.empire, resource: cost.item, card: construction.card, space: cost.space})
        availableResource.splice(availableResource.findIndex(resource => resource === cost.item), 1)
      }
    }
  })
  return moves
}

function getHandSize(player: Player | PlayerView) {
  return isPlayerView(player) ? player.hand : player.hand.length
}

export function getPlayerName(empire: EmpireName, t: (name: string) => string): string {
  switch (empire) {
    case EmpireName.AztecEmpire:
      return t('Aztec Empire')
    case EmpireName.FederationOfAsia:
      return t('Federation of Asia')
    case EmpireName.NoramStates:
      return t('Noram States')
    case EmpireName.PanafricanUnion:
      return t('Panafrican Union')
    case EmpireName.RepublicOfEurope:
      return t('Republic of Europe')
  }
}