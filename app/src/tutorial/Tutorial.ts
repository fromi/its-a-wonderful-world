import GameState from '@gamepark/its-a-wonderful-world/GameState'
import Character from '@gamepark/its-a-wonderful-world/material/Character'
import {
  AirborneLaboratory, ArkOfTheCovenant, CenterOfTheEarth, CityOfAgartha, developmentCards, FinancialCenter, HarborZone, HumanCloning, IndustrialComplex,
  Juggernaut, LunarBase, MilitaryBase, OffshoreOilRig, PropagandaCenter, RecyclingPlant, ResearchCenter, SecretSociety, TransportationNetwork,
  UniversalExposition, WindTurbines, WorldCongress, Zeppelin
} from '@gamepark/its-a-wonderful-world/material/Developments'
import EmpireName from '@gamepark/its-a-wonderful-world/material/EmpireName'
import EmpireSide from '@gamepark/its-a-wonderful-world/material/EmpireSide'
import Resource from '@gamepark/its-a-wonderful-world/material/Resource'
import Move from '@gamepark/its-a-wonderful-world/moves/Move'
import MoveType from '@gamepark/its-a-wonderful-world/moves/MoveType'
import Phase from '@gamepark/its-a-wonderful-world/Phase'
import {setupPlayers} from '@gamepark/its-a-wonderful-world/Rules'
import shuffle from '@gamepark/its-a-wonderful-world/shuffle'
import {Tutorial} from '@gamepark/react-client'

const harborZone = developmentCards.findIndex(development => development === HarborZone)
const centerOfEarth = developmentCards.findIndex(development => development === CenterOfTheEarth)
const militaryBase = developmentCards.findIndex(development => development === MilitaryBase)
const humanCloning = developmentCards.findIndex(development => development === HumanCloning)
const propagandaCenter = developmentCards.findIndex(development => development === PropagandaCenter)
const cityOfAgartha = developmentCards.findIndex(development => development === CityOfAgartha)
const arkOfTheCovenant = developmentCards.findIndex(development => development === ArkOfTheCovenant)
const industrialComplex = developmentCards.findIndex(development => development === IndustrialComplex)
const recyclingPlant = developmentCards.findIndex(development => development === RecyclingPlant)
const lunarBase = developmentCards.findIndex(development => development === LunarBase)
const secretSociety = developmentCards.findIndex(development => development === SecretSociety)
const transportationNetwork = developmentCards.findIndex(development => development === TransportationNetwork)
const windTurbine = developmentCards.findIndex(development => development === WindTurbines)
const researchCenter = developmentCards.findIndex(development => development === ResearchCenter)
const offshoreOilRig = developmentCards.findIndex(development => development === OffshoreOilRig)
const universalExposition = developmentCards.findIndex(development => development === UniversalExposition)
const zeppelin = developmentCards.findIndex(development => development === Zeppelin)
const airborneLaboratory = developmentCards.findIndex(development => development === AirborneLaboratory)
const juggernaut = developmentCards.findIndex(development => development === Juggernaut)
const worldCongress = developmentCards.findIndex(development => development === WorldCongress)
const financialCenter = developmentCards.findIndex(development => development === FinancialCenter)


const initialCards = [
  // Tutorial Active Player cards
  secretSociety, zeppelin, financialCenter, harborZone, offshoreOilRig, militaryBase, arkOfTheCovenant,
  // Tutorial Second Player cards
  centerOfEarth, transportationNetwork, propagandaCenter, worldCongress, universalExposition, recyclingPlant, airborneLaboratory,
  // Tutorial Third Player cards
  windTurbine, humanCloning, industrialComplex, lunarBase, researchCenter, juggernaut, cityOfAgartha
]

const setup: GameState = {
  players: setupPlayers({players: [{id: EmpireName.NoramStates}, {id: EmpireName.RepublicOfEurope}, {id: EmpireName.FederationOfAsia}], empiresSide: EmpireSide.A, corruptionAndAscension: false}),
  deck: [...initialCards, ...shuffle(Array.from(developmentCards.keys()).filter(card => !initialCards.includes(card)))],
  discard: [],
  round: 1,
  phase: Phase.Draft,
  tutorial: true
}

const ItsAWonderfulTutorial: Tutorial<GameState, Move, EmpireName> = {
  setupTutorial: () => [setup, [EmpireName.NoramStates, EmpireName.RepublicOfEurope, EmpireName.FederationOfAsia]],
  expectedMoves: () => [
    // Automatic Tutorial Draft Phase
    {type: MoveType.ChooseDevelopmentCard, playerId: EmpireName.RepublicOfEurope, card: centerOfEarth},
    {type: MoveType.ChooseDevelopmentCard, playerId: EmpireName.FederationOfAsia, card: lunarBase},
    {type: MoveType.ChooseDevelopmentCard, playerId: EmpireName.NoramStates, card: secretSociety},
    {type: MoveType.ChooseDevelopmentCard, playerId: EmpireName.RepublicOfEurope, card: militaryBase},
    {type: MoveType.ChooseDevelopmentCard, playerId: EmpireName.FederationOfAsia, card: worldCongress},
    {type: MoveType.ChooseDevelopmentCard, playerId: EmpireName.NoramStates, card: industrialComplex},
    {type: MoveType.ChooseDevelopmentCard, playerId: EmpireName.RepublicOfEurope, card: cityOfAgartha},
    {type: MoveType.ChooseDevelopmentCard, playerId: EmpireName.FederationOfAsia, card: arkOfTheCovenant},
    {type: MoveType.ChooseDevelopmentCard, playerId: EmpireName.NoramStates, card: propagandaCenter},
    {type: MoveType.ChooseDevelopmentCard, playerId: EmpireName.RepublicOfEurope, card: transportationNetwork},
    {type: MoveType.ChooseDevelopmentCard, playerId: EmpireName.FederationOfAsia, card: juggernaut},
    {type: MoveType.ChooseDevelopmentCard, playerId: EmpireName.NoramStates, card: harborZone},
    {type: MoveType.ChooseDevelopmentCard, playerId: EmpireName.RepublicOfEurope, card: financialCenter},
    {type: MoveType.ChooseDevelopmentCard, playerId: EmpireName.FederationOfAsia, card: recyclingPlant},
    {type: MoveType.ChooseDevelopmentCard, playerId: EmpireName.NoramStates, card: windTurbine},
    {type: MoveType.ChooseDevelopmentCard, playerId: EmpireName.RepublicOfEurope, card: humanCloning},
    {type: MoveType.ChooseDevelopmentCard, playerId: EmpireName.FederationOfAsia, card: offshoreOilRig},
    {type: MoveType.ChooseDevelopmentCard, playerId: EmpireName.NoramStates, card: universalExposition},

    // Second Player Planning Phase
    {type: MoveType.SlateForConstruction, playerId: EmpireName.RepublicOfEurope, card: militaryBase},
    {type: MoveType.SlateForConstruction, playerId: EmpireName.RepublicOfEurope, card: airborneLaboratory},
    {type: MoveType.SlateForConstruction, playerId: EmpireName.RepublicOfEurope, card: cityOfAgartha},
    {type: MoveType.SlateForConstruction, playerId: EmpireName.RepublicOfEurope, card: centerOfEarth},
    {type: MoveType.SlateForConstruction, playerId: EmpireName.RepublicOfEurope, card: humanCloning},
    {type: MoveType.Recycle, playerId: EmpireName.RepublicOfEurope, card: transportationNetwork},
    {type: MoveType.Recycle, playerId: EmpireName.RepublicOfEurope, card: financialCenter},
    {type: MoveType.PlaceResource, playerId: EmpireName.RepublicOfEurope, resource: Resource.Materials, card: militaryBase, space: 0},
    {type: MoveType.PlaceResource, playerId: EmpireName.RepublicOfEurope, resource: Resource.Gold, card: humanCloning, space: 2},
    {type: MoveType.TellYouAreReady, playerId: EmpireName.RepublicOfEurope},

    // Third Player Planning Phase
    {type: MoveType.SlateForConstruction, playerId: EmpireName.FederationOfAsia, card: worldCongress},
    {type: MoveType.SlateForConstruction, playerId: EmpireName.FederationOfAsia, card: lunarBase},
    {type: MoveType.SlateForConstruction, playerId: EmpireName.FederationOfAsia, card: offshoreOilRig},
    {type: MoveType.Recycle, playerId: EmpireName.FederationOfAsia, card: arkOfTheCovenant},
    {type: MoveType.Recycle, playerId: EmpireName.FederationOfAsia, card: juggernaut},
    {type: MoveType.Recycle, playerId: EmpireName.FederationOfAsia, card: recyclingPlant},
    {type: MoveType.Recycle, playerId: EmpireName.FederationOfAsia, card: researchCenter},
    {type: MoveType.PlaceResource, playerId: EmpireName.FederationOfAsia, resource: Resource.Materials, card: offshoreOilRig, space: 0},
    {type: MoveType.PlaceResource, playerId: EmpireName.FederationOfAsia, resource: Resource.Materials, card: offshoreOilRig, space: 1},
    {type: MoveType.PlaceResource, playerId: EmpireName.FederationOfAsia, resource: Resource.Exploration, card: offshoreOilRig, space: 3},
    {type: MoveType.PlaceResource, playerId: EmpireName.FederationOfAsia, resource: Resource.Science, card: lunarBase, space: 2},
    {type: MoveType.TellYouAreReady, playerId: EmpireName.FederationOfAsia},

    // Active Player Planning Phase
    {type: MoveType.SlateForConstruction, playerId: EmpireName.NoramStates, card: industrialComplex},
    {type: MoveType.SlateForConstruction, playerId: EmpireName.NoramStates, card: propagandaCenter},
    {type: MoveType.SlateForConstruction, playerId: EmpireName.NoramStates, card: harborZone},
    {type: MoveType.SlateForConstruction, playerId: EmpireName.NoramStates, card: secretSociety},
    {type: MoveType.Recycle, playerId: EmpireName.NoramStates, card: universalExposition},
    {type: MoveType.PlaceResource, playerId: EmpireName.NoramStates, resource: Resource.Gold, card: propagandaCenter, space: 0},
    {type: MoveType.Recycle, playerId: EmpireName.NoramStates, card: windTurbine},
    {type: MoveType.PlaceResource, playerId: EmpireName.NoramStates, resource: Resource.Energy, card: industrialComplex, space: 3},
    {type: MoveType.Recycle, playerId: EmpireName.NoramStates, card: zeppelin},
    {type: MoveType.TellYouAreReady, playerId: EmpireName.NoramStates},

    // Material production
    {type: MoveType.PlaceResource, playerId: EmpireName.RepublicOfEurope, resource: Resource.Materials, card: militaryBase, space: 1},
    {type: MoveType.PlaceResource, playerId: EmpireName.RepublicOfEurope, resource: Resource.Materials, card: militaryBase, space: 2},
    {type: MoveType.TellYouAreReady, playerId: EmpireName.RepublicOfEurope},
    {type: MoveType.PlaceResource, playerId: EmpireName.FederationOfAsia, resource: Resource.Materials, card: offshoreOilRig, space: 2},
    {type: MoveType.TellYouAreReady, playerId: EmpireName.FederationOfAsia},
    ...Array(3).fill([
      {type: MoveType.PlaceResource, playerId: EmpireName.NoramStates, resource: Resource.Materials, card: industrialComplex, space: 0},
      {type: MoveType.PlaceResource, playerId: EmpireName.NoramStates, resource: Resource.Materials, card: industrialComplex, space: 1},
      {type: MoveType.PlaceResource, playerId: EmpireName.NoramStates, resource: Resource.Materials, card: industrialComplex, space: 2}
    ]),
    {type: MoveType.TellYouAreReady, playerId: EmpireName.NoramStates},

    // Energy production
    {type: MoveType.PlaceResource, playerId: EmpireName.RepublicOfEurope, resource: Resource.Energy, card: militaryBase, space: 3},
    {type: MoveType.TellYouAreReady, playerId: EmpireName.RepublicOfEurope},
    {type: MoveType.PlaceResource, playerId: EmpireName.FederationOfAsia, resource: Resource.Energy, card: lunarBase, space: 0},
    {type: MoveType.TellYouAreReady, playerId: EmpireName.FederationOfAsia},
    {type: MoveType.TellYouAreReady, playerId: EmpireName.NoramStates},

    // Science production
    {type: MoveType.PlaceResource, playerId: EmpireName.RepublicOfEurope, resource: Resource.Science, card: humanCloning, space: 0},
    {type: MoveType.PlaceResource, playerId: EmpireName.RepublicOfEurope, resource: Resource.Science, card: humanCloning, space: 1},
    {type: MoveType.ReceiveCharacter, playerId: EmpireName.RepublicOfEurope, character: Character.General},
    {type: MoveType.TellYouAreReady, playerId: EmpireName.RepublicOfEurope},
    {type: MoveType.TellYouAreReady, playerId: EmpireName.FederationOfAsia},
    {type: MoveType.TellYouAreReady, playerId: EmpireName.NoramStates},

    // Gold production
    {type: MoveType.TellYouAreReady, playerId: EmpireName.RepublicOfEurope},
    {type: MoveType.PlaceResource, playerId: EmpireName.FederationOfAsia, resource: Resource.Gold, card: lunarBase, space: 4},
    {type: MoveType.PlaceResource, playerId: EmpireName.FederationOfAsia, resource: Resource.Gold, card: lunarBase, space: 5},
    {type: MoveType.PlaceResource, playerId: EmpireName.FederationOfAsia, resource: Resource.Gold, card: worldCongress, space: 0},
    {type: MoveType.TellYouAreReady, playerId: EmpireName.FederationOfAsia},
    ...Array(2).fill([
      {type: MoveType.PlaceResource, playerId: EmpireName.NoramStates, resource: Resource.Gold, card: propagandaCenter, space: 1},
      {type: MoveType.PlaceResource, playerId: EmpireName.NoramStates, resource: Resource.Gold, card: propagandaCenter, space: 2}
    ]),
    {type: MoveType.TellYouAreReady, playerId: EmpireName.NoramStates},

    // Exploration production
    {type: MoveType.TellYouAreReady, playerId: EmpireName.RepublicOfEurope},
    {type: MoveType.TellYouAreReady, playerId: EmpireName.FederationOfAsia},
    {type: MoveType.TellYouAreReady, playerId: EmpireName.NoramStates}
  ]
}

export default ItsAWonderfulTutorial