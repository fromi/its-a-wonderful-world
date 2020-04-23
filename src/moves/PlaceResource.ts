import EmpireName from '../material/empires/EmpireName'
import Resource from '../material/resources/Resource'
import MoveType from './MoveType'

export default interface PlaceResource {
  type: typeof MoveType.PlaceResource
  playerId: EmpireName
  resource: Resource
  card?: number
  space?: number
}

export function placeResource(playerId: EmpireName, resource: Resource, card?: number, space?: number): PlaceResource {
  return isNaN(card) || isNaN(space) ?
    {type: MoveType.PlaceResource, playerId, resource} :
    {type: MoveType.PlaceResource, playerId, resource, card, space}
}