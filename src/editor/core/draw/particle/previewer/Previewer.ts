import { EDITOR_PREFIX } from '../../../../dataset/constant/Editor'
import { ElementType } from '../../../../dataset/enum/Element'
import { IEditorOption, IMarkType } from '../../../../interface/Editor'
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
  private width: number
  private height: number
  private mousedownX: number
  private mousedownY: number
  private curHandleIndex: number
  // 预览选区
  private previewerContainer: HTMLDivElement | null
  private previewerImage: HTMLImageElement | null
  //marker的canvas
  private markerCanvas: HTMLCanvasElement
  private markerCtx: CanvasRenderingContext2D | null
  private markerCache: {
    start: { x: number; y: number }
    end: { x: number; y: number }
    movingEnd: string
  }

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
    this.markerCanvas = document.createElement('canvas')
    this.markerCtx = null
    this.markerCache = {
      start: { x: 0, y: 0 },
      end: { x: 0, y: 0 },
      movingEnd: ''
    }
  }

  private _getElementPosition(
    element: IElement,
    position: IElementPosition | null = null
  ): { x: number; y: number } {
    let x = 0
    let y = 0
    const height = this.draw.getHeight()
    const pageGap = this.draw.getPageGap()
    const pageNo = position?.pageNo ?? this.draw.getPageNo()
    const preY = pageNo * (height + pageGap)
    // 优先使用浮动位置
    if (element.imgFloatPosition) {
      x = element.imgFloatPosition.x!
      y = element.imgFloatPosition.y + preY
      const handles = document.getElementsByClassName('resizer-handle-default')
      for (let i = 0; i < handles.length; i++) {
        const el = handles.item(i)
        el?.classList.remove('hide')
      }
      const otherHandles = document.getElementsByClassName(
        'resizer-handle-mark'
      )
      for (let i = 0; i < otherHandles.length; i++) {
        const el = otherHandles.item(i)
        el?.classList.add('hide')
      }
      this.markerCanvas.remove()
    } else if (element.start && element.end) {
      x = Math.min(element.start.x, element.end.x)
      y =
        Math.min(element.start.y, element.end.y) +
        (this.draw.getHeight() + this.draw.getPageGap()) * element.pageIndex!
      let direction = ''
      if (element.start.x < element.end.x) {
        if (element.start.y < element.end.y) {
          direction = 'rightdown'
        } else {
          direction = 'rightup'
        }
      } else {
        if (element.start.y < element.end.y) {
          direction = 'leftdown'
        } else {
          direction = 'leftup'
        }
      }
      //Mark元素只保留两个位置
      const handles = document.getElementsByClassName('resizer-handle-mark')
      for (let i = 0; i < handles.length; i++) {
        const el = handles.item(i)
        el?.classList.remove('hide')
        if (i === 0) {
          el?.setAttribute('data-end', 'start')
          //start handle
          if (direction === 'rightup') {
            el?.setAttribute(
              'style',
              'left:0;bottom:0;transform:translateX(-50%) translateY(50%);'
            )
          } else if (direction === 'rightdown') {
            el?.setAttribute(
              'style',
              'left:0;top:0;transform:translateX(-50%) translateY(-50%);'
            )
          } else if (direction === 'leftup') {
            el?.setAttribute(
              'style',
              'right:0;bottom:0;transform:translateX(50%) translateY(50%);'
            )
          } else {
            el?.setAttribute(
              'style',
              'right:0;top:0;transform:translateX(50%) translateY(-50%);'
            )
          }
        } else {
          //end handle
          el?.setAttribute('data-end', 'end')
          if (direction === 'rightup') {
            el?.setAttribute(
              'style',
              'right:0;top:0;transform:translateX(50%) translateY(-50%);'
            )
          } else if (direction === 'rightdown') {
            el?.setAttribute(
              'style',
              'right:0;bottom:0;transform:translateX(50%) translateY(50%);'
            )
          } else if (direction === 'leftup') {
            el?.setAttribute(
              'style',
              'left:0;top:0;transform:translateX(-50%) translateY(-50%);'
            )
          } else {
            el?.setAttribute(
              'style',
              'left:0;bottom:0;transform:translateX(-50%) translateY(50%);'
            )
          }
        }
      }
      const otherHandles = document.getElementsByClassName(
        'resizer-handle-default'
      )
      for (let i = 0; i < otherHandles.length; i++) {
        const el = otherHandles.item(i)
        el?.classList.add('hide')
      }
      this.markerCache.start.x = element.start.x
      this.markerCache.start.y = element.start.y
      this.markerCache.end.x = element.end.x
      this.markerCache.end.y = element.end.y
      const parent = this.draw.getPage().parentElement!
      const width = this.draw.getCanvasWidth()
      const height = this.draw.getCanvasHeight()
      this.markerCanvas!.width = width
      this.markerCanvas!.height = height
      this.markerCanvas.style.pointerEvents = 'none'
      this.markerCanvas!.style.width = this.draw.getWidth() + 'px'
      this.markerCanvas!.style.height = this.draw.getHeight() + 'px'
      this.markerCanvas!.style.position = 'absolute'
      this.markerCanvas!.style.top =
        (this.draw.getHeight() + this.draw.getPageGap()) * element.pageIndex! +
        'px'
      this.markerCanvas!.style.height = this.draw.getHeight() + 'px'
      this.markerCanvas!.style.left = '0'
      this.markerCanvas!.style.right = '0'
      parent.appendChild(this.markerCanvas!)
      const ctx = this.markerCanvas!.getContext('2d')!
      const dpr = this.draw.getPagePixelRatio()
      ctx.scale(dpr, dpr)
      // 重置以下属性是因部分浏览器(chrome)会应用css样式
      ctx.letterSpacing = '0px'
      ctx.wordSpacing = '0px'
      ctx.direction = 'ltr'
      ctx.clearRect(0, 0, width, height)
      ctx.fillStyle = 'rgba(255,255,255,0.7)'
      ctx.fillRect(0, 0, width, height)
      ctx.lineWidth = 2
      ctx.strokeStyle = 'red'
      ctx.beginPath()
      ctx.moveTo(
        element.start!.x * this.draw.getOptions().scale,
        element.start!.y * this.draw.getOptions().scale
      )
      ctx.lineTo(
        element.end!.x * this.draw.getOptions().scale,
        element.end!.y * this.draw.getOptions().scale
      )
      if(element.markType === IMarkType.ARROW){
          // 箭头长度
          const arrowLength = 15
          // 箭头角度（30度转为弧度）
          const angle = Math.PI / 6
          // 计算直线的角度
          const lineAngle = Math.atan2(element.end.y - element.start.y, element.end.x - element.start.x)
          // 计算箭头两侧的点
          const arrowPoint1 = {
            x: element.end.x - arrowLength * Math.cos(lineAngle - angle),
            y: element.end.y - arrowLength * Math.sin(lineAngle - angle)
          }
          const arrowPoint2 = {
            x:element. end.x - arrowLength * Math.cos(lineAngle + angle),
            y: element.end.y - arrowLength * Math.sin(lineAngle + angle)
          }
          // 绘制箭头的两条短线
          ctx.moveTo(element.end.x, element.end.y)
          ctx.lineTo(arrowPoint1.x, arrowPoint1.y)
          ctx.moveTo(element.end.x, element.end.y)
          ctx.lineTo(arrowPoint2.x, arrowPoint2.y)
        
      }
      ctx.stroke()
      this.markerCtx = ctx
    } else if (position) {
      this.markerCanvas.remove()
      const handles = document.getElementsByClassName('resizer-handle-default')
      for (let i = 0; i < handles.length; i++) {
        const el = handles.item(i)
        el?.classList.remove('hide')
      }
      const otherHandles = document.getElementsByClassName(
        'resizer-handle-mark'
      )
      for (let i = 0; i < otherHandles.length; i++) {
        const el = otherHandles.item(i)
        el?.classList.add('hide')
      }
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
    const { scale } = this.options
    // 拖拽边框
    const resizerSelection = document.createElement('div')
    resizerSelection.classList.add(`${EDITOR_PREFIX}-resizer-selection`)
    resizerSelection.style.display = 'none'
    resizerSelection.style.borderColor = this.options.resizerColor
    resizerSelection.style.borderWidth = `${scale}px`
    // 拖拽点
    const resizerHandleList: HTMLDivElement[] = []
    for (let i = 0; i < 10; i++) {
      const handleDom = document.createElement('div')
      handleDom.style.background = this.options.resizerColor
      handleDom.classList.add(`resizer-handle`)
      handleDom.classList.add(`handle-${i}`)

      if (i > 7) {
        handleDom.classList.add('resizer-handle-mark', 'hide')
        handleDom.style.display = 'none'
        handleDom.onmousedown = this._markerMouseDown.bind(this)
      } else {
        handleDom.classList.add('resizer-handle-default')
        handleDom.onmousedown = this._mousedown.bind(this)
        handleDom.setAttribute('data-index', String(i))
      }

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
    //marker canvas

    return {
      resizerSelection,
      resizerHandleList,
      resizerImageContainer,
      resizerImage,
      resizerSize
    }
  }

  private _keydown = () => {
    // 有键盘事件触发时，主动销毁拖拽选区
    if (this.resizerSelection.style.display === 'block') {
      this.clearResizer()
      document.removeEventListener('keydown', this._keydown)
    }
  }

  private _mousedown(evt: MouseEvent) {
    this.canvas = this.draw.getPage()
    if (!this.curElement) return
    const { scale } = this.options
    this.mousedownX = evt.x
    this.mousedownY = evt.y
    const target = evt.target as HTMLDivElement
    this.curHandleIndex = Number(target.dataset.index)
    // 改变光标
    const cursor = window.getComputedStyle(target).cursor
    document.body.style.cursor = cursor
    this.canvas.style.cursor = cursor
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
        if (this.curElement && !this.previewerDrawOption.dragDisable) {
          this.curElement.width = this.width
          this.curElement.height = this.height
          this.draw.render({
            isSetCursor: true,
            curIndex: this.curPosition?.index
          })
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
    evt.preventDefault()
  }

  private _updateMarkerCanvas() {
    const ctx = this.markerCtx!
    ctx.beginPath()
    ctx.clearRect(0, 0, this.markerCanvas.width, this.markerCanvas.height)
    ctx.fillRect(0, 0, this.markerCanvas.width, this.markerCanvas.height)
    ctx.moveTo(
      this.markerCache.start.x * this.draw.getOptions().scale,
      this.markerCache.start!.y * this.draw.getOptions().scale
    )
    ctx.lineTo(
      this.markerCache.end!.x * this.draw.getOptions().scale,
      this.markerCache.end!.y * this.draw.getOptions().scale
    )
    if(this.curElement?.markType === IMarkType.ARROW){
      // 箭头长度
      const arrowLength = 15
      // 箭头角度（30度转为弧度）
      const angle = Math.PI / 6
      // 计算直线的角度
      const lineAngle = Math.atan2( this.markerCache.end.y -  this.markerCache.start.y,  this.markerCache.end.x -  this.markerCache.start.x)
      // 计算箭头两侧的点
      const arrowPoint1 = {
        x:  this.markerCache.end.x - arrowLength * Math.cos(lineAngle - angle),
        y:  this.markerCache.end.y - arrowLength * Math.sin(lineAngle - angle)
      }
      const arrowPoint2 = {
        x: this.markerCache. end.x - arrowLength * Math.cos(lineAngle + angle),
        y:  this.markerCache.end.y - arrowLength * Math.sin(lineAngle + angle)
      }
      // 绘制箭头的两条短线
      ctx.moveTo( this.markerCache.end.x,  this.markerCache.end.y)
      ctx.lineTo(arrowPoint1.x, arrowPoint1.y)
      ctx.moveTo( this.markerCache.end.x,  this.markerCache.end.y)
      ctx.lineTo(arrowPoint2.x, arrowPoint2.y)
    
  }
    ctx.stroke()
  }

  private _markerMouseUp = (evt: MouseEvent) => {
    evt.preventDefault()
    this.curElement!.start!.x = this.markerCache.start.x
    this.curElement!.start!.y = this.markerCache.start!.y
    this.curElement!.end!.x = this.markerCache.end!.x
    this.curElement!.end!.y = this.markerCache.end!.y
    this.draw.render({
      isSetCursor: false,
      curIndex: this.curPosition?.index
    })
    document.removeEventListener('mousemove', this._markerMouseMove)
    document.removeEventListener('mouseup', this._markerMouseUp)
  }
  private _markerMouseMove = (evt: MouseEvent) => {
    evt.preventDefault()
    if (!this.markerCache.movingEnd) {
      return
    }
    const dx = (this.mousedownX - evt.x) / this.options.scale
    const dy = (this.mousedownY - evt.y) / this.options.scale
    if (this.markerCache.movingEnd === 'end') {
      this.markerCache.end.x = this.curElement!.end!.x - dx
      this.markerCache.end.y = this.curElement!.end!.y - dy
    }
    if (this.markerCache.movingEnd === 'start') {
      this.markerCache.start.x = this.curElement!.start!.x - dx
      this.markerCache.start.y = this.curElement!.start!.y - dy
    }
    this._updateMarkerCanvas()
    // 更新预览包围框尺寸
    this._updateResizerRectForMark()
  }

  private _markerMouseDown(evt: MouseEvent) {
    evt.preventDefault()
    this.markerCache.movingEnd = (evt.target as HTMLDivElement).dataset.end!
    this.mousedownX = evt.x
    this.mousedownY = evt.y
    document.addEventListener('mousemove', this._markerMouseMove)
    document.addEventListener('mouseup', this._markerMouseUp)
  }

  private _mousemove(evt: MouseEvent) {
    if (!this.curElement || this.previewerDrawOption.dragDisable) return
    const { scale } = this.options
    let dx = 0
    let dy = 0
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
    // this._updateResizerSizeView(elementWidth, elementHeight)
    evt.preventDefault()
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
      evt.stopPropagation()
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
    const { resizerSize: handleSize, scale } = this.options
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
      this.resizerHandleList[i].style.transform = `scale(${scale})`
      this.resizerHandleList[i].style.left = `${left}px`
      this.resizerHandleList[i].style.top = `${top}px`
    }
  }

  public _updateResizerRectForMark() {
    let direction = ''
    if (this.markerCache.start.x < this.markerCache.end.x) {
      if (this.markerCache.start.y < this.markerCache.end.y) {
        direction = 'rightdown'
      } else {
        direction = 'rightup'
      }
    } else {
      if (this.markerCache.start.y < this.markerCache.end.y) {
        direction = 'leftdown'
      } else {
        direction = 'leftup'
      }
    }
    //Mark元素只保留两个位置
    const handles = document.getElementsByClassName('resizer-handle-mark')
    for (let i = 0; i < handles.length; i++) {
      const el = handles.item(i)
      el?.classList.remove('hide')
      if (i === 0) {
        el?.setAttribute('data-end', 'start')
        //start handle
        if (direction === 'rightup') {
          el?.setAttribute(
            'style',
            'left:0;bottom:0;transform:translateX(-50%) translateY(50%);'
          )
        } else if (direction === 'rightdown') {
          el?.setAttribute(
            'style',
            'left:0;top:0;transform:translateX(-50%) translateY(-50%);'
          )
        } else if (direction === 'leftup') {
          el?.setAttribute(
            'style',
            'right:0;bottom:0;transform:translateX(50%) translateY(50%);'
          )
        } else {
          el?.setAttribute(
            'style',
            'right:0;top:0;transform:translateX(50%) translateY(-50%);'
          )
        }
      } else {
        //end handle
        el?.setAttribute('data-end', 'end')
        if (direction === 'rightup') {
          el?.setAttribute(
            'style',
            'right:0;top:0;transform:translateX(50%) translateY(-50%);'
          )
        } else if (direction === 'rightdown') {
          el?.setAttribute(
            'style',
            'right:0;bottom:0;transform:translateX(50%) translateY(50%);'
          )
        } else if (direction === 'leftup') {
          el?.setAttribute(
            'style',
            'left:0;top:0;transform:translateX(-50%) translateY(-50%);'
          )
        } else {
          el?.setAttribute(
            'style',
            'left:0;bottom:0;transform:translateX(-50%) translateY(50%);'
          )
        }
      }
    }
    //TODO:更行
    const { scale } = this.options
    const elementWidth =
      Math.abs(this.markerCache.start!.x - this.markerCache.end!.x) * scale
    const elementHeight =
      Math.abs(this.markerCache.start!.y - this.markerCache.end!.y) * scale
    const x = Math.min(this.markerCache.start.x, this.markerCache.end.x)
    const y =
      Math.min(this.markerCache.start.y, this.markerCache.end.y) +
      (this.draw.getHeight() + this.draw.getPageGap()) *
        this.curElement!.pageIndex!
    this.resizerSelection.style.left = `${x}px`
    this.resizerSelection.style.top = `${y}px`
    this.resizerSelection.style.borderWidth = `${scale}px`
    // 更新预览包围框尺寸
    this._updateResizerRect(elementWidth, elementHeight)
    this._updateResizerSizeView(elementWidth, elementHeight)
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
    // 缓存配置
    this.previewerDrawOption = options
    this.curElementSrc = element[options.srcKey || 'value'] || ''
    // 更新渲染尺寸及位置
    this.updateResizer(element, position)
    // 监听事件
    document.addEventListener('keydown', this._keydown)
  }

  public updateResizer(
    element: IElement,
    position: IElementPosition | null = null
  ) {
    const { scale } = this.options
    let elementWidth = element.width! * scale
    let elementHeight = element.height! * scale
    if (element.type === ElementType.MARK) {
      elementWidth = Math.abs(element.start!.x - element.end!.x)
      elementHeight = Math.abs(element.start!.y - element.end!.y)
      //隐藏默认handle
    }
    // 尺寸预览
    this._updateResizerSizeView(elementWidth, elementHeight)
    // 优先使用浮动位置信息
    const { x: resizerLeft, y: resizerTop } = this._getElementPosition(
      element,
      position
    )
    this.resizerSelection.style.left = `${resizerLeft}px`
    this.resizerSelection.style.top = `${resizerTop}px`
    this.resizerSelection.style.borderWidth = `${scale}px`
    // 更新预览包围框尺寸
    this._updateResizerRect(elementWidth, elementHeight)
    this.resizerSelection.style.display = 'block'
    // 缓存基础信息
    this.curElement = element
    this.curPosition = position
    this.width = elementWidth
    this.height = elementHeight
  }

  public clearResizer() {
    this.resizerSelection.style.display = 'none'
    document.removeEventListener('keydown', this._keydown)
    this.markerCanvas.remove()
  }
}
