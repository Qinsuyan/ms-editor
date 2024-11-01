import {
  ElementType,
  IEditorOption,
  IElement,
  ImageDisplay,
  PaperDirection,
  RowFlex
} from './editor'
import { WRAP } from './editor/dataset/constant/Common'
import { IMarkType } from './editor/interface/Editor'
import { imgTop, imgSide } from './test'

const elementList: IElement[] = [
  {
    value: '标题文字',
    size: 32
  },
  {
    type: ElementType.TABLE,
    value: '',

    colgroup: [
      {
        width: 1003
      }
    ],
    trList: [
      {
        height: 40,
        tdList: [
          {
            colspan: 1,
            rowspan: 1,

            value: [
              {
                type: ElementType.IMAGE,
                value: imgTop,
                height: 180,
                width: 556,
                imgDisplay: ImageDisplay.INLINE,
                rowFlex: RowFlex.CENTER
              }
            ]
          }
        ]
      },
      {
        height: 40,
        tdList: [
          {
            colspan: 1,
            rowspan: 1,
            value: [
              {
                type: ElementType.IMAGE,
                value: imgSide,
                height: 180,
                width: 556,
                imgDisplay: ImageDisplay.INLINE,
                rowFlex: RowFlex.CENTER
              }
            ]
          }
        ]
      }
    ],
    outBorderWidth: 5
  },
  {
    type: ElementType.MARK,
    pageIndex: 0,
    value: '',
    start: { x: 200, y: 60 },
    end: { x: 400, y: 180 },
    markType: IMarkType.LINE
  },
  {
    type: ElementType.IMAGE,
    imgDisplay: ImageDisplay.FLOAT_TOP,
    value: imgTop,
    width: 400,
    height: 200,

    imgFloatPosition: {
      x: 500,
      y: 500,
      pageNo: 0
    }
  },
  {
    type: ElementType.PAGE_BREAK,
    value: WRAP
  },
  {
    type: ElementType.TEXT,
    value: '这是文本'
  },
  {
    type: ElementType.MARK,
    pageIndex: 1,
    value: '',
    start: { x: 511, y: 60 },
    end: { x: 314, y: 180 },
    markType: IMarkType.ARROW
  },
]

export const data: IElement[] = elementList

export const options: IEditorOption = {
  margins: [60, 60, 60, 60],
  // watermark: {
  //   data: 'CANVAS-EDITOR',
  //   size: 120
  // },
  pageNumber: {
    format: ''
    // format: '第{pageNo}页/共{pageCount}页'
  },
  placeholder: {
    data: '请输入正文'
  },
  paperDirection: PaperDirection.HORIZONTAL,
  zone: {
    tipDisabled: false
  },
  maskMargin: [60, 0, 30, 0] // 菜单栏高度60，底部工具栏30为遮盖层
}
