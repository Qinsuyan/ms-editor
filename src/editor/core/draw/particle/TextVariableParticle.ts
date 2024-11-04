import { IElement } from '../../..'
import { EDITOR_PREFIX } from '../../../dataset/constant/Editor'
import { IElementPosition } from '../../../interface/Element'
import { IRowElement } from '../../../interface/Row'
import { Draw } from '../Draw'

export class TextVariableParticle {
  private draw: Draw
  private container: HTMLDivElement
  private hyperlinkPopupContainer: HTMLDivElement
  private hyperlinkDom: HTMLSpanElement

  constructor(draw: Draw) {
    this.draw = draw
    this.container = draw.getContainer()
    const { hyperlinkPopupContainer, hyperlinkDom } =
      this._createHyperlinkPopupDom()
    this.hyperlinkDom = hyperlinkDom
    this.hyperlinkPopupContainer = hyperlinkPopupContainer
  }

  private _createHyperlinkPopupDom() {
    const hyperlinkPopupContainer = document.createElement('div')
    hyperlinkPopupContainer.classList.add(`${EDITOR_PREFIX}-hyperlink-popup`)
    const hyperlinkDom = document.createElement('span')
    hyperlinkPopupContainer.append(hyperlinkDom)
    this.container.append(hyperlinkPopupContainer)
    return { hyperlinkPopupContainer, hyperlinkDom }
  }

  public drawHyperlinkPopup(element: IElement, position: IElementPosition) {
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
    this.hyperlinkPopupContainer.style.display = 'block'
    this.hyperlinkPopupContainer.style.left = `${left}px`
    this.hyperlinkPopupContainer.style.top = `${top + preY + lineHeight}px`
    // 标签
    this.hyperlinkDom.innerText = element.label || '未命名变量'
  }

  public clearHyperlinkPopup() {
    this.hyperlinkPopupContainer.style.display = 'none'
  }

  public render(
    ctx: CanvasRenderingContext2D,
    element: IRowElement,
    x: number,
    y: number
  ) {
    ctx.save()
    ctx.font = element.style
    ctx.fillText(element.value, x, y)
    ctx.restore()
  }
}
