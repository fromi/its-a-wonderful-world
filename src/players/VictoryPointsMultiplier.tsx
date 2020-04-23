import {css} from '@emotion/core'
import React, {FunctionComponent} from 'react'
import Character, {isCharacter} from '../material/characters/Character'
import CharacterToken from '../material/characters/CharacterToken'
import DevelopmentType from '../material/developments/DevelopmentType'
import Discovery from '../material/developments/discovery-icon.png'
import Project from '../material/developments/project-icon.png'
import Research from '../material/developments/research-icon.png'
import Structure from '../material/developments/structure-icon.png'
import Vehicle from '../material/developments/vehicle-icon.png'
import ScoreBackground from '../material/score-background.png'
import ScoreIcon from '../material/score-icon.png'

type Props = {
  item: DevelopmentType | Character
  multiplier: number
  quantity?: number
} & React.HTMLAttributes<HTMLDivElement>

const VictoryPointsMultiplier: FunctionComponent<Props> = ({item, multiplier, quantity, ...props}) => (
  <div {...props} css={style}>
    <span css={numberStyle}>{multiplier}</span><span css={multiplierStyle}>x</span>
    {isCharacter(item) ? <CharacterToken character={item} css={imageStyle}/> : <img src={developmentTypeImage[item]} css={imageShadowStyle}/>}
    {quantity !== undefined && <span css={quantityStyle}>{quantity}</span>}
  </div>
)

const style = css`
  background-image: url(${ScoreBackground});
  background-size: cover;
  border-radius: 0.8vh;
  box-shadow: 0 0 2px black;
  display: flex;
  align-items: center;
  justify-content: center;
`

const developmentTypeImage = {
  [DevelopmentType.Structure]: Structure,
  [DevelopmentType.Vehicle]: Vehicle,
  [DevelopmentType.Research]: Research,
  [DevelopmentType.Project]: Project,
  [DevelopmentType.Discovery]: Discovery
}

const numberStyle = css`
  background-image: url(${ScoreIcon});
  filter: drop-shadow(0 0 1px black);
  background-size: contain;
  background-repeat: no-repeat;
  background-position: center;
  text-align: center;
  font-size: 2.5vh;
  flex-shrink: 0;
  width: 2.5vh;
  font-weight: bold;
  color: white;
  text-shadow: 0 0 3px black;
`

const multiplierStyle = css`
  z-index: 1;
  font-size: 1.5vh;
  font-weight: bold;
  color: white;
  text-shadow: 0 0 3px black;
  position: absolute;
  right: 45%;
  top: 20%;
`

const imageStyle = css`
  height: 70%;
  border-radius: 0.5vh;
`

const imageShadowStyle = css`
  box-shadow: 0 0 1px black;
  ${imageStyle};
`

const quantityStyle = css`
  filter: drop-shadow(0 0 1px black);
  position: absolute;
  left: 60%;
  top: 50%;
  transform: translateY(-50%);
  text-align: center;
  font-size: 2.5vh;
  font-weight: bold;
  color: white;
  text-shadow: 0 0 3px black;
`

export default VictoryPointsMultiplier