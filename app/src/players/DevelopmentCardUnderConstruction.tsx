/** @jsxImportSource @emotion/react */
import {css} from '@emotion/react'
import GameView from '@gamepark/its-a-wonderful-world/GameView'
import ItsAWonderfulWorldView from '@gamepark/its-a-wonderful-world/ItsAWonderfulWorldView'
import {isCharacter} from '@gamepark/its-a-wonderful-world/material/Character'
import Construction from '@gamepark/its-a-wonderful-world/material/Construction'
import {developmentCards} from '@gamepark/its-a-wonderful-world/material/Developments'
import EmpireName from '@gamepark/its-a-wonderful-world/material/EmpireName'
import Resource, {isResource} from '@gamepark/its-a-wonderful-world/material/Resource'
import CompleteConstruction, {isCompleteConstruction} from '@gamepark/its-a-wonderful-world/moves/CompleteConstruction'
import {MoveView} from '@gamepark/its-a-wonderful-world/moves/Move'
import MoveType from '@gamepark/its-a-wonderful-world/moves/MoveType'
import PlaceCharacter, {isPlaceCharacter} from '@gamepark/its-a-wonderful-world/moves/PlaceCharacter'
import PlaceResource, {isPlaceResourceOnConstruction, PlaceResourceOnConstruction} from '@gamepark/its-a-wonderful-world/moves/PlaceResource'
import Recycle, {isRecycle} from '@gamepark/its-a-wonderful-world/moves/Recycle'
import SlateForConstruction from '@gamepark/its-a-wonderful-world/moves/SlateForConstruction'
import Player from '@gamepark/its-a-wonderful-world/Player'
import PlayerView from '@gamepark/its-a-wonderful-world/PlayerView'
import {getLegalMoves, getMovesToBuild, getRemainingCost, isPlaceItemOnCard, placeAvailableCubesMoves} from '@gamepark/its-a-wonderful-world/Rules'
import {isPlayer} from '@gamepark/its-a-wonderful-world/typeguards'
import {useActions, useAnimations, usePlay, usePlayerId, useUndo} from '@gamepark/react-client'
import {Draggable} from '@gamepark/react-components'
import {DragAroundProps} from '@gamepark/react-components/dist/Draggable/DragAround'
import {FunctionComponent} from 'react'
import {useDrop} from 'react-dnd'
import CharacterTokenFromEmpire from '../drag-objects/CharacterTokenFromEmpire'
import {developmentFromConstructionArea} from '../drag-objects/DevelopmentFromConstructionArea'
import DragObjectType from '../drag-objects/DragObjectType'
import KrystalliumFromEmpire from '../drag-objects/KrystalliumCube'
import ResourceFromBoard from '../drag-objects/ResourceFromBoard'
import CharacterToken from '../material/characters/CharacterToken'
import DevelopmentCard from '../material/developments/DevelopmentCard'
import ResourceCube, {cubeHeight, cubeWidth} from '../material/resources/ResourceCube'
import {areaCardStyle, cardHeight, cardStyle, cardWidth, glow} from '../util/Styles'
import {useLongPress} from '../util/useLongPress'

type Props = {
  game: GameView
  gameOver: boolean
  player: Player | PlayerView
  construction: Construction
  canRecycle: boolean
  focused: boolean
  setFocus: () => void
} & Omit<DragAroundProps, 'dragging'>

const DevelopmentCardUnderConstruction: FunctionComponent<Props> = ({game, gameOver, player, construction, canRecycle, focused, setFocus, ...props}) => {
  const playerId = usePlayerId<EmpireName>()
  const play = usePlay()
  const legalMoves = isPlayer(player) ? getLegalMoves(player, game.phase) : []
  const [undo, canUndo] = useUndo(ItsAWonderfulWorldView)
  const longPress = useLongPress({
    onClick: () => setFocus(),
    onLongPress: () => {
      if (player.empire !== playerId) {
        return
      }
      placeAvailableCubesMoves(player, construction).forEach(move => play(move))
      if (window.navigator.vibrate) {
        window.navigator.vibrate(200)
      }
    }
  })
  const actions = useActions<MoveView, EmpireName>()
  const placeResourceMoves: PlaceResourceOnConstruction[] = legalMoves.filter(isPlaceResourceOnConstruction)
    .filter(move => move.card === construction.card)
  const placeCharacterMoves: PlaceCharacter[] = legalMoves.filter(isPlaceCharacter).filter(move => move.card === construction.card)
  const [{canDrop, isOver}, ref] = useDrop({
    accept: [DragObjectType.RESOURCE_FROM_BOARD, DragObjectType.KRYSTALLIUM_FROM_EMPIRE, DragObjectType.CHARACTER_TOKEN_FROM_EMPIRE],
    canDrop: (item: ResourceFromBoard | KrystalliumFromEmpire | CharacterTokenFromEmpire) => {
      switch (item.type) {
        case DragObjectType.RESOURCE_FROM_BOARD:
          return placeResourceMoves.some(move => move.resource === item.resource)
        case DragObjectType.KRYSTALLIUM_FROM_EMPIRE:
          return placeResourceMoves.length > 0
        case DragObjectType.CHARACTER_TOKEN_FROM_EMPIRE:
          return placeCharacterMoves.some(move => move.character === item.character)
      }
    },
    collect: monitor => ({
      canDrop: monitor.canDrop(),
      isOver: monitor.isOver()
    }),
    drop: (item: ResourceFromBoard | KrystalliumFromEmpire | CharacterTokenFromEmpire) => {
      switch (item.type) {
        case DragObjectType.RESOURCE_FROM_BOARD:
          play({
            type: MoveType.PlaceResource, playerId: playerId!, resource: item.resource, card: construction.card,
            space: Math.min(...placeResourceMoves.filter(move => move.resource === item.resource).map(move => move.space))
          })
          break
        case DragObjectType.KRYSTALLIUM_FROM_EMPIRE:
          const remainingCost = getRemainingCost(construction)
          const krystalliumCost = remainingCost.find(cost => cost.item === Resource.Krystallium)
          if (krystalliumCost) {
            play({type: MoveType.PlaceResource, playerId: playerId!, resource: Resource.Krystallium, card: construction.card, space: krystalliumCost.space})
          } else {
            const remainingResourcesRequired = new Set(remainingCost.filter(cost => isResource(cost.item)).map(cost => cost.item))
            if (remainingResourcesRequired.size === 1) {
              play({
                type: MoveType.PlaceResource, playerId: playerId!, resource: Resource.Krystallium, card: construction.card,
                space: Math.min(...placeResourceMoves.map(move => move.space))
              })
            } else {
              setFocus()
            }
          }
          break
        case DragObjectType.CHARACTER_TOKEN_FROM_EMPIRE:
          play({
            type: MoveType.PlaceCharacter, playerId: playerId!, character: item.character, card: construction.card,
            space: Math.min(...placeCharacterMoves.map(move => move.space))
          })
          break
      }
    }
  })
  const animations = useAnimations<PlaceResourceOnConstruction>(animation => animation.move.type === MoveType.PlaceResource && animation.move.playerId === player.empire
    && isPlaceResourceOnConstruction(animation.move) && animation.move.card === construction.card)

  const drop = (move: Recycle | CompleteConstruction | SlateForConstruction) => {
    if (isRecycle(move)) {
      construction.costSpaces.forEach((item, index) => {
        if (!item) return
        const move: PlaceResource | PlaceCharacter = isResource(item) ?
          {type: MoveType.PlaceResource, playerId: player.empire, resource: item, card: construction.card, space: index} :
          {type: MoveType.PlaceCharacter, playerId: player.empire, character: item, card: construction.card, space: index}
        if (canUndo(move)) {
          undo(move)
        }
      })
      const slateForConstructionMove: SlateForConstruction = {type: MoveType.SlateForConstruction, playerId: player.empire, card: construction.card}
      if (canUndo(slateForConstructionMove)) {
        undo(slateForConstructionMove)
      }
      play(move)
    } else if (isCompleteConstruction(move)) {
      getMovesToBuild(player as Player, construction.card).forEach(move => play(move))
    } else {
      // First undo the item placed on the card if any
      const placeItemsOnCard = actions!.filter(action => action.playerId === player.empire && isPlaceItemOnCard(action.move, construction.card))
      placeItemsOnCard.map(action => action.move).reverse().forEach(move => undo(move))
      undo(move)
    }
  }

  return (
    <Draggable item={developmentFromConstructionArea(construction.card)} disabled={gameOver || !canRecycle || canDrop || focused}
               css={[cardStyle, areaCardStyle]} drop={drop} {...longPress} {...props}>
      <div ref={ref} css={getInnerStyle(canDrop, isOver)}>
        <DevelopmentCard development={developmentCards[construction.card]} css={css`height: 100%;`}/>
        {[...construction.costSpaces].reverse().map((item, index) => {
          const space = construction.costSpaces.length - index
          if (isResource(item)) {
            return <ResourceCube key={index} resource={item} css={getResourceStyle(space - 1)}/>
          } else if (isCharacter(item)) {
            return <CharacterToken key={index} character={item} css={getCharacterTokenStyle(space - 1)}/>
          } else if (animations.find(animation => animation.move.space === space)) {
            return <ResourceCube key={index} resource={item} css={[getResourceStyle(space - 1), css`opacity: 0;`]}/>
          } else {
            return null
          }
        })}
      </div>
    </Draggable>
  )
}

const getInnerStyle = (canDrop: boolean, isOver: boolean) => css`
  border-radius: 5%;
  width: 100%;
  height: 100%;
  ${canDrop && canDropStyle};
  ${canDrop && isOver && overStyle};
`

const canDropStyle = css`
  transition: transform 0.2s ease-in-out !important;
  animation: ${glow('#f7a600')} 1s ease-in-out infinite alternate;
  transform: scale(1.05);
`

const overStyle = css`
  &:before {
    content: '';
    position: absolute;
    width: 100%;
    height: 100%;
    z-index: 1;
    background-color: rgba(247, 166, 0, 0.3);
  }
`

export const costSpaceDeltaX = 0.22
export const costSpaceDeltaY = (index: number) => index * 2.12 + 0.4

const getResourceStyle = (index: number) => css`
  position: absolute;
  width: ${cubeWidth * 100 / cardWidth};
  height: ${cubeHeight * 100 / cardHeight}%;
  left: ${costSpaceDeltaX * 100 / cardWidth}%;
  top: ${costSpaceDeltaY(index) * 100 / cardHeight}%;
`

const getCharacterTokenStyle = (index: number) => css`
  position: absolute;
  height: 10%;
  left: 2.5%;
  top: ${index * 9 + 3}%;
`

export default DevelopmentCardUnderConstruction