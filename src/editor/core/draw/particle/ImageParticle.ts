import { EDITOR_PREFIX } from '../../../dataset/constant/Editor'
import { ImageDisplay } from '../../../dataset/enum/Common'
import { GraphType } from '../../../dataset/enum/Editor'
import { ElementType } from '../../../dataset/enum/Element'
import { IEditorOption } from '../../../interface/Editor'
import { IElement } from '../../../interface/Element'
import { convertStringToBase64 } from '../../../utils'
import { Draw } from '../Draw'

export class ImageParticle {
  private draw: Draw
  protected options: Required<IEditorOption>
  protected imageCache: Map<string, HTMLImageElement>
  private container: HTMLDivElement
  private floatImageContainer: HTMLDivElement | null
  private floatImage: HTMLImageElement | null

  constructor(draw: Draw) {
    this.draw = draw
    this.options = draw.getOptions()
    this.container = draw.getContainer()
    this.imageCache = new Map()
    this.floatImageContainer = null
    this.floatImage = null
  }

  public createFloatImage(element: IElement) {
    const { scale } = this.options
    // 复用浮动元素
    let floatImageContainer = this.floatImageContainer
    let floatImage = this.floatImage
    if (!floatImageContainer) {
      floatImageContainer = document.createElement('div')
      floatImageContainer.classList.add(`${EDITOR_PREFIX}-float-image`)
      this.container.append(floatImageContainer)
      this.floatImageContainer = floatImageContainer
    }
    if (!floatImage) {
      floatImage = document.createElement('img')
      floatImageContainer.append(floatImage)
      this.floatImage = floatImage
    }
    floatImageContainer.style.display = 'none'
    floatImage.style.width = `${element.width! * scale}px`
    floatImage.style.height = `${element.height! * scale}px`
    // 浮动图片初始信息
    const height = this.draw.getHeight()
    const pageGap = this.draw.getPageGap()
    const preY = this.draw.getPageNo() * (height + pageGap)
    const imgFloatPosition = element.imgFloatPosition!
    floatImageContainer.style.left = `${imgFloatPosition.x}px`
    floatImageContainer.style.top = `${preY + imgFloatPosition.y}px`
    floatImage.src = element.value
  }

  public dragFloatImage(movementX: number, movementY: number) {
    if (!this.floatImageContainer) return
    this.floatImageContainer.style.display = 'block'
    // 之前的坐标加移动长度
    const x = parseFloat(this.floatImageContainer.style.left) + movementX
    const y = parseFloat(this.floatImageContainer.style.top) + movementY
    this.floatImageContainer.style.left = `${x}px`
    this.floatImageContainer.style.top = `${y}px`
  }

  public destroyFloatImage() {
    if (this.floatImageContainer) {
      this.floatImageContainer.style.display = 'none'
    }
  }

  protected addImageObserver(promise: Promise<unknown>) {
    this.draw.getImageObserver().add(promise)
  }

  protected getFallbackImage(
    width: number,
    height: number,
    text?: string
  ): HTMLImageElement {
    const tileSize = 8
    const x = (width - Math.ceil(width / tileSize) * tileSize) / 2
    const y = (height - Math.ceil(height / tileSize) * tileSize) / 2
    const textAddon = text
      ? `<text x="${width / 2}" y="${
          height / 2
        }" text-anchor="middle" fill="#000000" font-size="24">${text}</text>`
      : ''
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
                  <rect width="${width}" height="${height}" fill="url(#mosaic)" />

                  <defs>
                    <pattern id="mosaic" x="${x}" y="${y}" width="${
      tileSize * 2
    }" height="${tileSize * 2}" patternUnits="userSpaceOnUse">
                      <rect width="${tileSize}" height="${tileSize}" fill="#cccccc" />
                      <rect width="${tileSize}" height="${tileSize}" fill="#cccccc" transform="translate(${tileSize}, ${tileSize})" />
                    </pattern>
                  </defs>
                  ${textAddon}
                </svg>`
    const fallbackImage = new Image()
    fallbackImage.src = `data:image/svg+xml;base64,${convertStringToBase64(
      svg
    )}`
    return fallbackImage
  }

  protected calculateArrowEndpoints(
    x1: number,
    y1: number,
    x2: number,
    y2: number
  ) {
    // 计算原始线段的向量
    const dx = x2 - x1
    const dy = y2 - y1

    // 计算线段长度
    const scale = 8 / Math.sqrt(dx ** 2 + dy ** 2)

    // 计算60度角对应的弧度
    const angle = (Math.PI * 5) / 6

    // 计算箭头两侧线条的向量
    // 使用旋转矩阵旋转原始向量得到新向量，旋转角度为±60度
    const arrowVector1 = [
      dx * Math.cos(angle) - dy * Math.sin(angle),
      dx * Math.sin(angle) + dy * Math.cos(angle)
    ]
    const arrowVector2 = [
      dx * Math.cos(-angle) - dy * Math.sin(-angle),
      dx * Math.sin(-angle) + dy * Math.cos(-angle)
    ]

    // 计算箭头两端的终点坐标
    const endpoint1 = [
      x2 + arrowVector1[0] * scale,
      y2 + arrowVector1[1] * scale
    ]
    const endpoint2 = [
      x2 + arrowVector2[0] * scale,
      y2 + arrowVector2[1] * scale
    ]

    return [
      { x: endpoint1[0], y: endpoint1[1] },
      { x: endpoint2[0], y: endpoint2[1] }
    ]
  }

  public render(
    ctx: CanvasRenderingContext2D,
    element: IElement,
    x: number,
    y: number
  ) {
    const { scale } = this.options
    const width = element.width! * scale
    const height = element.height! * scale
    if (
      this.imageCache.has(element.id!) &&
      element.type !== ElementType.VARIABLE
    ) {
      const img = this.imageCache.get(element.id!)!
      ctx.drawImage(img, x, y, width, height)
    } else if (element.type === ElementType.GRAPH) {
      const {
        startX,
        startY,
        endX,
        endY,
        strokeColor,
        strokeWidth,
        graphType
      } = element
      element.imgFloatPosition = {
        x: startX! < endX! ? startX! : endX!,
        y: startY! < endY! ? startY! : endY!
      }
      element.width = startX! < endX! ? endX! - startX! : startX! - endX!
      element.height = startY! < endY! ? endY! - startY! : startY! - endY!
      element.imgFloatPosition.x *= this.options.scale
      element.imgFloatPosition.y *= this.options.scale
      ctx.beginPath()
      ctx.strokeStyle = strokeColor || '#f00'
      ctx.lineWidth = strokeWidth || 1
      ctx.moveTo(startX! * this.options.scale, startY! * this.options.scale)
      ctx.lineTo(endX! * this.options.scale, endY! * this.options.scale)
      if (graphType === GraphType.ARROW) {
        ctx.moveTo(endX! * this.options.scale, endY! * this.options.scale)
        const ends = this.calculateArrowEndpoints(
          startX!,
          startY!,
          endX!,
          endY!
        )
        ctx.lineTo(
          ends[0].x * this.options.scale,
          ends[0].y * this.options.scale
        )
        ctx.moveTo(endX! * this.options.scale, endY! * this.options.scale)
        ctx.lineTo(
          ends[1].x * this.options.scale,
          ends[1].y * this.options.scale
        )
      }
      ctx.stroke()
    } else {
      const id = element.id + '-' + this.draw.getMode()
      if (this.imageCache.has(id)) {
        const img = this.imageCache.get(id)!
        ctx.drawImage(img, x, y, width, height)
      } else {
        const imageLoadPromise = new Promise((resolve, reject) => {
          const img = new Image()
          img.setAttribute('crossOrigin', 'Anonymous')
          img.src = element.value
          img.onload = () => {
            this.imageCache.set(id, img)
            resolve(element)
            // 衬于文字下方图片需要重新首先绘制
            if (element.imgDisplay === ImageDisplay.FLOAT_BOTTOM) {
              this.draw.render({
                isCompute: false,
                isSetCursor: false,
                isSubmitHistory: false
              })
            } else {
              ctx.drawImage(img, x, y, width, height)
            }
          }
          img.onerror = error => {
            const fallbackImage = this.getFallbackImage(
              width,
              height,
              element.label
            )
            fallbackImage.onload = () => {
              ctx.drawImage(fallbackImage, x, y, width, height)
              this.imageCache.set(id, fallbackImage)
              if (!element.key) {
                reject(error)
              }
            }
          }
        })
        this.addImageObserver(imageLoadPromise)
      }
    }
  }
}
