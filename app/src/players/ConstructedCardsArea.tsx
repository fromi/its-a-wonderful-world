/** @jsxImportSource @emotion/react */
import {css} from '@emotion/react'
import {developmentCards} from '@gamepark/its-a-wonderful-world/material/Developments'
import MoveType from '@gamepark/its-a-wonderful-world/moves/MoveType'
import Player from '@gamepark/its-a-wonderful-world/Player'
import PlayerView from '@gamepark/its-a-wonderful-world/PlayerView'
import {canBuild, canPay, getCost} from '@gamepark/its-a-wonderful-world/Rules'
import {isPlayer} from '@gamepark/its-a-wonderful-world/typeguards'
import {FunctionComponent, useState} from 'react'
import {useDrop} from 'react-dnd'
import {useTranslation} from 'react-i18next'
import DevelopmentFromConstructionArea from '../drag-objects/DevelopmentFromConstructionArea'
import DevelopmentFromDraftArea from '../drag-objects/DevelopmentFromDraftArea'
import DragObjectType from '../drag-objects/DragObjectType'
import DevelopmentCard from '../material/developments/DevelopmentCard'
import DevelopmentCardsCatalogs from '../material/developments/DevelopmentCardsCatalog'
import {
  cardHeight, cardStyle, cardWidth, constructedCardBottomMargin, constructedCardLeftMargin, constructedCardY, empireCardLeftMargin, empireCardWidth,
  headerHeight, topMargin
} from '../util/Styles'

const ConstructedCardsArea: FunctionComponent<{ player: Player | PlayerView }> = ({player}) => {
  const {t} = useTranslation()
  const [focusedCardIndex, setFocusedCardIndex] = useState<number>()
  const canDrop = (item: DevelopmentFromConstructionArea | DevelopmentFromDraftArea) =>
    isPlayer(player) && (item.type === DragObjectType.DEVELOPMENT_FROM_CONSTRUCTION_AREA ? canBuild(player, item.card) : canPay(player, getCost(item.card)))
  const [{dragging, isValidTarget, isOver}, ref] = useDrop({
    accept: [DragObjectType.DEVELOPMENT_FROM_CONSTRUCTION_AREA, DragObjectType.DEVELOPMENT_FROM_DRAFT_AREA],
    canDrop,
    collect: (monitor) => ({
      dragging: monitor.getItemType() === DragObjectType.DEVELOPMENT_FROM_CONSTRUCTION_AREA || monitor.getItemType() === DragObjectType.DEVELOPMENT_FROM_DRAFT_AREA,
      isValidTarget: (monitor.getItemType() === DragObjectType.DEVELOPMENT_FROM_CONSTRUCTION_AREA || monitor.getItemType() === DragObjectType.DEVELOPMENT_FROM_DRAFT_AREA)
        && canDrop(monitor.getItem()),
      isOver: monitor.isOver()
    }),
    drop: (item: DevelopmentFromConstructionArea | DevelopmentFromDraftArea) => ({
      type: MoveType.CompleteConstruction, playerId: player.empire, card: item.card
    })
  })

  return (
    <>
      {typeof focusedCardIndex === 'number' &&
      <DevelopmentCardsCatalogs initialIndex={focusedCardIndex} onClose={() => setFocusedCardIndex(undefined)}
                                developments={player.constructedDevelopments.map(card => developmentCards[card])}/>
      }
      {player.constructedDevelopments.map((card, index) =>
        <DevelopmentCard key={card} development={developmentCards[card]} onClick={() => setFocusedCardIndex(index)}
                         css={[style, cardStyle, transform(index)]}/>
      )}
      {dragging &&
      <div ref={ref} css={[buildDropArea, isValidTarget ? validDropAreaColor(isOver) : invalidDropAreaColor]}>
        <span css={dropAreaText}>
          {isValidTarget ? t('Build') : t('Construction is impossible')}
        </span>
      </div>
      }
    </>
  )
}

const style = css`
  position: absolute;
`

const transform = (index: number) => css`
  transform: translate(${constructedCardLeftMargin * 100 / cardWidth}%, ${constructedCardY(index) * 100 / cardHeight}%);
`

const buildDropArea = css`
  position: absolute;
  left: ${empireCardLeftMargin}%;
  width: ${empireCardWidth}%;
  top: ${headerHeight + topMargin}%;
  bottom: ${constructedCardBottomMargin}%;
  border-radius: 1em;
  z-index: 10;
`

const validDropAreaColor = (isOver: boolean) => css`
  background-color: rgba(0, 255, 0, ${isOver ? 0.5 : 0.3});
  border: 0.3em dashed green;
`

const invalidDropAreaColor = css`
  background-color: rgba(255, 0, 0, 0.3);
  border: 0.3em dashed red;
`

const dropAreaText = css`
  position: absolute;
  width: 100%;
  margin: 0;
  padding: 4em 0.4em;
  text-align: center;
  font-size: 2.5em;
  color: white;
`

export default ConstructedCardsArea