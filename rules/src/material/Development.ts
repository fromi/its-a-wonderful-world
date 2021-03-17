import Character, {isCharacter} from './Character'
import DevelopmentType from './DevelopmentType'
import Resource from './Resource'

type Development = {
  type: DevelopmentType
  constructionCost: { [key in Resource | Character]?: number }
  constructionBonus?: ConstructionBonus | Partial<Record<ConstructionBonus, number>>
  production?: Resource | { [key in Resource]?: number | DevelopmentType }
  victoryPoints?: number | { [key in DevelopmentType | Character]?: number }
  recyclingBonus: Resource
  numberOfCopies?: number
}

export default Development

export type ConstructionBonus = Character | Resource.Krystallium

export function isConstructionBonus(item: any): item is ConstructionBonus {
  return isCharacter(item) || item === Resource.Krystallium
}

export function totalCost(development: Development) {
  return Object.values(development.constructionCost).reduce<number>((sum, cost) => cost ? sum + cost : sum, 0)
}