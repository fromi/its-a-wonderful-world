import {css} from '@emotion/core'
import React, {Fragment, FunctionComponent} from 'react'
import {areasLeftPosition} from '../../players/DraftArea'
import GameView from '../../types/GameView'
import DevelopmentCard, {height as cardHeight, width as cardWidth} from '../developments/DevelopmentCard'
import {developmentCards} from './Developments'

const DiscardPile: FunctionComponent<{ game: GameView }> = ({game}) => {
  return (
    <Fragment>
      {game.discard.slice(-8).map((card, index) => <DevelopmentCard key={index} development={developmentCards[card]} css={css`
        position: absolute;
        width: ${cardWidth}%;
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