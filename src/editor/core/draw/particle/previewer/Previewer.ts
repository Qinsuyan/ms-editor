import { EDITOR_PREFIX } from '../../../../dataset/constant/Editor'
import { EditorMode } from '../../../../dataset/enum/Editor'
import { ElementType } from '../../../../dataset/enum/Element'
import { IEditorOption } from '../../../../interface/Editor'
import { IElement, IElementPosition } from '../../../../interface/Element'
import {
  IPreviewerCreateResult,
  IPreviewerDrawOption
} from '../../../../interface/Previewer'
import { downloadFile } from '../../../../utils'
import { Draw } from '../../Draw'

export class Previewer {
  private container: HTMLDivElement
  private canvas: HTMLCanvasElement
  private draw: Draw
  private options: Required<IEditorOption>
  private curElement: IElement | null
  private curElementSrc: string
  private previewerDrawOption: IPreviewerDrawOption
  private curPosition: IElementPosition | null
  // 拖拽改变尺寸
  private resizerSelection: HTMLDivElement
  private resizerHandleList: HTMLDivElement[]
  private resizerImageContainer: HTMLDivElement
  private resizerImage: HTMLImageElement
  private resizerSize: HTMLSpanElement

  //Graph的resizer
  private graphResizerSelection: HTMLDivElement
  private graphResizerHandleList: HTMLDivElement[]

  private width: number
  private height: number
  private mousedownX: number
  private mousedownY: number
  private curHandleIndex: number
  // 预览选区
  private previewerContainer: HTMLDivElement | null
  private previewerImage: HTMLImageElement | null

  constructor(draw: Draw) {
    this.container = draw.getContainer()
    this.canvas = draw.getPage()
    this.draw = draw
    this.options = draw.getOptions()
    this.curElement = null
    this.curElementSrc = ''
    this.previewerDrawOption = {}
    this.curPosition = null
    // 图片尺寸缩放
    const {
      resizerSelection,
      resizerHandleList,
      resizerImageContainer,
      resizerImage,
      resizerSize
    } = this._createResizerDom()
    const { graphResizerHandleList, graphResizerSelection } =
      this._createGraphResizerDom()
    this.graphResizerHandleList = graphResizerHandleList
    this.graphResizerSelection = graphResizerSelection
    this.resizerSelection = resizerSelection
    this.resizerHandleList = resizerHandleList
    this.resizerImageContainer = resizerImageContainer
    this.resizerImage = resizerImage
    this.resizerSize = resizerSize
    this.width = 0
    this.height = 0
    this.mousedownX = 0
    this.mousedownY = 0
    this.curHandleIndex = 0 // 默认右下角
    this.previewerContainer = null
    this.previewerImage = null
  }

  private _getElementPosition(
    element: IElement,
    position: IElementPosition | null = null
  ): { x: number; y: number } {
    let x = 0
    let y = 0
    const height = this.draw.getHeight()
    const pageGap = this.draw.getPageGap()
    const preY = this.draw.getPageNo() * (height + pageGap)
    // 优先使用浮动位置
    if (element.imgFloatPosition) {
      x = element.imgFloatPosition.x!
      y = element.imgFloatPosition.y + preY
    } else if (position) {
      const {
        coordinate: {
          leftTop: [left, top]
        },
        ascent
      } = position
      x = left
      y = top + preY + ascent
    }
    return { x, y }
  }

  private _createResizerDom(): IPreviewerCreateResult {
    // 拖拽边框
    const resizerSelection = document.createElement('div')
    resizerSelection.classList.add(`${EDITOR_PREFIX}-resizer-selection`)
    resizerSelection.style.display = 'none'
    resizerSelection.style.borderColor = this.options.resizerColor
    // 拖拽点
    const resizerHandleList: HTMLDivElement[] = []
    for (let i = 0; i < 8; i++) {
      const handleDom = document.createElement('div')
      handleDom.style.background = this.options.resizerColor
      handleDom.classList.add(`resizer-handle`)
      handleDom.classList.add(`handle-${i}`)
      handleDom.setAttribute('data-index', String(i))
      handleDom.onmousedown = this._mousedown.bind(this)
      resizerSelection.append(handleDom)
      resizerHandleList.push(handleDom)
    }
    this.container.append(resizerSelection)
    // 尺寸查看
    const resizerSizeView = document.createElement('div')
    resizerSizeView.classList.add(`${EDITOR_PREFIX}-resizer-size-view`)
    const resizerSize = document.createElement('span')
    resizerSizeView.append(resizerSize)
    resizerSelection.append(resizerSizeView)
    // 拖拽镜像
    const resizerImageContainer = document.createElement('div')
    resizerImageContainer.classList.add(`${EDITOR_PREFIX}-resizer-image`)
    resizerImageContainer.style.display = 'none'
    const resizerImage = document.createElement('img')
    resizerImageContainer.append(resizerImage)
    this.container.append(resizerImageContainer)
    return {
      resizerSelection,
      resizerHandleList,
      resizerImageContainer,
      resizerImage,
      resizerSize
    }
  }

  private _createGraphResizerDom(): {
    graphResizerSelection: HTMLDivElement
    graphResizerHandleList: HTMLDivElement[]
  } {
    const graphResizerSelection = document.createElement('div')
    graphResizerSelection.classList.add(
      `${EDITOR_PREFIX}-graph-resizer-selection`
    )
    graphResizerSelection.onmousedown = this._mousedown.bind(this)
    const graphResizerHandleList: HTMLDivElement[] = []
    for (let i = 0; i < 2; i++) {
      const handleDom = document.createElement('div')
      handleDom.style.background = this.options.resizerColor
      handleDom.classList.add(`graph-resizer-handle`)
      handleDom.classList.add(`graph-handle-${i}`)
      handleDom.setAttribute('data-index', String(i))
      handleDom.onmousedown = this._mousedown.bind(this)
      graphResizerSelection.append(handleDom)
      graphResizerHandleList.push(handleDom)
    }
    this.container.append(graphResizerSelection)
    return {
      graphResizerSelection,
      graphResizerHandleList
    }
  }

  private _keydown = () => {
    // 有键盘事件触发时，主动销毁拖拽选区
    if (
      this.resizerSelection.style.display === 'block' ||
      this.graphResizerSelection.style.display === 'block'
    ) {
      this.clearResizer()
      document.removeEventListener('keydown', this._keydown)
    }
  }

  private _mousedown(evt: MouseEvent) {
    this.canvas = this.draw.getPage()
    if (!this.curElement) {
      return
    }
    evt.preventDefault()
    const { scale } = this.options
    this.mousedownX = evt.x
    this.mousedownY = evt.y
    const target = evt.target as HTMLDivElement
    this.curHandleIndex = Number(target.dataset.index)
    // 改变光标
    const cursor = window.getComputedStyle(target).cursor
    document.body.style.cursor = cursor
    this.canvas.style.cursor = cursor
    if (this.curElement.type !== ElementType.GRAPH) {
      // 拖拽图片镜像
      this.resizerImage.src = this.curElementSrc
      this.resizerImageContainer.style.display = 'block'
      // 优先使用浮动位置信息
      const { x: resizerLeft, y: resizerTop } = this._getElementPosition(
        this.curElement,
        this.curPosition
      )
      this.resizerImageContainer.style.left = `${resizerLeft}px`
      this.resizerImageContainer.style.top = `${resizerTop}px`
      this.resizerImage.style.width = `${this.curElement.width! * scale}px`
      this.resizerImage.style.height = `${this.curElement.height! * scale}px`
      // 追加全局事件
      const mousemoveFn = this._mousemove.bind(this)
      document.addEventListener('mousemove', mousemoveFn)
      document.addEventListener(
        'mouseup',
        () => {
          // 改变尺寸
          if (this.curElement) {
            this.curElement.width = this.width
            this.curElement.height = this.height
            this.draw.render({ isSetCursor: false })
            this.drawResizer(
              this.curElement,
              this.curPosition,
              this.previewerDrawOption
            )
          }
          // 还原副作用
          this.resizerImageContainer.style.display = 'none'
          document.removeEventListener('mousemove', mousemoveFn)
          document.body.style.cursor = ''
          this.canvas.style.cursor = 'text'
        },
        {
          once: true
        }
      )
    } else {
      const mousemoveFn = this._mousemove.bind(this)
      document.addEventListener('mousemove', mousemoveFn)
      document.addEventListener(
        'mouseup',
        () => {
          // 改变尺寸
          // if (this.curElement) {
          //   this.curElement.width = this.width
          //   this.curElement.height = this.height
          //   this.draw.render({ isSetCursor: false })
          //   this.drawResizer(
          //     this.curElement,
          //     this.curPosition,
          //     this.previewerDrawOption
          //   )
          // }
          // // 还原副作用
          // this.resizerImageContainer.style.display = 'none'
          document.removeEventListener('mousemove', mousemoveFn)
          document.body.style.cursor = ''
          this.canvas.style.cursor = 'text'
        },
        {
          once: true
        }
      )
    }
  }

  private _mousemove(evt: MouseEvent) {
    if (!this.curElement) return
    const { scale } = this.options
    let dx = 0
    let dy = 0
    evt.preventDefault()
    if (this.curElement.type !== ElementType.GRAPH) {
      switch (this.curHandleIndex) {
        case 0:
          {
            const offsetX = this.mousedownX - evt.x
            const offsetY = this.mousedownY - evt.y
            dx = Math.cbrt(offsetX ** 3 + offsetY ** 3)
            dy = (this.curElement.height! * dx) / this.curElement.width!
          }
          break
        case 1:
          dy = this.mousedownY - evt.y
          break
        case 2:
          {
            const offsetX = evt.x - this.mousedownX
            const offsetY = this.mousedownY - evt.y
            dx = Math.cbrt(offsetX ** 3 + offsetY ** 3)
            dy = (this.curElement.height! * dx) / this.curElement.width!
          }
          break
        case 4:
          {
            const offsetX = evt.x - this.mousedownX
            const offsetY = evt.y - this.mousedownY
            dx = Math.cbrt(offsetX ** 3 + offsetY ** 3)
            dy = (this.curElement.height! * dx) / this.curElement.width!
          }
          break
        case 3:
          dx = evt.x - this.mousedownX
          break
        case 5:
          dy = evt.y - this.mousedownY
          break
        case 6:
          {
            const offsetX = this.mousedownX - evt.x
            const offsetY = evt.y - this.mousedownY
            dx = Math.cbrt(offsetX ** 3 + offsetY ** 3)
            dy = (this.curElement.height! * dx) / this.curElement.width!
          }
          break
        case 7:
          dx = this.mousedownX - evt.x
          break
      }
      // 图片实际宽高（变化大小除掉缩放比例）
      const dw = this.curElement.width! + dx / scale
      const dh = this.curElement.height! + dy / scale
      if (dw <= 0 || dh <= 0) return
      this.width = dw
      this.height = dh
      // 图片显示宽高
      const elementWidth = dw * scale
      const elementHeight = dh * scale
      // 更新影子图片尺寸
      this.resizerImage.style.width = `${elementWidth}px`
      this.resizerImage.style.height = `${elementHeight}px`
      // 更新预览包围框尺寸
      this._updateResizerRect(elementWidth, elementHeight)
      // 尺寸预览
      this._updateResizerSizeView(elementWidth, elementHeight)
    } else {
      dx = evt.x - this.mousedownX
      dy = evt.y - this.mousedownY
      this.mousedownX = evt.x
      this.mousedownY = evt.y
      if (isNaN(this.curHandleIndex)) {
        //整体移动
        this.curElement.startX! += dx / scale
        this.curElement.endX! += dx / scale
        this.curElement.startY! += dy / scale
        this.curElement.endY! += dy / scale
      } else {
        //端点
        if (this.curHandleIndex === 0) {
          //start
          this.curElement.startX! += dx / scale
          this.curElement.startY! += dy / scale
        } else {
          //end
          this.curElement.endX! += dx / scale
          this.curElement.endY! += dy / scale
        }
      }
      this.drawResizer(
        this.curElement,
        this.curPosition,
        this.previewerDrawOption
      )
      this.draw.render({ isSetCursor: false })
    }
  }

  private _drawPreviewer() {
    const previewerContainer = document.createElement('div')
    previewerContainer.classList.add(`${EDITOR_PREFIX}-image-previewer`)
    // 关闭按钮
    const closeBtn = document.createElement('i')
    closeBtn.classList.add('image-close')
    closeBtn.onclick = () => {
      this._clearPreviewer()
    }
    previewerContainer.append(closeBtn)
    // 图片
    const imgContainer = document.createElement('div')
    imgContainer.classList.add(`${EDITOR_PREFIX}-image-container`)
    const img = document.createElement('img')
    img.src = this.curElementSrc
    img.draggable = false
    imgContainer.append(img)
    this.previewerImage = img
    previewerContainer.append(imgContainer)
    // 操作栏
    let x = 0
    let y = 0
    let scaleSize = 1
    let rotateSize = 0
    const menuContainer = document.createElement('div')
    menuContainer.classList.add(`${EDITOR_PREFIX}-image-menu`)
    const zoomIn = document.createElement('i')
    zoomIn.classList.add('zoom-in')
    zoomIn.onclick = () => {
      scaleSize += 0.1
      this._setPreviewerTransform(scaleSize, rotateSize, x, y)
    }
    menuContainer.append(zoomIn)
    const zoomOut = document.createElement('i')
    zoomOut.onclick = () => {
      if (scaleSize - 0.1 <= 0.1) return
      scaleSize -= 0.1
      this._setPreviewerTransform(scaleSize, rotateSize, x, y)
    }
    zoomOut.classList.add('zoom-out')
    menuContainer.append(zoomOut)
    const rotate = document.createElement('i')
    rotate.classList.add('rotate')
    rotate.onclick = () => {
      rotateSize += 1
      this._setPreviewerTransform(scaleSize, rotateSize, x, y)
    }
    menuContainer.append(rotate)
    const originalSize = document.createElement('i')
    originalSize.classList.add('original-size')
    originalSize.onclick = () => {
      x = 0
      y = 0
      scaleSize = 1
      rotateSize = 0
      this._setPreviewerTransform(scaleSize, rotateSize, x, y)
    }
    menuContainer.append(originalSize)
    const imageDownload = document.createElement('i')
    imageDownload.classList.add('image-download')
    imageDownload.onclick = () => {
      const { mime } = this.previewerDrawOption
      downloadFile(img.src, `${this.curElement?.id}.${mime || 'png'}`)
    }
    menuContainer.append(imageDownload)
    previewerContainer.append(menuContainer)
    this.previewerContainer = previewerContainer
    document.body.append(previewerContainer)
    // 拖拽调整位置
    let startX = 0
    let startY = 0
    let isAllowDrag = false
    img.onmousedown = evt => {
      isAllowDrag = true
      startX = evt.x
      startY = evt.y
      previewerContainer.style.cursor = 'move'
    }
    previewerContainer.onmousemove = (evt: MouseEvent) => {
      if (!isAllowDrag) return
      x += evt.x - startX
      y += evt.y - startY
      startX = evt.x
      startY = evt.y
      this._setPreviewerTransform(scaleSize, rotateSize, x, y)
    }
    previewerContainer.onmouseup = () => {
      isAllowDrag = false
      previewerContainer.style.cursor = 'auto'
    }
    previewerContainer.onwheel = evt => {
      evt.preventDefault()
      if (evt.deltaY < 0) {
        // 放大
        scaleSize += 0.1
      } else {
        // 缩小
        if (scaleSize - 0.1 <= 0.1) return
        scaleSize -= 0.1
      }
      this._setPreviewerTransform(scaleSize, rotateSize, x, y)
    }
  }

  public _setPreviewerTransform(
    scale: number,
    rotate: number,
    x: number,
    y: number
  ) {
    if (!this.previewerImage) return
    this.previewerImage.style.left = `${x}px`
    this.previewerImage.style.top = `${y}px`
    this.previewerImage.style.transform = `scale(${scale}) rotate(${
      rotate * 90
    }deg)`
  }

  private _clearPreviewer() {
    this.previewerContainer?.remove()
    this.previewerContainer = null
    document.body.style.overflow = 'auto'
  }

  public _updateResizerRect(width: number, height: number) {
    const handleSize = this.options.resizerSize
    this.resizerSelection.style.width = `${width}px`
    this.resizerSelection.style.height = `${height}px`
    // handle
    for (let i = 0; i < 8; i++) {
      const left =
        i === 0 || i === 6 || i === 7
          ? -handleSize
          : i === 1 || i === 5
          ? width / 2
          : width - handleSize
      const top =
        i === 0 || i === 1 || i === 2
          ? -handleSize
          : i === 3 || i === 7
          ? height / 2 - handleSize
          : height - handleSize
      this.resizerHandleList[i].style.left = `${left}px`
      this.resizerHandleList[i].style.top = `${top}px`
    }
  }

  public _updateGraphResizerRect(width: number, height: number) {
    if (!this.curElement) {
      return
    }
    const handleSize = this.options.resizerSize
    this.graphResizerSelection.style.width = `${width}px`
    this.graphResizerSelection.style.height = `${height}px`
    let direction = 0
    if (this.curElement.startX! < this.curElement.endX!) {
      if (this.curElement.startY! < this.curElement.endY!) {
        direction = 4
      } else {
        direction = 1
      }
    } else {
      if (this.curElement.startY! < this.curElement.endY!) {
        direction = 3
      } else {
        direction = 2
      }
    }
    // handle
    // for (let i = 0; i < 2; i++) {
    //   const left = i === 0 ? -handleSize : width - handleSize
    //   const top = i === 0 ? -handleSize : height - handleSize
    //   this.graphResizerHandleList[i].style.left = `${left}px`
    //   this.graphResizerHandleList[i].style.top = `${top}px`
    // }
    switch (direction) {
      case 1: {
        this.graphResizerHandleList[0].style.left = `${-handleSize}px`
        this.graphResizerHandleList[0].style.top = `${height - handleSize}px`
        this.graphResizerHandleList[1].style.left = `${width - handleSize}px`
        this.graphResizerHandleList[1].style.top = `${-handleSize}px`
        break
      }
      case 2: {
        this.graphResizerHandleList[0].style.left = `${width - handleSize}px`
        this.graphResizerHandleList[0].style.top = `${height - handleSize}px`
        this.graphResizerHandleList[1].style.left = `${-handleSize}px`
        this.graphResizerHandleList[1].style.top = `${-handleSize}px`
        break
      }
      case 3: {
        this.graphResizerHandleList[0].style.left = `${width - handleSize}px`
        this.graphResizerHandleList[0].style.top = `${-handleSize}px`
        this.graphResizerHandleList[1].style.left = `${-handleSize}px`
        this.graphResizerHandleList[1].style.top = `${height - handleSize}px`
        break
      }
      case 4: {
        this.graphResizerHandleList[0].style.left = `${-handleSize}px`
        this.graphResizerHandleList[0].style.top = `${-handleSize}px`
        this.graphResizerHandleList[1].style.left = `${width - handleSize}px`
        this.graphResizerHandleList[1].style.top = `${height - handleSize}px`
        break
      }
    }
  }

  public _updateResizerSizeView(width: number, height: number) {
    this.resizerSize.innerText = `${Math.round(width)} × ${Math.round(height)}`
  }

  public render() {
    this._drawPreviewer()
    document.body.style.overflow = 'hidden'
  }

  public drawResizer(
    element: IElement,
    position: IElementPosition | null = null,
    options: IPreviewerDrawOption = {}
  ) {
    if (
      this.draw.getOptions().mode === EditorMode.PRINT &&
      element.type !== ElementType.GRAPH &&
      element.type !== ElementType.TEXTBOX
    ) {
      return
    }
    this.previewerDrawOption = options

    const { scale } = this.options
    const elementWidth = element.width! * scale
    const elementHeight = element.height! * scale
    // 尺寸预览
    if (element.type !== ElementType.GRAPH) {
      this._updateResizerSizeView(elementWidth, elementHeight)
      this.resizerSelection.style.opacity = '1'
      this.resizerSelection.style.pointerEvents = 'all'
      this.graphResizerSelection.style.opacity = '0'
      this.graphResizerSelection.style.pointerEvents = 'none'
      // 优先使用浮动位置信息
      const { x: resizerLeft, y: resizerTop } = this._getElementPosition(
        element,
        position
      )
      this.resizerSelection.style.left = `${resizerLeft}px`
      this.resizerSelection.style.top = `${resizerTop}px`
      // 更新预览包围框尺寸
      this._updateResizerRect(elementWidth, elementHeight)
      this.resizerSelection.style.display = 'block'
      this.curElement = element
      this.curElementSrc = element[options.srcKey || 'value'] || ''
      this.curPosition = position
      this.width = this.curElement.width! * scale
      this.height = this.curElement.height! * scale
      document.addEventListener('keydown', this._keydown)
    } else {
      this.resizerSelection.style.opacity = '0'
      this.resizerSelection.style.pointerEvents = 'none'
      this.graphResizerSelection.style.opacity = '1'
      this.graphResizerSelection.style.pointerEvents = 'all'
      const { x: resizerLeft, y: resizerTop } = this._getElementPosition(
        element,
        position
      )
      this.graphResizerSelection.style.left = `${resizerLeft}px`
      this.graphResizerSelection.style.top = `${resizerTop}px`
      this.graphResizerSelection.style.display = 'block'
      this.curElement = element
      this.curElementSrc = element[options.srcKey || 'value'] || ''
      this.curPosition = position
      this.width = this.curElement.width! * scale
      this.height = this.curElement.height! * scale
      this._updateGraphResizerRect(elementWidth, elementHeight)
      document.addEventListener('keydown', this._keydown)
    }
  }

  public clearResizer() {
    this.resizerSelection.style.display = 'none'
    this.graphResizerSelection.style.display = 'none'
    document.removeEventListener('keydown', this._keydown)
  }
}
