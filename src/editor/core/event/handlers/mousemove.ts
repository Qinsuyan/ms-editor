import { ImageDisplay } from '../../../dataset/enum/Common'
import { ElementType } from '../../../dataset/enum/Element'
import { isVariableImage } from '../../../utils/element'
import { CanvasEvent } from '../CanvasEvent'
export function mousemove(evt: MouseEvent, host: CanvasEvent) {
  const draw = host.getDraw()
  const variableParticle = draw.getVariableParticle()
  variableParticle.clearVariablePopup()
  draw.hideTextBoxControl()
  if (draw.getDrawingGraph()) {
    draw.modifyDrawingGraph({ x: evt.offsetX, y: evt.offsetY })
    return
  }

  const isReadonly = draw.isReadonly()
  // 是否是拖拽文字
  if (host.isAllowDrag) {
    // 是否允许拖拽到选区
    const x = evt.offsetX
    const y = evt.offsetY
    const { startIndex, endIndex } = host.cacheRange!
    const positionList = host.cachePositionList!
    for (let p = startIndex + 1; p <= endIndex; p++) {
      const {
        coordinate: { leftTop, rightBottom }
      } = positionList[p]
      if (
        x >= leftTop[0] &&
        x <= rightBottom[0] &&
        y >= leftTop[1] &&
        y <= rightBottom[1]
      ) {
        return
      }
    }
    const cacheStartIndex = host.cacheRange?.startIndex
    if (cacheStartIndex) {
      // 浮动元素拖拽调整位置
      const dragElement = host.cacheElementList![cacheStartIndex]
      if (
        (dragElement?.type === ElementType.IMAGE ||
          isVariableImage(dragElement)) &&
        (dragElement.imgDisplay === ImageDisplay.FLOAT_TOP ||
          dragElement.imgDisplay === ImageDisplay.FLOAT_BOTTOM)
      ) {
        draw.getPreviewer().clearResizer()
        draw.getImageParticle().dragFloatImage(evt.movementX, evt.movementY)
      }
    }
    host.dragover(evt)
    host.isAllowDrop = true
    return
  }
  // 结束位置
  const position = draw.getPosition()
  const positionResult = position.getPositionByXY({
    x: evt.offsetX,
    y: evt.offsetY
  })
  if (!~positionResult.index) {
    return
  }
  const {
    index,
    isTable,
    tdValueIndex,
    tdIndex,
    trIndex,
    tableId,
    isVariable,
    isTextBox
  } = positionResult

  if (isVariable && !isReadonly) {
    //对于变量
    //变量tooltip
    const position = draw.getPosition()
    const elementList = draw.getElementList()
    const positionList = position.getPositionList()
    const endIndex = isTable ? tdValueIndex! : index
    const curElement = elementList[endIndex]
    if (isTable) {
      const p =
        draw.getOriginalElementList()[index]!.trList?.[trIndex!].tdList[
          tdIndex!
        ].positionList
      if (p) {
        variableParticle.drawVariablePopup(curElement, p[tdValueIndex!])
      }
    } else {
      variableParticle.drawVariablePopup(curElement, positionList[endIndex])
    }
  }
  if (isTextBox) {
    const elementList = draw.getElementList()
    const curElement = elementList[index!]
    draw.showTextBoxControl(curElement)
  }
  if (!host.isAllowSelection || !host.mouseDownStartPosition) {
    return
  }

  const target = evt.target as HTMLDivElement
  const pageIndex = target.dataset.index
  // 设置pageNo
  if (pageIndex) {
    draw.setPageNo(Number(pageIndex))
  }

  const {
    index: startIndex,
    isTable: startIsTable,
    tdIndex: startTdIndex,
    trIndex: startTrIndex,
    tableId: startTableId
  } = host.mouseDownStartPosition
  const endIndex = isTable ? tdValueIndex! : index

  // 判断是否是表格跨行/列
  const rangeManager = draw.getRange()
  if (
    isTable &&
    startIsTable &&
    (tdIndex !== startTdIndex || trIndex !== startTrIndex)
  ) {
    rangeManager.setRange(
      endIndex,
      endIndex,
      tableId,
      startTdIndex,
      tdIndex,
      startTrIndex,
      trIndex
    )
  } else {
    let end = ~endIndex ? endIndex : 0
    // 开始或结束位置存在表格，但是非相同表格则忽略选区设置
    if ((startIsTable || isTable) && startTableId !== tableId) return
    // 开始位置
    let start = startIndex
    if (start > end) {
      // prettier-ignore
      [start, end] = [end, start]
    }
    if (start === end) return
    rangeManager.setRange(start, end)
  }

  // 绘制
  draw.render({
    isSubmitHistory: false,
    isSetCursor: false,
    isCompute: false
  })
}
