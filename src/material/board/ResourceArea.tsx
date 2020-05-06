import {css, keyframes} from '@emotion/core'
import React, {Fragment, FunctionComponent} from 'react'
import {DragPreviewImage, useDrag} from 'react-dnd'
import {resourceFromBoard} from '../../drag-objects/ResourceFromBoard'
import Resource from '../resources/Resource'
import {images as resourceCubeImages} from '../resources/ResourceCube'

const ResourceArea: FunctionComponent<{ resource: Resource, canDrag: boolean }> = ({resource, canDrag}) => {
  const [, ref, preview] = useDrag({
    canDrag, item: resourceFromBoard(resource),
    collect: monitor => ({
      dragging: monitor.isDragging()
    })
  })
  return (
    <Fragment>
      <DragPreviewImage connect={preview} src={resourceCubeImages[resource]}/>
      <div ref={ref} key={resource} css={[getResourceAreaHighlight(resource), canDrag && canDragStyle]}/>
    </Fragment>
  )
}

const resources = Object.values(Resource)

const getResourceAreaHighlight = (resource: Resource) => css`
  position: absolute;
  width: 10%;
  height: 29%;
  left: ${resources.indexOf(resource) * 18.95 + 4.5}%;
  top: 22%;
  border-radius: 100%;
  animation: ${glow(resourceColor[resource])} 1s ease-in-out infinite alternate;
`

const canDragStyle = css`
  cursor: grab;
`

const resourceColor = {
  [Resource.Materials]: 'white',
  [Resource.Energy]: 'black',
  [Resource.Science]: 'green',
  [Resource.Gold]: 'gold',
  [Resource.Exploration]: 'blue',
  [Resource.Krystallium]: 'red'
}

export const glow = (color: string) => keyframes`
  from {
    box-shadow: 0 0 5px ${color};
  }
  to {
    box-shadow: 0 0 30px ${color};
  }
`

export default ResourceArea