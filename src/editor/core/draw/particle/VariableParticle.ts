import { EDITOR_PREFIX } from '../../../dataset/constant/Editor'
import { IElement, IElementPosition } from '../../../interface/Element'
import { Draw } from '../Draw'

export class VariableParticle {
  private draw: Draw
  private container: HTMLDivElement
  private variablePopupContainer: HTMLDivElement
  private variableDom: HTMLSpanElement

  constructor(draw: Draw) {
    this.draw = draw
    this.container = draw.getContainer()
    const { variablePopupContainer, variableDom } =
      this._createVariablePopupDom()
    this.variableDom = variableDom
    this.variablePopupContainer = variablePopupContainer
  }

  private _createVariablePopupDom() {
    const variablePopupContainer = document.createElement('div')
    variablePopupContainer.classList.add(`${EDITOR_PREFIX}-variable-popup`)
    const variableDom = document.createElement('span')
    variablePopupContainer.append(variableDom)
    this.container.append(variablePopupContainer)
    return { variablePopupContainer, variableDom }
  }

  public clearVariablePopup() {
    this.variablePopupContainer.style.display = 'none'
  }

  public drawVariablePopup(element: IElement, position: IElementPosition) {
    const {
      coordinate: {
        leftTop: [left, top]
      },
      lineHeight
    } = position
    const height = this.draw.getHeight()
    const pageGap = this.draw.getPageGap()
    const preY = this.draw.getPageNo() * (height + pageGap)
    // 位置
    this.variablePopupContainer.style.display = 'block'
    this.variablePopupContainer.style.left = `${left}px`
    this.variablePopupContainer.style.top = `${top + preY + lineHeight}px`
    // 标签

    this.variableDom.innerText = element.label || element.key || '未知变量'
  }
}
