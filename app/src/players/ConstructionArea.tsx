/** @jsxImportSource @emotion/react */
import {css} from '@emotion/react'
import GameView from '@gamepark/its-a-wonderful-world/GameView'
import ItsAWonderfulWorldView from '@gamepark/its-a-wonderful-world/ItsAWonderfulWorldView'
import Character from '@gamepark/its-a-wonderful-world/material/Character'
import Construction from '@gamepark/its-a-wonderful-world/material/Construction'
import {developmentCards} from '@gamepark/its-a-wonderful-world/material/Developments'
import EmpireName from '@gamepark/its-a-wonderful-world/material/EmpireName'
import Resource, {isResource} from '@gamepark/its-a-wonderful-world/material/Resource'
import CompleteConstruction, {isCompleteConstruction} from '@gamepark/its-a-wonderful-world/moves/CompleteConstruction'
import MoveType from '@gamepark/its-a-wonderful-world/moves/MoveType'
import PlaceCharacter from '@gamepark/its-a-wonderful-world/moves/PlaceCharacter'
import {isPlaceResource, PlaceResourceOnConstruction} from '@gamepark/its-a-wonderful-world/moves/PlaceResource'
import Recycle, {isRecycle} from '@gamepark/its-a-wonderful-world/moves/Recycle'
import SlateForConstruction, {isSlateForConstruction} from '@gamepark/its-a-wonderful-world/moves/SlateForConstruction'
import Phase from '@gamepark/its-a-wonderful-world/Phase'
import Player from '@gamepark/its-a-wonderful-world/Player'
import PlayerView from '@gamepark/its-a-wonderful-world/PlayerView'
import {canBuild, getMovesToBuild, getRemainingCost, placeAvailableCubesMoves} from '@gamepark/its-a-wonderful-world/Rules'
import {isPlayer} from '@gamepark/its-a-wonderful-world/typeguards'
import {useAnimation, usePlay, usePlayerId, useUndo} from '@gamepark/react-client'
import {FunctionComponent, useEffect, useRef, useState} from 'react'
import {useDrop} from 'react-dnd'
import {useTranslation} from 'react-i18next'
import DevelopmentFromDraftArea from '../drag-objects/DevelopmentFromDraftArea'
import DragObjectType from '../drag-objects/DragObjectType'
import CharacterToken from '../material/characters/CharacterToken'
import constructionCost from '../material/developments/ConstructionCost'
import {discardPileCardX, discardPileCardY, discardPileMaxSize, discardPileScale} from '../material/developments/DiscardPile'
import FocusedDevelopmentOptions from '../material/developments/FocusedDevelopmentOptions'
import Images from '../material/Images'
import ResourceCube from '../material/resources/ResourceCube'
import {
  cardHeight, cardWidth, constructedCardLeftMargin, constructedCardY, getAreaCardX, getAreaCardY, getAreasStyle, getCardFocusTransform, popupBackgroundStyle
} from '../util/Styles'
import DevelopmentCardUnderConstruction from './DevelopmentCardUnderConstruction'
import {recyclingButton, textButton, textButtonFontStyle, textButtonLeft, textButtonRight} from './DraftArea'

const ConstructionArea: FunctionComponent<{ game: GameView, gameOver: boolean, player: Player | PlayerView }> = ({game, gameOver, player}) => {
  const {t} = useTranslation()
  const playerId = usePlayerId<EmpireName>()
  const [focusedCard, setFocusedCard] = useState<number>()
  const construction = player.constructionArea.find(construction => construction.card === focusedCard)
  const maxSpendableResources = isPlayer(player) && construction ? maxResourcesToPlace(player, construction) : []
  const row = game.phase === Phase.Draft ? 2 : 1
  const fullWidth = game.players.length === 2 && game.phase !== Phase.Draft
  const play = usePlay()
  const [undo, canUndo] = useUndo(ItsAWonderfulWorldView)
  const animation = useAnimation<CompleteConstruction | Recycle | SlateForConstruction>(animation =>
    (isCompleteConstruction(animation.move) || isRecycle(animation.move) || isSlateForConstruction(animation.move)) && animation.move.playerId === player.empire
  )
  const completingConstruction = animation && isCompleteConstruction(animation.move) ? animation.move : undefined
  const recycling = animation && isRecycle(animation.move) ? animation.move : undefined
  const undoingSlateForConstruction = animation && animation.action.cancelled && isSlateForConstruction(animation.move) ? animation.move : undefined
  const constructions = useRef(player.constructionArea)
  if (!undoingSlateForConstruction) {
    constructions.current = player.constructionArea
  }
  const removeIndex = player.constructionArea.findIndex(construction => construction.card === completingConstruction?.card)
  const build = (construction: Construction) => {
    getMovesToBuild(player as Player, construction.card).forEach(move => play(move))
  }
  useEffect(() => {
    if (!animation && !player.constructionArea.some(construction => construction.card === focusedCard)) {
      setFocusedCard(undefined)
    }
  }, [player, focusedCard, animation])
  const [{isValidTarget, isOver}, ref] = useDrop({
    accept: DragObjectType.DEVELOPMENT_FROM_DRAFT_AREA,
    collect: (monitor) => ({
      isValidTarget: monitor.getItemType() === DragObjectType.DEVELOPMENT_FROM_DRAFT_AREA,
      isOver: monitor.isOver()
    }),
    drop: (item: DevelopmentFromDraftArea) => ({type: MoveType.SlateForConstruction, playerId: player.empire, card: item.card})
  })

  function getTransform(card: number, index: number) {
    if (card === completingConstruction?.card) {
      return `translate(${constructedCardLeftMargin * 100 / cardWidth}%, ${constructedCardY(player.constructedDevelopments.length) * 100 / cardHeight}%)`
    } else if (card === recycling?.card) {
      const discardIndex = Math.min(game.discard.length, discardPileMaxSize)
      const x = discardPileCardX(discardIndex) * 100 / cardWidth
      const y = discardPileCardY(discardIndex) * 100 / cardHeight
      return `translate(${x}%, ${y}%) scale(${discardPileScale})`
    } else if (card === undoingSlateForConstruction?.card) {
      const x = getAreaCardX(player.draftArea.indexOf(card)) * 100 / cardWidth
      const y = getAreaCardY(row - 1) * 100 / cardHeight
      return `translate(${x}%, ${y}%)`
    } else {
      if (removeIndex !== -1 && removeIndex < index) {
        index--
      }
      return `translate(${getAreaCardX(index, player.constructionArea.length, fullWidth) * 100 / cardWidth}%, ${getAreaCardY(row) * 100 / cardHeight}%)`
    }
  }

  function placeAvailableCubes(construction: Construction) {
    placeAvailableCubesMoves(player, construction).forEach(move => play(move))
    setFocusedCard(undefined)
  }

  return <>
    {construction && <>
      <div css={popupBackgroundStyle} onClick={() => setFocusedCard(undefined)}/>
      {isPlayer(player) && !gameOver && getSmartPlaceItemMoves(player, construction).map(move =>
        <button key={move.space} css={[itemButtonStyle, placeItemButton, itemButtonPosition(move.space)]} onClick={() => play(move)}>
          {isPlaceResource(move) ?
            <ResourceCube resource={move.resource} css={buttonItemStyle}/> :
            <CharacterToken character={move.character} css={buttonItemStyle}/>
          }
        </button>
      )}
      {isPlayer(player) && !gameOver && construction.costSpaces.map((item, index) => {
        if (!item) return null
        const move: PlaceResourceOnConstruction | PlaceCharacter = isResource(item) ?
          {type: MoveType.PlaceResource, playerId: player.empire, resource: item, card: construction.card, space: index} :
          {type: MoveType.PlaceCharacter, playerId: player.empire, character: item, card: construction.card, space: index}
        if (!canUndo(move)) return null
        return (
          <button key={index} css={[itemButtonStyle, undoPlaceItemButton, itemButtonPosition(index)]}
                  onClick={() => undo(move)}>
            {isResource(item) ? <ResourceCube resource={item} css={buttonItemStyle}/> : <CharacterToken character={item} css={buttonItemStyle}/>}
          </button>
        )
      })}
      {maxSpendableResources.length > 1 &&
      <button css={[itemButtonStyle, placeItemButton, itemButtonPosition(getTotalConstructionCost(construction.card) + 0.5)]}
              onClick={() => placeAvailableCubes(construction)}>
        <span css={getPlaceTextStyle}>{t('Place')} </span>
        {maxSpendableResources.map((resource, index) => <ResourceCube key={index} resource={resource} css={buttonItemStyle}/>)}
      </button>}
      {isPlayer(player) && !gameOver && <>
        {canBuild(player, construction.card) &&
        <button
          css={[textButton, textButtonLeft, getPlaceConstructionButton(getTotalConstructionCost(construction.card) + (maxSpendableResources.length > 1 ? 2 : 1))]}
          onClick={() => build(construction)}>{t('Build')}</button>
        }
        <button css={[textButton, textButtonRight, recyclingButton(developmentCards[construction.card].recyclingBonus)]}
                onClick={() => play({type: MoveType.Recycle, playerId: player.empire, card: construction.card})}>
          {t('Recycle')}
        </button>
      </>}
      <FocusedDevelopmentOptions development={developmentCards[construction.card]} onClose={() => setFocusedCard(undefined)}/>
    </>}
    <div ref={ref} css={getConstructionAreaStyle(row, fullWidth, isValidTarget, isOver)}>
      {!player.constructionArea.length && <span css={constructionAreaText}>{t('Construction area')}</span>}
      {isValidTarget && <span css={constructAreaText}>&rarr; {t('Slate for construction')}</span>}
    </div>
    {constructions.current.map((construction, index) => {
        return <DevelopmentCardUnderConstruction key={construction.card} game={game} gameOver={gameOver} player={player} construction={construction}
                                                 animation={{properties: ['transform', 'z-index'], seconds: animation?.duration ?? 0.2}}
                                                 postTransform={getTransform(construction.card, index)}
                                                 setFocus={() => setFocusedCard(construction.card)}
                                                 canRecycle={player.empire === playerId && focusedCard !== construction.card && row !== 2}
                                                 focused={focusedCard === construction.card}
                                                 css={[focusedCard === construction.card && getCardFocusTransform,
                                                   animation && animation.move.card && css`z-index: 10`]}/>
      }
    )}
  </>
}

function getSmartPlaceItemMoves(player: Player, construction: Construction): (PlaceResourceOnConstruction | PlaceCharacter)[] {
  const moves: (PlaceResourceOnConstruction | PlaceCharacter)[] = []
  const availableResource = JSON.parse(JSON.stringify(player.availableResources)) as Resource[]
  const krystalliumAvailable = player.empireCardResources.filter(resource => resource === Resource.Krystallium).length
  const availableKrystalliumPerResource: Record<Resource, number> = {
    [Resource.Materials]: krystalliumAvailable,
    [Resource.Energy]: krystalliumAvailable,
    [Resource.Science]: krystalliumAvailable,
    [Resource.Gold]: krystalliumAvailable,
    [Resource.Exploration]: krystalliumAvailable,
    [Resource.Krystallium]: krystalliumAvailable
  }
  const availableCharacters: Record<Character, number> = {
    [Character.Financier]: player.characters.Financier,
    [Character.General]: player.characters.General
  }
  getRemainingCost(construction).forEach(cost => {
    if (isResource(cost.item)) {
      if (availableResource.some(resource => resource === cost.item)) {
        moves.push({type: MoveType.PlaceResource, playerId: player.empire, resource: cost.item, card: construction.card, space: cost.space})
        availableResource.splice(availableResource.findIndex(resource => resource === cost.item), 1)
      } else if (availableKrystalliumPerResource[cost.item] > 0) {
        moves.push({type: MoveType.PlaceResource, playerId: player.empire, resource: Resource.Krystallium, card: construction.card, space: cost.space})
        availableKrystalliumPerResource[cost.item]--
      }
    } else {
      if (availableCharacters[cost.item] > 0) {
        moves.push({type: MoveType.PlaceCharacter, playerId: player.empire, character: cost.item, card: construction.card, space: cost.space})
        availableCharacters[cost.item]--
      }
    }
  })
  return moves
}

const getTotalConstructionCost = (card: number) => Object.values(constructionCost(developmentCards[card].constructionCost)).reduce((value, sum) => sum + value)

export const maxResourcesToPlace = (player: Player, construction: Construction) => {
  const resources: Resource[] = []
  const availableResource = JSON.parse(JSON.stringify(player.availableResources)) as Resource[]
  getRemainingCost(construction).forEach(cost => {
    if (isResource(cost.item) && availableResource.some(resource => resource === cost.item)) {
      resources.push(...availableResource.splice(availableResource.findIndex(resource => resource === cost.item), 1))
    }
  })
  return resources
}

const getConstructionAreaStyle = (row: number, fullWidth: boolean, isValidTarget: boolean, isOver: boolean) => css`
  background-color: rgba(247, 166, 0, ${isValidTarget ? isOver ? 0.5 : 0.3 : 0.1});
  border-color: #f7a600;
  box-shadow: 0 0 0.7em #f7a600;
  ${getAreasStyle(row, fullWidth, isValidTarget)};
`

const constructionAreaText = css`
  position: absolute;
  width: 100%;
  margin: 0;
  padding: 0 0.25em;
  top: 50%;
  transform: translateY(-50%);
  text-align: center;
  font-size: 4em;
  color: #f7a600;
`

const constructAreaText = css`
  position: absolute;
  width: 100%;
  margin: 0;
  padding: 0 0.2em;
  top: 50%;
  transform: translateY(-50%);
  text-align: center;
  color: antiquewhite;
  font-size: 6em;
  text-shadow: 0 0 0.2em #333;
`

const getPlaceConstructionButton = (index: number) => css`
  top: ${index * 6.5 + 16.5}%;
  right: ${51 + cardWidth * 1.5}%;

  &:before {
    background-image: url(${Images.titleOrange});
  }
`

const buttonItemStyle = css`
  display: inline;
  height: 1.8em;
`

const getPlaceTextStyle = css`
  margin: 0 0.3em;
`

const itemButtonStyle = css`
  position: absolute;
  z-index: 100;
  right: ${51 + cardWidth * 1.5}%;
  display: inline-flex;
  background-color: transparent;
  border: 0;
  padding: 0.5%;
  margin-right: 0.5em;
  align-items: center;
  filter: drop-shadow(0.1em 0.1em 0.5em black);
  ${textButtonFontStyle};

  &:hover, &:focus {
    outline: 0;
    transform: translateY(1px) scale(1.1);
    cursor: pointer;
    z-index: 101;
  }

  &:active {
    transform: translateY(1px);
  }
`

const placeItemButton = css`
  &:after {
    background-image: url(${Images.buttonArrow});
    width: 1em;
    height: 1em;
    content: '';
    right: -1em;
    position: absolute;
    background-size: cover;
    background-repeat: no-repeat;
  }
`

const undoPlaceItemButton = css`
  &:before {
    background-image: url(${Images.buttonArrow});
    width: 1em;
    height: 1em;
    content: '';
    left: -1em;
    position: absolute;
    background-size: cover;
    background-repeat: no-repeat;
    transform: scaleX(-1);
  }
`

const itemButtonPosition = (index: number) => css`
  top: ${index * 6.4 + 16.5}%;
`

export default ConstructionArea