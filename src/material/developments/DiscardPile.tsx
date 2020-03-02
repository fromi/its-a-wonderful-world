import {css} from '@emotion/core'
import React, {Fragment} from 'react'
import {useGame} from 'tabletop-game-workshop'
import ItsAWonderfulWorld from '../../ItsAWonderfulWorld'
import {areasLeftPosition} from '../../players/DraftArea'
import DevelopmentCard, {height as cardHeight} from '../developments/DevelopmentCard'

const DiscardPile = () => {
  const game = useGame<ItsAWonderfulWorld>()
  return (
    <Fragment>
      {game.discard.slice(-8).map((development, index) => <DevelopmentCard key={index} development={development} css={css`
        position: absolute;
        height: ${cardHeight}%;
        top: ${8 + index * 0.05}%;
        left: ${areasLeftPosition + 5 + index * 0.05}%;
        transform-origin: top left;
        transform: scale(0.4);
        & > img {
          box-shadow: 0 0 3px black;
        }
      `}/>)}
    </Fragment>
  )
}

export default DiscardPile