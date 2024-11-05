import {
  EditorMode,
  ElementType,
  IEditorOption,
  IElement,
  ImageDisplay,
  PaperDirection,
  RowFlex
} from './editor'
import { WRAP } from './editor/dataset/constant/Common'
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
              },
              {
                type: ElementType.IMG_VARIABLE,
                value: '',
                label: '花纹图片',
                key: 'imgPattern',
                width: 50,
                height: 50
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
              },
              {
                type: ElementType.TEXT_VARIABLE,
                value: '',
                label: '项目名称',
                key: 'projectName'
              }
            ]
          }
        ]
      }
    ],
    outBorderWidth: 5
  },
  {
    type: ElementType.PAGE_BREAK,
    value: WRAP
  },
  {
    type: ElementType.TEXT,
    value: '这是文本,'
  },
  {
    type: ElementType.TEXT_VARIABLE,
    value: '',
    label: '项目名称',
    key: 'projectName'
  },
  {
    type: ElementType.TEXT,
    value: '。'
  },
  {
    type: ElementType.IMG_VARIABLE,
    value: '',
    label: '花纹图片',
    key: 'imgPattern',
    width: 500,
    height: 500
  },
  {
    type: ElementType.PAGE_BREAK,
    value: ''
  },
  {
    type: ElementType.LOOP,
    loopType: 'start',
    value: ''
  },
  {
    value: '第',
    size: 32
  },
  {
    type: ElementType.TEXT_VARIABLE,
    value: '',
    label: '循环计数',
    key: 'loopIndex',
    size: 32
  },
  {
    value: '次循环',
    size: 32
  },
  {
    type: ElementType.IMAGE,
    value: imgSide,
    height: 180,
    width: 556,
    imgDisplay: ImageDisplay.INLINE,
    rowFlex: RowFlex.CENTER
  },
  {
    type: ElementType.PAGE_BREAK,
    value: ''
  },
  {
    type: ElementType.LOOP,
    loopType: 'end',
    value: ''
  }
]

export const data: IElement[] = elementList

export const options: IEditorOption = {
  margins: [60, 60, 60, 60],
  mode: EditorMode.PRINT,
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
