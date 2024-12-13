import { EDITOR_PREFIX } from '../../../dataset/constant/Editor'
import { IEditorOption, IMarkType } from '../../../interface/Editor'
import { IElement } from '../../../interface/Element'
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
    floatImage.style.width = `${elementWidth! * scale}px`
    floatImage.style.height = `${elementHeight! * scale}px`
    // 浮动图片初始信息
    const height = this.draw.getHeight()
    const pageGap = this.draw.getPageGap()
    const preY = this.draw.getPageNo() * (height + pageGap)
    floatImageContainer.style.left = `${leftX}px`
    floatImageContainer.style.top = `${preY + topY}px`
    floatImage.src = this._getLineBase64(
      element.start!,
      element.end!,
      element.markType!
    )
  }
  private _getLineBase64(
    start: { x: number; y: number },
    end: { x: number; y: number },
    type: IMarkType
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
      if (type === IMarkType.ARROW) {
        // 箭头长度
        const arrowLength = 15
        // 箭头角度（30度转为弧度）
        const angle = Math.PI / 6
        // 计算直线的角度
        const lineAngle = Math.atan2(end.y - start.y, end.x - start.x)
        // 计算箭头两侧的点
        const arrowPoint1 = {
          x: end.x - minX - arrowLength * Math.cos(lineAngle - angle),
          y: end.y - minY - arrowLength * Math.sin(lineAngle - angle)
        }
        const arrowPoint2 = {
          x: end.x - minX - arrowLength * Math.cos(lineAngle + angle),
          y: end.y - minY - arrowLength * Math.sin(lineAngle + angle)
        }
        // 绘制箭头的两条短线
        ctx.moveTo(end.x - minX, end.y - minY)
        ctx.lineTo(arrowPoint1.x, arrowPoint1.y)
        ctx.moveTo(end.x - minX, end.y - minY)
        ctx.lineTo(arrowPoint2.x, arrowPoint2.y)
      }
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

  public render(ctx: CanvasRenderingContext2D, element: IElement) {
    const { scale } = this.options
    ctx.save()
    ctx.lineWidth = 2
    ctx.strokeStyle = 'red'
    ctx.beginPath()
    ctx.moveTo(element.start!.x * scale, element.start!.y * scale)
    ctx.lineTo(element.end!.x * scale, element.end!.y * scale)
    if (element.markType === IMarkType.ARROW) {
      // 箭头长度
      const arrowLength = 15
      // 箭头角度（30度转为弧度）
      const angle = Math.PI / 6
      // 计算直线的角度
      const lineAngle = Math.atan2(
        element.end!.y - element.start!.y,
        element.end!.x - element.start!.x
      )
      // 计算箭头两侧的点
      const arrowPoint1 = {
        x: element.end!.x - arrowLength * Math.cos(lineAngle - angle),
        y: element.end!.y - arrowLength * Math.sin(lineAngle - angle)
      }
      const arrowPoint2 = {
        x: element.end!.x - arrowLength * Math.cos(lineAngle + angle),
        y: element.end!.y - arrowLength * Math.sin(lineAngle + angle)
      }
      // 绘制箭头的两条短线
      ctx.moveTo(element.end!.x, element.end!.y)
      ctx.lineTo(arrowPoint1.x, arrowPoint1.y)
      ctx.moveTo(element.end!.x, element.end!.y)
      ctx.lineTo(arrowPoint2.x, arrowPoint2.y)
    }
    ctx.stroke()
    ctx.restore()
  }
}
