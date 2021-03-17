/** @jsxImportSource @emotion/react */
import {css, Theme, useTheme} from '@emotion/react'
import GameView from '@gamepark/its-a-wonderful-world/GameView'
import Character from '@gamepark/its-a-wonderful-world/material/Character'
import {
  HarborZone, IndustrialComplex, PropagandaCenter, SecretSociety, UniversalExposition, WindTurbines, Zeppelin
} from '@gamepark/its-a-wonderful-world/material/Developments'
import EmpireName from '@gamepark/its-a-wonderful-world/material/EmpireName'
import Resource from '@gamepark/its-a-wonderful-world/material/Resource'
import {isCompleteConstruction} from '@gamepark/its-a-wonderful-world/moves/CompleteConstruction'
import Move from '@gamepark/its-a-wonderful-world/moves/Move'
import MoveType from '@gamepark/its-a-wonderful-world/moves/MoveType'
import {isReceiveCharacter} from '@gamepark/its-a-wonderful-world/moves/ReceiveCharacter'
import Phase from '@gamepark/its-a-wonderful-world/Phase'
import Player from '@gamepark/its-a-wonderful-world/Player'
import {countCharacters, getNextProductionStep, getPlayerName, getScore, isOver, numberOfRounds} from '@gamepark/its-a-wonderful-world/Rules'
import {isPlayer} from '@gamepark/its-a-wonderful-world/typeguards'
import {Animation, Player as PlayerInfo, useActions, useAnimation, usePlay, usePlayerId, usePlayers} from '@gamepark/react-client'
import {TFunction} from 'i18next'
import {FunctionComponent, useEffect, useState} from 'react'
import {Trans, useTranslation} from 'react-i18next'
import MainMenu from './MainMenu'
import CharacterToken from './material/characters/CharacterToken'
import DevelopmentCardsTitles from './material/developments/DevelopmentCardsTitles'
import {LightTheme} from './Theme'
import Button from './util/Button'
import {gameOverDelay, headerHeight, textColor} from './util/Styles'

const headerStyle = (theme: Theme) => css`
  position: absolute;
  display: flex;
  width: 100%;
  height: ${headerHeight}em;
  padding: 0 30em 0 0;
  text-align: center;
  background-color: ${theme.color === LightTheme ? 'rgba(255, 255, 255, 0.5)' : 'rgba(0, 0, 30, 0.5)'};
  transition: background-color 1s ease-in;
`

const bufferArea = css`
  width: 30em;
  flex-shrink: 1;
`

const textStyle = css`
  flex-grow: 1;
  flex-shrink: 0;
  transition: color 1s ease-in;
  padding: 0.25em;
  margin: 0;
  line-height: 1.25;
  font-size: 4em;
  white-space: nowrap;
  text-overflow: ellipsis;
  overflow: hidden;
`

type Props = {
  game?: GameView
  loading: boolean
  validate: () => void
}

const Header: FunctionComponent<Props> = ({game, loading, validate}) => {
  const empire = usePlayerId<EmpireName>()
  const play = usePlay<Move>()
  const players = usePlayers<EmpireName>()
  const animation = useAnimation<Move>(animation => [MoveType.RevealChosenCards, MoveType.PassCards].includes(animation.move.type))
  const {t} = useTranslation()
  const theme = useTheme()
  const actions = useActions()
  const gameOver = game !== undefined && isOver(game) && !!actions && actions.every(action => !action.pending)
  const [scoreSuspense, setScoreSuspense] = useState(false)
  useEffect(() => {
    if (gameOver) {
      setTimeout(() => setScoreSuspense(false), gameOverDelay * 1000)
    } else if (game) {
      setScoreSuspense(true)
    }
  }, [game, gameOver, setScoreSuspense])
  const text = loading ? t('Game loading…') :
    gameOver ? scoreSuspense ? t('Score calculation… Who will be the Supreme Leader?') :
      getEndOfGameText(t, players, game!, empire) :
      getText(t, validate, play, players, game!, empire, animation)
  return (
    <header css={headerStyle(theme)}>
      <div css={bufferArea}/>
      <h1 css={[textStyle, textColor(theme)]}>{text}</h1>
      <MainMenu/>
    </header>
  )
}

function getText(t: TFunction, validate: () => void, play: (move: Move) => void, playersInfo: PlayerInfo<EmpireName>[], game: GameView, empire?: EmpireName, animation?: Animation<Move>) {
  const player = game.players.find(player => player.empire === empire)
  const getName = (empire: EmpireName) => playersInfo.find(p => p.id === empire)?.name || getPlayerName(empire, t)
  if (game.tutorial && game.round === 1 && !animation && player && isPlayer(player)) {
    const tutorialText = getTutorialText(t, game, player)
    if (tutorialText) {
      return tutorialText
    }
  }
  switch (game.phase) {
    case Phase.Draft:
      if (animation && animation.move.type === MoveType.RevealChosenCards) {
        return t('Players reveal the card they have chosen')
      } else if (animation && animation.move.type === MoveType.PassCards) {
        if (game.round % 2 === 1) {
          return t('The players pass the rest of the cards to the left')
        } else {
          return t('The players pass the rest of the cards to the right')
        }
      } else if (player && player.chosenCard === undefined) {
        return t('Choose a card and place it in your draft area')
      } else {
        const players = game.players.filter(player => player.chosenCard === undefined)
        if (players.length === 0) {
          return t('Sending move to the Supreme Leader…')
        } else if (players.length === 1) {
          return t('{player} must choose a development card', {player: getName(players[0].empire)})
        } else if (player) {
          return t('Other players must choose a development card')
        } else {
          return t('Players must choose a development card')
        }
      }
    case Phase.Planning:
      if (player && player.draftArea.length) {
        return t('You must slate for construction or recycle each card in your draft area')
      } else if (player && player.availableResources.length) {
        return t('Place your resources on your developments under construction or your Empire card')
      } else if (player && !player.ready) {
        return <Trans values={{resource: Resource.Materials}}
                      defaults="Click on <0>Validate</0> if you are ready to proceed to {resource, select, Materials{materials} Energy{energy} Science{science} Gold{gold} other{exploration}} production"
                      components={[<Button onClick={validate}/>]}/>
      } else {
        const players = game.players.filter(player => !player.ready)
        if (players.length === 0) {
          return t('Sending move to the Supreme Leader…')
        } else if (players.length === 1) {
          return t('{player} has to plan', {player: getName(players[0].empire)})
        } else if (player) {
          return t('The other players have to do their planning')
        } else {
          return t('Players have to do their planning')
        }
      }
    case Phase.Production:
      if (animation && isReceiveCharacter(animation.move) && !animation.action.consequences.some(isCompleteConstruction)) {
        if (animation.move.playerId === player?.empire) {
          return t('You receive a {character, select, Financier{Financier} other{General}} for your {resource, select, Materials{Materials} Energy{Energy} Science{Science} Gold{Gold} other{Exploration}} production supremacy',
            {character: animation.move.character, resource: game.productionStep})
        } else {
          return t('{player} receives a {character, select, Financier{Financier} other{General}} for producing the most {resource, select, Materials{Materials} Energy{Energy} Science{Science} Gold{Gold} other{Exploration}}',
            {player: getName(animation.move.playerId), character: animation.move.character, resource: game.productionStep})
        }
      }
      if (player && !player.ready) {
        if (player.availableResources.length) {
          return t('Place the resources produced on your developments under construction or your Empire card')
        } else if (player.bonuses.some(bonus => bonus === 'CHOOSE_CHARACTER')) {
          return <Trans defaults="Receive a Financier <0/> or a General <1/> (Science Supremacy Bonus)"
                        components={[
                          <CharacterToken character={Character.Financier} onClick={() => play({
                            type: MoveType.ReceiveCharacter, playerId: player.empire, character: Character.Financier
                          })}
                                          css={characterTokenStyle}/>,
                          <CharacterToken character={Character.General} onClick={() => play({
                            type: MoveType.ReceiveCharacter, playerId: player.empire, character: Character.General
                          })}
                                          css={characterTokenStyle}/>
                        ]}/>
        } else if (game.productionStep !== Resource.Exploration) {
          return <Trans values={{resource: getNextProductionStep(game)}}
                        defaults="Click on <0>Validate</0> if you are ready to proceed to {resource, select, Materials{materials} Energy{energy} Science{science} Gold{gold} other{exploration}} production"
                        components={[<Button onClick={validate}/>]}/>
        } else if (game.round < numberOfRounds) {
          return <Trans defaults="Click on <0>Validate</0> if you are ready to proceed to the next round"
                        components={[<Button onClick={validate}/>]}/>
        } else {
          return <Trans defaults="Click on <0>Validate</0> to proceed to the calculation of the scores"
                        components={[<Button onClick={validate}/>]}/>
        }
      } else {
        const players = game.players.filter(player => !player.ready)
        if (players.length === 0) {
          return t('Sending move to the Supreme Leader…')
        } else if (players.length === 1) {
          return t('{player} must use the resources produced', {player: getName(players[0].empire)})
        } else if (player) {
          return t('The other players must use the resources produced')
        } else {
          return t('Players must use the resources produced')
        }
      }
  }
  return ''
}

function getTutorialText(t: TFunction, game: GameView, player: Player): string | undefined {
  switch (game.phase) {
    case Phase.Draft:
      switch (player.hand.length) {
        case 7 :
          return t('Tutorial: choose the card {card} and place it to your draft area', {card: DevelopmentCardsTitles.get(SecretSociety)!(t)})
        case 6 :
          return t('Tutorial: choose the card {card} and place it to your draft area', {card: DevelopmentCardsTitles.get(IndustrialComplex)!(t)})
        case 5 :
          return t('Tutorial: choose the card {card} and place it to your draft area', {card: DevelopmentCardsTitles.get(PropagandaCenter)!(t)})
        case 4 :
          return t('Tutorial: choose the card {card} and place it to your draft area', {card: DevelopmentCardsTitles.get(HarborZone)!(t)})
        case 3 :
          return t('Tutorial: choose the card {card} and place it to your draft area', {card: DevelopmentCardsTitles.get(WindTurbines)!(t)})
        case 2 :
          return t('Tutorial: choose the card {card} and place it to your draft area', {card: DevelopmentCardsTitles.get(UniversalExposition)!(t)})
      }
      break
    case Phase.Planning:
      switch (player.draftArea.length) {
        case 7 :
          return t('Tutorial: select the card {card} and place it to your construction area', {card: DevelopmentCardsTitles.get(IndustrialComplex)!(t)})
        case 6 :
          return t('Tutorial: select the card {card} and place it to your construction area', {card: DevelopmentCardsTitles.get(PropagandaCenter)!(t)})
        case 5 :
          return t('Tutorial: select the card {card} and place it to your construction area', {card: DevelopmentCardsTitles.get(HarborZone)!(t)})
        case 4 :
          return t('Tutorial: select the card {card} and place it to your construction area', {card: DevelopmentCardsTitles.get(SecretSociety)!(t)})
        case 3 :
          return t('Tutorial: select the card {card} and recycle it', {card: DevelopmentCardsTitles.get(UniversalExposition)!(t)})
        case 2 :
          if (player.availableResources.length > 0)
            return t('Tutorial: place your resources on the {card} card', {card: DevelopmentCardsTitles.get(PropagandaCenter)!(t)})
          else
            return t('Tutorial: select the card {card} and recycle it', {card: DevelopmentCardsTitles.get(WindTurbines)!(t)})
        case 1 :
          if (player.availableResources.length > 0)
            return t('Tutorial: place your resources on the {card} card', {card: DevelopmentCardsTitles.get(IndustrialComplex)!(t)})
          else
            return t('Tutorial: select the card {card} and recycle it', {card: DevelopmentCardsTitles.get(Zeppelin)!(t)})
      }
      break
    case Phase.Production:
      if (player.availableResources.filter(r => r === Resource.Materials).length > 0)
        return t('Tutorial: place your resources on the {card} card', {card: DevelopmentCardsTitles.get(IndustrialComplex)!(t)})
      else if (player.availableResources.filter(r => r === Resource.Gold).length > 0)
        return t('Tutorial: place your resources on the {card} card', {card: DevelopmentCardsTitles.get(PropagandaCenter)!(t)})
      break
  }
  return
}

function getEndOfGameText(t: TFunction, playersInfo: PlayerInfo<EmpireName>[], game: GameView, empire?: EmpireName) {
  const player = game.players.find(player => player.empire === empire)
  const getName = (empire: EmpireName) => playersInfo.find(p => p.id === empire)?.name || getPlayerName(empire, t)
  let highestScore = -1
  let playersWithHighestScore = []
  for (const player of game.players) {
    const score = getScore(player)
    if (score >= highestScore) {
      if (score > highestScore) {
        playersWithHighestScore = []
        highestScore = score
      }
      playersWithHighestScore.push(player)
    }
  }
  if (playersWithHighestScore.length === 1) {
    if (player === playersWithHighestScore[0]) {
      return t('Victory! You win the game with {score} points', {score: highestScore})
    } else {
      return t('{player} wins the game with {score} points', {player: getName(playersWithHighestScore[0].empire), score: highestScore})
    }
  }
  let highestDevelopments = -1
  let playersWithMostDevelopments = []
  for (const player of playersWithHighestScore) {
    if (player.constructedDevelopments.length >= highestDevelopments) {
      if (player.constructedDevelopments.length > highestDevelopments) {
        playersWithMostDevelopments = []
        highestDevelopments = player.constructedDevelopments.length
      }
      playersWithMostDevelopments.push(player)
    }
  }
  if (playersWithMostDevelopments.length === 1) {
    if (player === playersWithMostDevelopments[0]) {
      return t('Victory! You win the game with {score} points and {developments} developments built',
        {score: highestScore, developments: highestDevelopments})
    } else {
      return t('{player} wins the game with {score} points and {developments} developments built',
        {player: getName(playersWithMostDevelopments[0].empire), score: highestScore, developments: highestDevelopments})
    }
  }
  let highestCharacters = -1
  let playersWithMostCharacters = []
  for (const player of playersWithMostDevelopments) {
    const characters = countCharacters(player)
    if (characters >= highestCharacters) {
      if (characters > highestCharacters) {
        playersWithMostCharacters = []
        highestCharacters = characters
      }
      playersWithMostCharacters.push(player)
    }
  }
  if (playersWithMostCharacters.length === 1) {
    if (player === playersWithMostCharacters[0]) {
      return t('Victory! You win the game with {score} points, {developments} developments and {characters} characters',
        {score: highestScore, developments: highestDevelopments, characters: highestCharacters})
    } else {
      return t('{player} wins the game with {score} points, {developments} developments and {characters} characters',
        {player: getName(playersWithMostCharacters[0].empire), score: highestScore, developments: highestDevelopments, characters: highestCharacters})
    }
  }
  if (playersWithMostCharacters.length === game.players.length) {
    return t('Perfect tie! All players each have {score} points, {developments} developments and {characters} characters',
      {score: highestScore, developments: highestDevelopments, characters: highestCharacters})
  } else if (playersWithMostCharacters.length === 2) {
    return t('Perfect tie! {player1} and {player2} each have {score} points, {developments} developments and {characters} characters',
      {
        player1: getName(playersWithMostCharacters[0].empire), player2: getName(playersWithMostCharacters[1].empire),
        score: highestScore, developments: highestDevelopments, characters: highestCharacters
      })
  } else if (playersWithMostCharacters.length === 3) {
    return t('Perfect tie! {player1}, {player2} and {player3} each have {score} points, {developments} developments and {characters} characters',
      {
        player1: getName(playersWithMostCharacters[0].empire), player2: getName(playersWithMostCharacters[1].empire),
        player3: getName(playersWithMostCharacters[2].empire), score: highestScore, developments: highestDevelopments, characters: highestCharacters
      })
  } else {
    return t('Perfect tie! {player1}, {player2}, {player3} and {player4} each have {score} points, {developments} developments and {characters} characters',
      {
        player1: getName(playersWithMostCharacters[0].empire), player2: getName(playersWithMostCharacters[1].empire),
        player3: getName(playersWithMostCharacters[2].empire), player4: getName(playersWithMostCharacters[3].empire),
        score: highestScore, developments: highestDevelopments, characters: highestCharacters
      })
  }
}

const characterTokenStyle = css`
  width: 1.25em;
  height: 1.25em;
  vertical-align: bottom;
  cursor: pointer;

  &:hover, &:active {
    transform: scale(1.1);
  }
`

export default Header