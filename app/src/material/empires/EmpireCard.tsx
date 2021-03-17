/** @jsxImportSource @emotion/react */
import {css} from '@emotion/react'
import EmpireName from '@gamepark/its-a-wonderful-world/material/EmpireName'
import EmpireSide from '@gamepark/its-a-wonderful-world/material/EmpireSide'
import Resource from '@gamepark/its-a-wonderful-world/material/Resource'
import MoveType from '@gamepark/its-a-wonderful-world/moves/MoveType'
import Player from '@gamepark/its-a-wonderful-world/Player'
import PlayerView from '@gamepark/its-a-wonderful-world/PlayerView'
import {getPlayerName} from '@gamepark/its-a-wonderful-world/Rules'
import {usePlay, usePlayerId} from '@gamepark/react-client'
import {FunctionComponent} from 'react'
import {useDrop} from 'react-dnd'
import {useTranslation} from 'react-i18next'
import DragObjectType from '../../drag-objects/DragObjectType'
import ResourceFromBoard from '../../drag-objects/ResourceFromBoard'
import {empireCardHeight, empireCardWidth, glow} from '../../util/Styles'
import Images from '../Images'
import ResourceCube, {cubeHeight, cubeWidth} from '../resources/ResourceCube'

const empiresImages = {
  [EmpireName.AztecEmpire]: {
    [EmpireSide.A]: Images.aztecEmpireA,
    [EmpireSide.B]: Images.aztecEmpireB
  },
  [EmpireName.FederationOfAsia]: {
    [EmpireSide.A]: Images.federationOfAsiaA,
    [EmpireSide.B]: Images.federationOfAsiaB
  },
  [EmpireName.NoramStates]: {
    [EmpireSide.A]: Images.noramStatesA,
    [EmpireSide.B]: Images.noramStatesB
  },
  [EmpireName.PanafricanUnion]: {
    [EmpireSide.A]: Images.panafricanUnionA,
    [EmpireSide.B]: Images.panafricanUnionB
  },
  [EmpireName.RepublicOfEurope]: {
    [EmpireSide.A]: Images.republicOfEuropeA,
    [EmpireSide.B]: Images.republicOfEuropeB
  }
}

export const empireAvatar = {
  [EmpireName.AztecEmpire]: Images.aztecEmpireAvatar,
  [EmpireName.FederationOfAsia]: Images.federationOfAsiaAvatar,
  [EmpireName.NoramStates]: Images.noramStatesAvatar,
  [EmpireName.PanafricanUnion]: Images.panafricanUnionAvatar,
  [EmpireName.RepublicOfEurope]: Images.republicOfEuropeAvatar
}

type Props = {
  player: Player | PlayerView
  gameOver?: boolean
  withResourceDrop?: boolean
} & React.HTMLAttributes<HTMLDivElement>

const EmpireCard: FunctionComponent<Props> = ({player, gameOver = false, withResourceDrop = false, ...props}) => {
  const {t} = useTranslation()
  const play = usePlay()
  const playerId = usePlayerId<EmpireName>()
  const [{isValidTarget, isOver}, ref] = useDrop({
    accept: DragObjectType.RESOURCE_FROM_BOARD,
    canDrop: () => withResourceDrop,
    collect: (monitor) => ({
      isValidTarget: monitor.getItemType() === DragObjectType.RESOURCE_FROM_BOARD,
      isOver: monitor.isOver()
    }),
    drop: (item: ResourceFromBoard) => play({type: MoveType.PlaceResource, playerId: player.empire, resource: item.resource})
  })
  return (
    <div ref={ref} {...props} css={[style, getBackgroundImage(player.empire, player.empireSide), isValidTarget && validTargetStyle, isOver && overStyle]}>
      <div css={empireCardTitle}>({player.empireSide}) {getPlayerName(player.empire, t)}</div>
      {player.empireCardResources.filter(resource => resource !== Resource.Krystallium).map((resource, index) =>
        <ResourceCube key={index} resource={resource} css={getResourceStyle(index)}/>)}
      {player.empireCardResources.filter(resource => resource === Resource.Krystallium).map((resource, index) =>
        <ResourceCube key={index} resource={resource} css={getKrystalliumStyle(index)} draggable={!gameOver && player.empire === playerId}/>)}
    </div>
  )
}

const style = css`
  transform-origin: bottom left;
  border-radius: 5%;
  transition: transform 0.2s ease-in-out;
  box-shadow: 0 0 0.5em black;
  background-size: cover;
`

const getBackgroundImage = (empire: EmpireName, empireSide: EmpireSide) => css`
  background-image: url(${empiresImages[empire][empireSide]});
`

export const empireCardTitle = css`
  position: absolute;
  bottom: 11%;
  left: 6%;
  width: 80%;
  color: #EEE;
  text-align: center;
  font-size: 1em;
  font-weight: lighter;
  text-shadow: 0 0 0.3em #000, 0 0 0.3em #000;
  text-transform: uppercase;
`

const validTargetStyle = css`
  z-index: 1;
  animation: ${glow('green')} 1s ease-in-out infinite alternate;
  transform: scale(1.1);
`

const overStyle = css`
  &:before {
    content: '';
    position: absolute;
    width: 100%;
    height: 100%;
    z-index: 1;
    background-color: rgba(0, 128, 0, 0.3);
  }
`

const getResourceStyle = (index: number) => css`
  position: absolute;
  width: ${cubeWidth * 100 / empireCardWidth}%;
  height: ${cubeHeight * 100 / empireCardHeight}%;
  left: ${resourcePosition[index % 5][0]}%;
  top: ${resourcePosition[index % 5][1]}%;
`

const getKrystalliumStyle = (index: number) => css`
  position: absolute;
  width: ${cubeWidth * 100 / empireCardWidth}%;
  height: ${cubeHeight * 100 / empireCardHeight}%;
  right: ${-cubeWidth * 1.2 * 100 / empireCardWidth}%;
  bottom: ${index * cubeHeight * 0.8 * 100 / empireCardHeight}%;
`

export const resourcePosition = [
  [29, 60],
  [15, 60],
  [10, 45],
  [22, 36],
  [34, 45]
]

export default EmpireCard