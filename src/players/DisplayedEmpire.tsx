import {css} from '@emotion/core'
import React, {Fragment, FunctionComponent} from 'react'
import {useGame} from 'tabletop-game-workshop'
import ItsAWonderfulWorld, {Phase, Player} from '../ItsAWonderfulWorld'
import EmpireCard from '../material/empires/EmpireCard'
import ConstructedCardsArea from './ConstructedCardsArea'
import ConstructionArea from './ConstructionArea'
import DraftArea from './DraftArea'
import PlayerHand from './PlayerHand'
import RecyclingDropArea from './RecyclingDropArea'

const DisplayedEmpire: FunctionComponent<{ player: Player }> = ({player}) => {
  const game = useGame<ItsAWonderfulWorld>()
  return (
    <Fragment>
      <EmpireCard empire={player.empire} css={empireCardStyle}/>
      <DraftArea player={player}/>
      {(game.round > 1 || game.phase != Phase.Draft) && <ConstructionArea player={player}/>}
      <RecyclingDropArea empire={player.empire}/>
      <ConstructedCardsArea player={player}/>
      <PlayerHand player={player}/>
    </Fragment>
  )
}

const empireCardStyle = css`
  position: absolute;
  bottom: 2%;
  left: -4%;
  height: 14.95%;
`

export default DisplayedEmpire