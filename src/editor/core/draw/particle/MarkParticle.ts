import { EDITOR_PREFIX } from '../../../dataset/constant/Editor'
import { IEditorOption } from '../../../interface/Editor'
import { IElement } from '../../../interface/Element'
import { convertStringToBase64 } from '../../../utils'
import { Draw } from '../Draw'

export class MarkParticle {
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

    const elementWidth = Math.abs(element.start!.x - element.end!.x)
    const elementHeight = Math.abs(element.start!.y - element.end!.y)
    const leftX = Math.min(element.start!.x, element.end!.x)
    const topY = Math.min(element.start!.y, element.end!.y)

    console.log('mark width:' + elementWidth)

    floatImage.style.width = `${elementWidth! * scale}px`
    floatImage.style.height = `${elementHeight! * scale}px`
    // 浮动图片初始信息
    const height = this.draw.getHeight()
    const pageGap = this.draw.getPageGap()
    const preY = this.draw.getPageNo() * (height + pageGap)
    floatImageContainer.style.left = `${leftX}px`
    floatImageContainer.style.top = `${preY + topY}px`
    floatImage.src = this._getLineBase64(element.start!, element.end!)
  }

  private _getLineBase64(
    start: { x: number; y: number },
    end: { x: number; y: number }
  ) {
    // 计算矩形区域的坐标和宽高，并加1确保包含整条直线
    const minX = Math.min(start.x, end.x)
    const minY = Math.min(start.y, end.y)
    const width = Math.abs(end.x - start.x) + 1
    const height = Math.abs(end.y - start.y) + 1

    // 创建一个canvas元素
    const canvas = document.createElement('canvas')
    canvas.width = width
    canvas.height = height

    // 获取canvas上下文
    const ctx = canvas.getContext('2d')
    if (ctx) {
      ctx.beginPath()
      // 将起点和终点位置偏移到canvas左上角为(0, 0)的坐标系
      ctx.moveTo(start.x - minX, start.y - minY)
      ctx.lineTo(end.x - minX, end.y - minY)
      ctx.strokeStyle = 'red'
      ctx.lineWidth = 2
      ctx.stroke()
    }

    // 获取base64编码的图像数据
    const base64Image = canvas.toDataURL('image/png')

    // 销毁canvas元素
    canvas.remove()

    return base64Image
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

  protected getFallbackImage(width: number, height: number): HTMLImageElement {
    const tileSize = 8
    const x = (width - Math.ceil(width / tileSize) * tileSize) / 2
    const y = (height - Math.ceil(height / tileSize) * tileSize) / 2
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
                </svg>`
    const fallbackImage = new Image()
    fallbackImage.src = `data:image/svg+xml;base64,${convertStringToBase64(
      svg
    )}`
    return fallbackImage
  }

  public render(ctx: CanvasRenderingContext2D, element: IElement) {
    const { scale } = this.options
    // const width = element.width! * scale
    // const height = element.height! * scale
    // if (this.imageCache.has(element.id!)) {
    //   const img = this.imageCache.get(element.id!)!
    //   ctx.drawImage(img, x, y, width, height)
    // } else {
    //   const imageLoadPromise = new Promise((resolve, reject) => {
    //     const img = new Image()
    //     img.setAttribute('crossOrigin', 'Anonymous')
    //     img.src = element.value
    //     img.onload = () => {
    //       this.imageCache.set(element.id!, img)
    //       resolve(element)
    //       // 衬于文字下方图片需要重新首先绘制
    //       if (element.imgDisplay === ImageDisplay.FLOAT_BOTTOM) {
    //         this.draw.render({
    //           isCompute: false,
    //           isSetCursor: false,
    //           isSubmitHistory: false
    //         })
    //       } else {
    //         ctx.drawImage(img, x, y, width, height)
    //       }
    //     }
    //     img.onerror = error => {
    //       const fallbackImage = this.getFallbackImage(width, height)
    //       fallbackImage.onload = () => {
    //         ctx.drawImage(fallbackImage, x, y, width, height)
    //         this.imageCache.set(element.id!, fallbackImage)
    //       }
    //       reject(error)
    //     }
    //   })
    //   this.addImageObserver(imageLoadPromise)
    // }
    ctx.save()
    ctx.lineWidth = 2
    ctx.strokeStyle = 'red'
    ctx.beginPath()
    ctx.moveTo(element.start!.x * scale, element.start!.y * scale)
    ctx.lineTo(element.end!.x * scale, element.end!.y * scale)
    ctx.stroke()
    ctx.restore()
  }
}
