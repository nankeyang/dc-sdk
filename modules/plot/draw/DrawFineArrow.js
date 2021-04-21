/**
 * @Author: Caven
 * @Date: 2020-08-30 16:43:12
 */

import { Cesium } from '@dc-modules/namespace'
import { Transform } from '@dc-modules/transform'
import { FineArrow } from '@dc-modules/overlay'
import Draw from './Draw'
import FineArrowGraphics from '../graphics/FineArrowGraphics'

const DEF_STYLE = {
  material: Cesium.Color.YELLOW.withAlpha(0.6),
  fill: true
}

class DrawFineArrow extends Draw {
  constructor(style) {
    super()
    this._floatingAnchor = undefined
    this._style = {
      ...DEF_STYLE,
      ...style
    }
    this._graphics = new FineArrowGraphics()
  }

  _mountEntity() {
    this._delegate = new Cesium.Entity({
      polygon: {
        ...this._style,
        hierarchy: new Cesium.CallbackProperty(() => {
          if (this._positions.length > 1) {
            this._graphics.positions = this._positions
            return this._graphics.hierarchy
          } else {
            return null
          }
        }, false)
      }
    })
    this._layer.add(this._delegate)
  }

  _onClick(e) {
    let position = this._clampToGround ? e.surfacePosition : e.position
    if (!position) {
      return false
    }
    let len = this._positions.length
    if (len === 0) {
      this._positions.push(position)
      this.createAnchor(position)
      this._floatingAnchor = this.createAnchor(position)
    }
    this._positions.push(position)
    this._graphics.positions = this._positions
    this.createAnchor(position)
    if (len > 1) {
      this._positions.pop()
      this.unbindEvent()
      let fineArrow = new FineArrow(
        Transform.transformCartesianArrayToWGS84Array(this._positions)
      )
      fineArrow.setStyle(this._style)
      this._plotEvent.raiseEvent(fineArrow)
    }
  }
}

export default DrawFineArrow
