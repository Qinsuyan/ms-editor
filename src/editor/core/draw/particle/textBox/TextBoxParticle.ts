import { EDITOR_PREFIX } from '../../../../dataset/constant/Editor'
import { IEditorOption } from '../../../../interface/Editor'
import { IElement } from '../../../../interface/Element'
import { IRowElement } from '../../../../interface/Row'
import { Draw } from '../../Draw'

export class TextBoxParticle {
  private draw: Draw
  private options: Required<IEditorOption>
  private resizerDom: HTMLDivElement
  private container: HTMLDivElement
  private curElement: IElement | null
  private curElementIndex: number
  private editing: boolean
  private tempHandler: any
  constructor(draw: Draw) {
    this.container = draw.getContainer()
    this.draw = draw
    this.options = draw.getOptions()
    this.resizerDom = document.createElement('div')
    this.resizerDom.title = '双击编辑'
    this.resizerDom.classList.add('textbox-resizer-dom')
    this.container.append(this.resizerDom)
    this.curElement = null
    this.editing = false
    this.tempHandler = null
    this.curElementIndex = -1
  }
  private _drawBorder(
    ctx: CanvasRenderingContext2D,
    element: IRowElement,
    x: number,
    y: number,
    color: string | undefined,
    lineWidth: number | undefined
  ) {
    const { scale } = this.options
    const metrics = {
      width: 0,
      height: 0
    }
    if (!element.value?.length) {
      const m = ctx.measureText('请输入文本框内容')
      metrics.width = m.actualBoundingBoxLeft + m.actualBoundingBoxRight
      metrics.height =
        m.fontBoundingBoxAscent +
        m.fontBoundingBoxDescent +
        element.metrics.height
    } else {
      const m = ctx.measureText(element.value)
      metrics.width =
        m.actualBoundingBoxLeft * scale + m.actualBoundingBoxRight * scale
      metrics.height =
        m.fontBoundingBoxAscent * scale +
        m.fontBoundingBoxDescent * scale +
        element.metrics.height
    }
    element.width = metrics.width
    element.height = metrics.height
    element.imgFloatPosition = {
      x: element.x! * scale,
      y: element.y! * scale
    }
    if (!color || !lineWidth) {
      return
    }
    ctx.strokeStyle = color
    ctx.lineWidth = lineWidth
    ctx.strokeRect(
      (x - lineWidth / 2) * scale,
      (y - lineWidth / 2) * scale - metrics.height / 2,
      metrics.width,
      metrics.height
    )
    ctx.stroke()
  }
  private _drawContent(ctx: CanvasRenderingContext2D, element: IRowElement) {
    const { scale } = this.options
    if (!element.value) {
      ctx.font = ' italic ' + element.style
      ctx.fillStyle = '#CCC'
    } else {
      ctx.font = element.style
      ctx.fillStyle = element.color || this.options.defaultColor
    }
    const val = element.value || '请输入文本框内容'
    ctx.textBaseline = 'middle'
    ctx.fillText(val, element.x! * scale, element.y! * scale)
  }
  private _endEdit() {
    document.body.removeEventListener('click', this.tempHandler)
    this.editing = false
    this.hideControl()
    this.draw.render()
  }
  private _dbclick() {
    if (!this.curElement) {
      return
    }
    const textArea = document.createElement('textarea')
    textArea.style.position = 'absolute'
    textArea.style.top = '0px'
    textArea.style.left = '0px'
    textArea.style.width = '100%'
    textArea.style.height = '100%'
    textArea.style.border = 'none'
    textArea.style.outline = 'none'
    textArea.style.resize = 'none'
    textArea.style.background = 'transparent'
    textArea.autocomplete = 'off'
    textArea.classList.add(`${EDITOR_PREFIX}-inputarea`)
    textArea.value = this.curElement.value
    this.resizerDom.append(textArea)
    this.editing = true
    textArea.click()
    textArea.focus()
    textArea.onclick = e => e.stopPropagation()
    this.tempHandler = this._endEdit.bind(this)
    document.body.addEventListener('click', this.tempHandler)
    textArea.oninput = e => {
      const val = (e.target as HTMLTextAreaElement).value
      this.curElement!.value = val

      this.draw.render({ curIndex: this.curElementIndex, isSetCursor: false })
      const x = this.curElement!.x! * this.options.scale
      const y = this.curElement!.y! * this.options.scale
      this.resizerDom.style.left = `${x}px`
      this.resizerDom.style.top = `${y}px`
      this.resizerDom.style.width = `${this.curElement!.width}px`
      this.resizerDom.style.height = `${this.curElement!.height}px`
    }
  }
  public render(ctx: CanvasRenderingContext2D, element: IRowElement) {
    ctx.save()
    this._drawContent(ctx, element)
    this._drawBorder(
      ctx,
      element,
      element.x!,
      element.y!,
      element.borderColor,
      element.borderWidth
    )
    ctx.restore()
  }
  public showControl(element: IElement) {
    const x = element.x! * this.options.scale
    const y = element.y! * this.options.scale
    this.resizerDom.classList.add('show')
    this.resizerDom.style.left = `${x}px`
    this.resizerDom.style.top = `${y}px`
    this.resizerDom.style.width = `${element.width}px`
    this.resizerDom.style.height = `${element.height}px`
    this.curElement = element
    this.curElementIndex = this.draw
      .getElementList()
      .findIndex(i => i.id === element.id)
    this.resizerDom.ondblclick = this._dbclick.bind(this)
  }
  public hideControl() {
    if (this.editing) {
      return
    }
    this.curElement = null
    this.resizerDom.ondblclick = null
    this.resizerDom.classList.remove('show')
    this.resizerDom.innerHTML = ''
  }
}
