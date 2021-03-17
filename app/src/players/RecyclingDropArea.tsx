/** @jsxImportSource @emotion/react */
import {css} from '@emotion/react'
import EmpireName from '@gamepark/its-a-wonderful-world/material/EmpireName'
import MoveType from '@gamepark/its-a-wonderful-world/moves/MoveType'
import {FunctionComponent} from 'react'
import {useDrop} from 'react-dnd'
import {useTranslation} from 'react-i18next'
import DevelopmentFromConstructionArea from '../drag-objects/DevelopmentFromConstructionArea'
import DevelopmentFromDraftArea from '../drag-objects/DevelopmentFromDraftArea'
import DragObjectType from '../drag-objects/DragObjectType'
import {areasX, areaWidth} from '../util/Styles'

const RecyclingDropArea: FunctionComponent<{ empire: EmpireName }> = ({empire}) => {
  const {t} = useTranslation()
  const [{isValidTarget, isOver}, ref] = useDrop({
    accept: [DragObjectType.DEVELOPMENT_FROM_DRAFT_AREA, DragObjectType.DEVELOPMENT_FROM_CONSTRUCTION_AREA],
    collect: (monitor) => ({
      isValidTarget: monitor.getItemType() === DragObjectType.DEVELOPMENT_FROM_DRAFT_AREA || monitor.getItemType() === DragObjectType.DEVELOPMENT_FROM_CONSTRUCTION_AREA,
      isOver: monitor.isOver()
    }),
    drop: (item: DevelopmentFromDraftArea | DevelopmentFromConstructionArea) => ({type: MoveType.Recycle, playerId: empire, card: item.card})
  })
  return (
    <div ref={ref} css={getStyle(isValidTarget, isOver)}>
      <span css={text}>&rarr; {t('Recycle')}</span>
    </div>
  )
}

const getStyle = (isValidTarget: boolean, isOver: boolean) => css`
  position: absolute;
  display: ${isValidTarget ? 'block' : 'none'};
  height: 36%;
  width: ${areaWidth}%;
  left: ${areasX}%;
  top: 8%;
  background-color: rgba(0, 0, 0, ${isOver ? 0.5 : 0.3});
  border: 0.3em dashed grey;
  border-radius: 1em;
  z-index: 10;
`

const text = css`
  position: absolute;
  width: 100%;
  margin: 0;
  padding: 0 0.2em;
  top: 50%;
  transform: translateY(-50%);
  text-align: center;
  color: antiquewhite;
  font-size: 6em;
`

export default RecyclingDropArea