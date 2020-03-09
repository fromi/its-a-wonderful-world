import {css} from '@emotion/core'
import React, {FunctionComponent} from 'react'
import {useGame} from 'tabletop-game-workshop'
import ItsAWonderfulWorld, {Phase} from '../../ItsAWonderfulWorld'
import Resource from '../resources/Resource'
import ResourceCube from '../resources/ResourceCube'
import board from './board.png'
import boardReduced from './board-reduced.png'
import ResourceArea from './ResourceArea'
import roundTracker1 from './round-tracker-1-3.png'
import roundTracker2 from './round-tracker-2-4.png'

type Props = {
  availableResources: Resource[]
}

const Board: FunctionComponent<Props> = ({availableResources}) => {
  const game = useGame<ItsAWonderfulWorld>()
  const reducedSize = game.phase == Phase.Draft && game.round > 1
  return (
    <div css={style(reducedSize)}>
      <img src={board} css={imageStyle(reducedSize)} draggable="false"/>
      <img src={boardReduced} css={reducedImageStyle(reducedSize)} draggable="false"/>
      <img alt={'Round tracker'} src={game.round % 2 ? roundTracker1 : roundTracker2} draggable="false" css={roundTrackerStyle(game.round, reducedSize)}/>
      <span css={roundTextStyle(reducedSize)}>{game.round}</span>
      {availableResources.map((resource, index) => <ResourceCube key={index} resource={resource} css={getResourceStyle(index, resource)}/>)}
      {resources.filter(resource => availableResources.indexOf(resource) != -1).map((resource) => <ResourceArea key={resource} resource={resource}/>)}
    </div>
  )
}

const resources = Object.values(Resource)

const style = (reducedSize = false) => css`
  position: absolute;
  height: 34%;
  top: 9%;
  left: 50%;
  transform: translateX(-50%);
  transition: transform 0.5s ease-in-out;
  ${reducedSize && css`transform: translate(-50%, -30%) scale(0.6)`}
`

const imageStyle = (reducedSize = false) => css`
  height: 100%;
  filter: drop-shadow(0.1vh 0.1vh 0.5vh black);
  opacity: ${reducedSize ? 0 : 1};
  transition: opacity 0.5s ease-in-out;
`

const reducedImageStyle = (reducedSize = false) => css`
  position: absolute;
  height: 51.1%;
  top: 12.3%;
  left: 1.9%;
  filter: drop-shadow(0.1vh 0.1vh 0.5vh black);
  opacity: ${reducedSize ? 1 : 0};
  transition: opacity 0.5s ease-in-out;
`

const roundTrackerStyle = (round: number, reducedSize = false) => css`
  position: absolute;
  height: 10%;
  top: 4.1%;
  left: ${round == 1 ? 36.65 : round == 2 ? 40.6 : round == 3 ? 50.4 : 54.35}%;
  transition: left 0.5s ease-in-out, transform 0.5s ease-in-out;
  ${reducedSize && roundTrackerReducedStyle};
`

const roundTrackerReducedStyle = css`
  left: 110%;
  transform: translateY(260%) scale(3);
`

const roundTextStyle = (reducedSize = false) => css`
  position: absolute;
  top: 27%;
  left: 110.5%;
  font-size: 5vh;
  color: #333333;
  font-weight: bold;
  opacity: ${reducedSize ? 1 : 0};
  transition: opacity 0.5s ease-in-out;
`

const getResourceStyle = (index: number, resource: Resource) => {
  const cubeDispersion = cubesDispersion[index] || [0, 0]
  return css`
    position: absolute;
    width: 2%;
    left: ${resources.indexOf(resource) * 18.95 + 8.5 + cubeDispersion[0]}%;
    top: ${32 + cubeDispersion[1]}%;
  `
}

const cubesDispersion = [
  [-2.5, -4],
  [1.5, -3],
  [2.5, 4],
  [-3, 3.5],
  [0.5, 9],
  [-0.5, 1.5],
  [0, -9],
  [-2, 10],
  [4, -2],
  [3, 10]
]

export default Board