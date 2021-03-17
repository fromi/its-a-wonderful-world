import {GameOptions, OptionsDescription, OptionType} from '@gamepark/rules-api'
import {TFunction} from 'i18next'
import GameState from './GameState'
import EmpireName from './material/EmpireName'
import EmpireSide from './material/EmpireSide'

type ItsAWonderfulWorldGameOptions = {
  empiresSide: EmpireSide,
  corruptionAndAscension: boolean
}

type ItsAWonderfulWorldPlayerOptions = { id: EmpireName }

export type ItsAWonderfulWorldOptions = GameOptions<ItsAWonderfulWorldGameOptions, ItsAWonderfulWorldPlayerOptions>

export function isGameOptions(arg: GameState | ItsAWonderfulWorldOptions): arg is ItsAWonderfulWorldOptions {
  return typeof (arg as GameState).round === 'undefined'
}

export const ItsAWonderfulWorldOptionsDescription: OptionsDescription<ItsAWonderfulWorldGameOptions, ItsAWonderfulWorldPlayerOptions> = {
  empiresSide: {
    type: OptionType.LIST,
    getLabel: (t: TFunction) => t('Empire cards side'),
    values: Object.values(EmpireSide),
    getValueLabel: (side: EmpireSide, t: TFunction) => t('Side {side}', {side})
  },
  corruptionAndAscension: {
    type: OptionType.BOOLEAN,
    getLabel: (t: TFunction) => t('Corruption & Ascension')
  },
  players: {
    id: {
      type: OptionType.LIST,
      getLabel: (t: TFunction) => t('Empire'),
      values: Object.values(EmpireName),
      getValueLabel: (empire: EmpireName, t: TFunction) => {
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
    }
  }
}
