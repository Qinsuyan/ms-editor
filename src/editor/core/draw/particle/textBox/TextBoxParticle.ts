import { KeyMap } from '../../../../dataset/enum/KeyMap'
import { IEditorOption } from '../../../../interface/Editor'
import { IElement } from '../../../../interface/Element'
import { Draw } from '../../Draw'

export class TextBoxParticle {
  private draw: Draw
  private options: Required<IEditorOption>
  private resizerDom: HTMLDivElement
  private container: HTMLDivElement
  private curElement: IElement | null
  private editing: boolean
  private mouseStart: { x: number; y: number } | null
  private curElementIndex: number
  private fakePosition: { x: number; y: number } | null
  private mousemoveHandler: ((evt: MouseEvent) => void) | null
  private mouseupHandler: ((evt: MouseEvent) => void) | null
  private clearActiveHandler: ((evt: MouseEvent) => void) | null
  constructor(draw: Draw) {
    this.container = draw.getContainer()
    this.draw = draw
    this.options = draw.getOptions()
    this.resizerDom = document.createElement('div')
    this.resizerDom.tabIndex = 2
    this.resizerDom.title = '双击编辑'
    this.resizerDom.classList.add('textbox-resizer-dom')
    this.container.append(this.resizerDom)
    this.curElement = null
    this.editing = false
    this.mouseStart = null
    this.curElementIndex = -1
    this.fakePosition = null
    this.resizerDom.addEventListener('mousedown', this._mousedown.bind(this))
    this.resizerDom.addEventListener('keydown', this._keydownHandler.bind(this))
    this.mousemoveHandler = null
    this.mouseupHandler = null
    this.clearActiveHandler = null
  }
  private _keydownHandler(evt: KeyboardEvent) {
    if (evt.key === KeyMap.Backspace) {
      //删除
      if (this.curElementIndex > -1) {
        this.editing = false
        this.mousemoveHandler = null
        this.resizerDom.classList.remove('active')
        this.hideControl()
        this.draw.spliceElementList(
          this.draw.getElementList(),
          this.curElementIndex,
          1
        )
        this.draw.render({ isSetCursor: false })
      }
    }
  }
  private _mousedown(evt: MouseEvent) {
    evt.stopPropagation()
    //if (this.curElement && this.options.mode === EditorMode.EDIT) {
    if (this.curElement) {
      this.resizerDom.classList.add('active')
      this.fakePosition = { x: this.curElement.x!, y: this.curElement.y! }
      this.mouseStart = { x: evt.clientX, y: evt.clientY }
      this.mousemoveHandler = this._mousemove.bind(this)
      this.mouseupHandler = this._mouseleave.bind(this)
      this.clearActiveHandler = this._clearActive.bind(this)
      document.body.addEventListener('mousemove', this.mousemoveHandler)
      document.body.addEventListener('mouseup', this.mouseupHandler)
      document.body.addEventListener('click', this.clearActiveHandler)
    }
  }
  private _clearActive(evt: MouseEvent) {
    if (
      (evt.target as HTMLDivElement)?.classList?.contains('textbox-resizer-dom')
    ) {
      return
    }
    this.resizerDom.classList.remove('active')
    if (this.clearActiveHandler) {
      document.body.removeEventListener('click', this.clearActiveHandler)
      this.clearActiveHandler = null
    }
  }
  private _mousemove(evt: MouseEvent) {
    if (!this.mouseStart) {
      return
    }
    if (!this.curElement) {
      return
    }
    if (this.fakePosition) {
      this.fakePosition.x +=
        (evt.clientX - this.mouseStart.x) / this.options.scale
      this.fakePosition.y! +=
        (evt.clientY - this.mouseStart.y) / this.options.scale
      this.mouseStart.x = evt.clientX
      this.mouseStart.y = evt.clientY
      //移动control
      const x =
        (this.fakePosition.x! - this.curElement.borderWidth! / 2) *
        this.options.scale
      const len = this.curElement.value.split(/[\n|\t]+/gi).length
      const y =
        (this.fakePosition.y! - this.curElement.borderWidth! / 2) *
          this.options.scale -
        (this.curElement.height! - this.curElement.borderWidth!) / len / 2
      this.resizerDom.style.left = `${x}px`
      this.resizerDom.style.top = `${y}px`
    }
  }
  private _mouseleave() {
    if (this.mousemoveHandler) {
      document.body.removeEventListener('mousemove', this.mousemoveHandler)
      this.mousemoveHandler = null
    }
    if (this.mouseupHandler) {
      document.body.removeEventListener('mouseup', this.mouseupHandler)
      this.mouseupHandler = null
    }
    if (this.curElement && this.fakePosition) {
      this.curElement.x = this.fakePosition.x
      this.curElement.y = this.fakePosition.y
      this.fakePosition = null
    }
    if (this.curElementIndex > -1) {
      this.draw.render({ curIndex: this.curElementIndex, isSetCursor: false })
    }
  }
  private _drawBorder(
    ctx: CanvasRenderingContext2D,
    element: IElement,
    x: number,
    y: number,
    color: string | undefined,
    lineWidth: number | undefined
  ) {
    const { scale } = this.options
    const metrics = {
      width: 0,
      height: 0,
      length: 1
    }
    ctx.save()
    ctx.textBaseline = 'middle'
    // if (!element.value) {
    //   ctx.font = element.style
    //   ctx.fillStyle = '#CCC'
    // } else {
    //   ctx.font = element.style
    //   ctx.fillStyle = element.color || this.options.defaultColor
    // }
    ctx.font = `${element.italic ? 'italic' : ''} ${
      element.bold ? 'bold' : ''
    } ${(element.size || 12) * scale}px ${element.font || 'sans-serif'}`
    ctx.fillStyle = element.color || '#000'
    if (!color || !lineWidth) {
      ctx.restore()
      return
    }
    ctx.strokeStyle = color
    ctx.lineWidth = lineWidth
    if (!element.value?.length) {
      const m = ctx.measureText('请输入文本框内容')
      metrics.width =
        m.actualBoundingBoxLeft + m.actualBoundingBoxRight + lineWidth!
      metrics.height =
        m.fontBoundingBoxAscent + m.fontBoundingBoxDescent + lineWidth!
    } else {
      const lines = element.value.split(/[\n|\t]+/gi)
      metrics.length = lines.length
      lines.forEach(line => {
        const m = ctx.measureText(line)
        if (
          m.actualBoundingBoxLeft + m.actualBoundingBoxRight >
          metrics.width
        ) {
          metrics.width = m.actualBoundingBoxLeft + m.actualBoundingBoxRight
        }
        metrics.height += m.fontBoundingBoxAscent + m.fontBoundingBoxDescent
      })
      metrics.width += lineWidth!
      metrics.height = metrics.height * 1.2 + lineWidth!
    }
    element.width = metrics.width
    element.height = metrics.height
    element.imgFloatPosition = {
      x: element.x! * scale,
      y: element.y! * scale
    }
    ctx.strokeRect(
      (x - lineWidth / 2) * scale,
      (y - lineWidth / 2) * scale -
        (metrics.height - lineWidth) / metrics.length / 2,
      metrics.width,
      metrics.height
    )
    ctx.restore()
  }
  private _drawContent(ctx: CanvasRenderingContext2D, element: IElement) {
    const { scale } = this.options
    const metrics = {
      width: 0,
      height: 0
    }
    ctx.save()
    ctx.textBaseline = 'middle'
    //if (!element.value) {
    ctx.font = `${element.italic ? 'italic' : ''} ${
      element.bold ? 'bold' : ''
    } ${(element.size || 12) * scale}px ${element.font || 'sans-serif'}`

    ctx.fillStyle = element.color || '#000'
    // } else {
    //   ctx.font = element.style
    //   ctx.fillStyle = element.color || this.options.defaultColor
    // }
    if (!element.value?.length) {
      const m = ctx.measureText('请输入文本框内容')
      metrics.width = m.actualBoundingBoxLeft + m.actualBoundingBoxRight
      metrics.height = m.fontBoundingBoxAscent + m.fontBoundingBoxDescent
    } else {
      const m = ctx.measureText(element.value)
      metrics.width = m.actualBoundingBoxLeft + m.actualBoundingBoxRight
      metrics.height = m.fontBoundingBoxAscent + m.fontBoundingBoxDescent
    }

    const val = element.value || '请输入文本框内容'
    const height = metrics.height
    const lines = val.split(/[\n|\t]+/gi)
    lines.forEach((line, index) => {
      ctx.fillText(
        line,
        element.x! * scale,
        element.y! * scale + index * 1.2 * height!
      )
    })
    ctx.restore()
  }
  private _dbclick() {
    if (!this.curElement) {
      return
    }
    const listener = this.draw.getTextBoxEditStartListener()
    if (listener) {
      listener(this.curElement.value, (val, styles) => {
        if (this.curElement) {
          this.curElement.value = val
          if (styles?.borderOption) {
            if (styles.borderOption.show) {
              if (styles.borderOption.borderWidth) {
                this.curElement.borderWidth =
                  styles.borderOption.borderWidth > 1
                    ? styles.borderOption.borderWidth
                    : 1
              }
              if (styles.borderOption.borderColor) {
                if (
                  /^#(?:[0-9a-fA-F]{3}){1,2}$/gi.test(
                    styles.borderOption.borderColor
                  )
                ) {
                  this.curElement.borderColor = styles.borderOption.borderColor
                }
              }
            } else {
              this.curElement.borderWidth = 1
              this.curElement.borderColor = 'transparent'
            }
          }
          if (styles?.font) {
            if (styles.font.italic !== undefined) {
              this.curElement.italic = styles.font.italic
            }
            if (styles.font.bold !== undefined) {
              this.curElement.bold = styles.font.bold
            }
            if (styles.font.fontColor !== undefined) {
              this.curElement.color = styles.font.fontColor
            }
            if (styles.font.fontSize !== undefined) {
              this.curElement.size = styles.font.fontSize
            }
            if (styles.font.fontFamily !== undefined) {
              this.curElement.font = styles.font.fontFamily
            }
          }
          this.draw.render({
            isSetCursor: false,
            curIndex: this.curElementIndex
          })
        }
      })
    }
  }
  public render(
    ctx: CanvasRenderingContext2D,
    element: IElement,
    elementX: number,
    elementY: number
  ) {
    this._drawContent(ctx, element)
    this._drawBorder(
      ctx,
      element,
      elementX!,
      elementY!,
      element.borderColor,
      element.borderWidth
    )
    const x = (elementX! - element.borderWidth! / 2) * this.options.scale
    const len = element.value.split(/[\n|\t]+/gi).length
    const y =
      (elementY! - element.borderWidth! / 2) * this.options.scale -
      (element.height! - element.borderWidth!) / len / 2
    this.resizerDom.style.left = `${x}px`
    this.resizerDom.style.top = `${y}px`
    this.resizerDom.style.width = `${element.width}px`
    this.resizerDom.style.height = `${element.height}px`
  }
  public showControl(element: IElement) {
    // if (this.options.mode !== EditorMode.EDIT) {
    //   return
    // }
    const x = (element.x! - element.borderWidth! / 2) * this.options.scale
    const len = element.value.split(/[\n|\t]+/gi).length
    const y =
      (element.y! - element.borderWidth! / 2) * this.options.scale -
      (element.height! - element.borderWidth!) / len / 2
    this.resizerDom.classList.add('hover')
    this.resizerDom.style.left = `${x}px`
    this.resizerDom.style.top = `${y}px`
    this.resizerDom.style.width = `${element.width}px`
    this.resizerDom.style.height = `${element.height}px`
    this.curElement = element
    this.curElementIndex = this.draw
      .getElementList()
      .findIndex(e => e.id === element.id)
    this.resizerDom.ondblclick = this._dbclick.bind(this)
  }
  public hideControl() {
    if (this.editing) {
      return
    }
    if (this.mousemoveHandler) {
      return
    }
    this.curElement = null
    this.resizerDom.ondblclick = null
    this.resizerDom.classList.remove('show')
    this.resizerDom.classList.remove('hover')
    this.resizerDom.innerHTML = ''
  }
}
