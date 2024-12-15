import { IEditorOption, PaperDirection } from './editor'
export const textDict = {
  workingName: '某区域',
  dataDateRange: '2024-11-30 ~ 2024-12-01',
  mainRange: '1350M - 1450M',
  riskRange: '1354M - 1421M',
  systemDate: '2024-12-01',
  value1: '1',
  value2: '2',
  value3: '3',
  value4: '4',
  value5: '5',
  value6: '6',
  value7: '7',
  value8: '8',
  value9: '9',
  value10: '10',

}
export const data: any[] = [
  {
    value: '某工程',
    size: 18,
    bold: false,
    color: 'rgb(0, 0, 0)',
    italic: false,
    rowFlex: 'center'
  },
  {
    type: 'control',
    value: '',
    rowFlex: 'center',
    control: {
      conceptId: 'workingName',
      type: 'text',
      size: 18,
      value: [],
      placeholder: '监测名称'
    }
  },
  {
    value: '数据分析报告',
    size: 18,
    bold: false,
    color: 'rgb(0, 0, 0)',
    italic: false,
    rowFlex: 'center'
  },
  {
    value: '\n',
    size: 14,
    bold: false,
    color: 'rgb(0, 0, 0)',
    italic: false,
    rowFlex: 'center'
  },
  {
    value: '报告编号：20241201',
    size: 12,
    bold: false,
    color: 'rgb(0, 0, 0)',
    italic: false,
    rowFlex: 'center'
  },
  {
    value: ' \n',
    size: 14,
    bold: false,
    color: 'rgb(0, 0, 0)',
    italic: false,
    rowFlex: 'center'
  },
  {
    value: '',
    type: 'textVariable',
    size: 14,
    rowFlex: 'center',
    label: '监测名称',
    key: 'workingName'
  },
  {
    value: '总体分析报表\n',
    size: 14,
    bold: false,
    color: 'rgb(0, 0, 0)',
    italic: false,
    rowFlex: 'center'
  },
  {
    value: '',
    type: 'table',
    trList: [
      {
        height: 42,
        tdList: [
          {
            colspan: 2,
            rowspan: 1,
            value: [
              {
                value: '监测对象',
                size: 12,
                rowFlex: 'center'
              }
            ]
          },
          {
            colspan: 1,
            rowspan: 1,
            value: [
              {
                type: 'control',
                value: '',
                rowFlex: 'center',
                control: {
                  conceptId: 'workingName',
                  type: 'text',
                  size: 12,
                  value: [],
                  placeholder: '监测名称'
                }
              }
            ]
          },
          {
            colspan: 1,
            rowspan: 1,
            value: [
              {
                value: '数据采集设备',
                size: 12,
                rowFlex: 'center'
              }
            ]
          },
          {
            colspan: 2,
            rowspan: 1,
            value: [
              {
                value: '电子监测系统',
                size: 12,
                rowFlex: 'center'
              }
            ]
          }
        ],
        minHeight: 42
      },
      {
        height: 42,
        tdList: [
          {
            colspan: 2,
            rowspan: 1,
            value: [
              {
                value: '监测时间',
                size: 12,
                rowFlex: 'center'
              }
            ]
          },
          {
            colspan: 4,
            rowspan: 1,
            value: [
              {
                type: 'control',
                value: '',
                rowFlex: 'center',
                control: {
                  conceptId: 'dataDateRange',
                  type: 'text',
                  size: 12,
                  value: [],
                  placeholder: '监测日期段'
                }
              }
            ]
          }
        ],
        minHeight: 42
      },
      {
        height: 42,
        tdList: [
          {
            colspan: 2,
            rowspan: 1,
            value: [
              {
                value: '范围',
                size: 12,
                rowFlex: 'center'
              }
            ]
          },
          {
            colspan: 4,
            rowspan: 1,
            value: [
              {
                value: '1200M - 1500M',
                size: 12,
                bold: false,
                color: 'rgb(0, 0, 0)',
                italic: false,
                rowFlex: 'center'
              }
            ]
          }
        ],
        minHeight: 42
      },
      {
        height: 42,
        tdList: [
          {
            colspan: 2,
            rowspan: 1,
            value: [
              {
                value: '重点范围',
                size: 12,
                rowFlex: 'center'
              }
            ]
          },
          {
            colspan: 4,
            rowspan: 1,
            value: [
              {
                type: 'control',
                value: '',
                rowFlex: 'center',
                control: {
                  conceptId: 'mainRange',
                  type: 'text',
                  size: 12,
                  value: [],
                  placeholder: '重点范围'
                }
              }
            ]
          }
        ],
        minHeight: 42
      },
      {
        height: 42,
        tdList: [
          {
            colspan: 1,
            rowspan: 3,
            value: [
              {
                value: '\n\n\n\n\n\n评\n估',
                size: 12,
                rowFlex: 'center'
              }
            ]
          },
          {
            colspan: 1,
            rowspan: 1,
            value: [
              {
                value: '风险范围',
                size: 12,
                rowFlex: 'center'
              }
            ]
          },
          {
            colspan: 4,
            rowspan: 1,
            value: [
              {
                type: 'control',
                value: '',
                rowFlex: 'center',
                control: {
                  conceptId: 'riskRange',
                  type: 'text',
                  size: 12,
                  value: [],
                  placeholder: '风险范围'
                }
              }
            ]
          }
        ],
        minHeight: 42
      },
      {
        height: 42,
        tdList: [
          {
            colspan: 1,
            rowspan: 1,
            value: [
              {
                value: '风险等级',
                size: 12,
                rowFlex: 'center'
              }
            ]
          },
          {
            colspan: 2,
            rowspan: 1,
            value: [
              {
                value: '强烈',
                size: 12,
                rowFlex: 'center'
              }
            ]
          },
          {
            colspan: 1,
            rowspan: 1,
            value: [
              {
                value: '风险概率',
                size: 12,
                rowFlex: 'center'
              }
            ]
          },
          {
            colspan: 1,
            rowspan: 1,
            value: [
              {
                value: '中',
                size: 12,
                rowFlex: 'center'
              }
            ]
          }
        ],
        minHeight: 42
      },
      {
        height: 325,
        tdList: [
          {
            colspan: 1,
            rowspan: 1,
            value: [
              {
                value: '\n\n\n\n描    述\n\n\n\n',
                size: 12,
                rowFlex: 'center'
              }
            ]
          },
          {
            colspan: 4,
            rowspan: 1,
            value: [
              {
                value: '',
                type: 'tab'
              },
              {
                value:
                  'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum. \n',
                size: 12,
                bold: false,
                color: 'rgb(0, 0, 0)',
                italic: false
              },
              {
                type: 'control',
                value: '',
                rowFlex: 'center',
                control: {
                  conceptId: 'value1',
                  type: 'text',
                  size: 12,
                  value: [],
                  placeholder: 'value1'
                }
              }, {
                type: 'control',
                value: '',
                rowFlex: 'center',
                control: {
                  conceptId: 'value2',
                  type: 'text',
                  size: 12,
                  value: [],
                  placeholder: 'value2'
                }
              }, {
                type: 'control',
                value: '',
                rowFlex: 'center',
                control: {
                  conceptId: 'value3',
                  type: 'text',
                  size: 12,
                  value: [],
                  placeholder: 'value3'
                }
              }, {
                type: 'control',
                value: '',
                rowFlex: 'center',
                control: {
                  conceptId: 'value4',
                  type: 'text',
                  size: 12,
                  value: [],
                  placeholder: 'value4'
                }
              }, {
                type: 'control',
                value: '',
                rowFlex: 'center',
                control: {
                  conceptId: 'value5',
                  type: 'text',
                  size: 12,
                  value: [],
                  placeholder: 'value5'
                }
              }, {
                type: 'control',
                value: '',
                rowFlex: 'center',
                control: {
                  conceptId: 'value6',
                  type: 'text',
                  size: 12,
                  value: [],
                  placeholder: 'value6'
                }
              }, {
                type: 'control',
                value: '',
                rowFlex: 'center',
                control: {
                  conceptId: 'value7',
                  type: 'text',
                  size: 12,
                  value: [],
                  placeholder: 'value7'
                }
              }, {
                type: 'control',
                value: '',
                rowFlex: 'center',
                control: {
                  conceptId: 'value8',
                  type: 'text',
                  size: 12,
                  value: [],
                  placeholder: 'value8'
                }
              }, {
                type: 'control',
                value: '',
                rowFlex: 'center',
                control: {
                  conceptId: 'value9',
                  type: 'text',
                  size: 12,
                  value: [],
                  placeholder: 'value9'
                }
              }, {
                type: 'control',
                value: '',
                rowFlex: 'center',
                control: {
                  conceptId: 'value10',
                  type: 'text',
                  size: 12,
                  value: [],
                  placeholder: 'value10'
                }
              },
              {
                value: '\n',
              },
              {
                value: '',
                type: 'tab'
              },
              {
                value:
                  'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.\n',
                size: 12,
                bold: false,
                color: 'rgb(0, 0, 0)',
                italic: false
              },
              {
                value: '',
                type: 'tab'
              },
              {
                value:
                  'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.',
                size: 12,
                bold: false,
                color: 'rgb(0, 0, 0)',
                italic: false
              }
            ]
          }
        ],
        minHeight: 42
      },
      {
        height: 42,
        tdList: [
          {
            colspan: 2,
            rowspan: 1,
            value: [
              {
                value: '填报人员',
                size: 12,
                rowFlex: 'center'
              }
            ]
          },
          {
            colspan: 2,
            rowspan: 1,
            value: [
              {
                value: '李梅',
                size: 12,
                bold: false,
                color: 'rgb(0, 0, 0)',
                italic: false,
                rowFlex: 'center'
              }
            ]
          },
          {
            colspan: 1,
            rowspan: 1,
            value: [
              {
                value: '审核',
                size: 12,
                rowFlex: 'center'
              }
            ]
          },
          {
            colspan: 1,
            rowspan: 1,
            value: [
              {
                value: '张华',
                size: 12,
                bold: false,
                color: 'rgb(0, 0, 0)',
                italic: false,
                rowFlex: 'center'
              }
            ]
          }
        ],
        minHeight: 42
      },
      {
        height: 65,
        tdList: [
          {
            colspan: 2,
            rowspan: 1,
            value: [
              {
                value: '监测单位',
                size: 12,
                rowFlex: 'center'
              }
            ]
          },
          {
            colspan: 2,
            rowspan: 1,
            value: [
              {
                value: '749局',
                size: 12,
                bold: false,
                color: 'rgb(0, 0, 0)',
                italic: false,
                rowFlex: 'center'
              }
            ]
          },
          {
            colspan: 1,
            rowspan: 1,
            value: [
              {
                value: '预报日期',
                size: 12,
                rowFlex: 'center'
              }
            ]
          },
          {
            colspan: 1,
            rowspan: 1,
            value: [
              {
                type: 'control',
                value: '',
                rowFlex: 'center',
                control: {
                  conceptId: 'systemDate',
                  type: 'text',
                  size: 12,
                  value: [],
                  placeholder: '当前日期'
                }
              }
            ]
          }
        ],
        minHeight: 42
      }
    ],
    width: 673.9999999999999,
    height: 684,
    colgroup: [
      {
        width: 32.33333333333333
      },
      {
        width: 80.33333333333331
      },
      {
        width: 224.33333333333331
      },
      {
        width: 90.33333333333333
      },
      {
        width: 134.33333333333331
      },
      {
        width: 112.33333333333333
      }
    ],
    outBorderWidth: 1
  },
  {
    value: '\n',
    type: 'pageBreak',
    width: 672.8571428571429
  },
  {
    value: '\n'
  },
  {
    value: '附件：\n',
    font: '仿宋'
  },
  {
    value: '附件一：图1',
    font: '宋体',
    size: 14
  },
  {
    value: '\n',
    rowFlex: 'left'
  },
  {
    value: '图1',
    font: '宋体',
    size: 14,
    bold: false,
    color: 'rgb(0, 0, 0)',
    italic: false,
    rowFlex: 'left'
  },
  {
    value: '\n'
  },
  {
    type: 'image',
    width: 300,
    height: 300,
    dataKey: 'imgTest',
    placeHolder: '测试图片1',
    value: '',
    rowFlex: 'center'
  },
  {
    value: '\n',
    rowFlex: 'center'
  },
  {
    value: '图1',
    font: '黑体',
    size: 14,
    rowFlex: 'center'
  },
  {
    value: '\n附件二：',
    font: '宋体',
    size: 14
  },
  {
    value: '散点图\n',
    font: '宋体',
    size: 14,
    bold: false,
    color: 'rgb(0, 0, 0)',
    italic: false
  },
  {
    type: 'image',
    width: 600,
    height: 300,
    dataKey: 'imgScatter',
    placeHolder: '散点图',
    value: '',
    rowFlex: 'center'
  },
  {
    value: '\n',
    rowFlex: 'center'
  },
  {
    value: '散点图',
    font: '黑体',
    size: 14,
    rowFlex: 'center'
  },
  {
    value: '\n'
  },
  {
    value: '附件三：',
    font: '宋体',
    size: 14
  },
  {
    value: '典型表',
    font: '宋体',
    size: 14,
    bold: false,
    color: 'rgb(0, 0, 0)',
    italic: false
  },
  {
    value: '',
    type: 'table',
    font: '宋体',
    trList: [
      {
        height: 42,
        header: true,
        tdList: [
          {
            colspan: 1,
            rowspan: 1,
            value: [
              {
                value: '时间',
                font: '华文宋体',
                size: 14,
                bold: true,
                rowFlex: 'center'
              }
            ],
            verticalAlign: 'middle'
          },
          {
            colspan: 1,
            rowspan: 1,
            value: [
              {
                value: '掌子面类型',
                font: '华文宋体',
                size: 14,
                bold: true,
                rowFlex: 'center'
              }
            ],
            verticalAlign: 'middle'
          },
          {
            colspan: 1,
            rowspan: 1,
            value: [
              {
                value: '里程',
                font: '华文宋体',
                size: 14,
                bold: true,
                rowFlex: 'center'
              }
            ],
            verticalAlign: 'middle'
          },
          {
            colspan: 1,
            rowspan: 1,
            value: [
              {
                value: '能量',
                font: '华文宋体',
                size: 14,
                bold: true,
                rowFlex: 'center'
              }
            ],
            verticalAlign: 'middle'
          }
        ],
        minHeight: 42
      },
      {
        height: 42,
        tdList: [
          {
            colspan: 1,
            rowspan: 1,
            value: [
              {
                value: '...',
                font: '华文宋体',
                size: 14,
                rowFlex: 'center'
              }
            ],
            verticalAlign: 'middle'
          },
          {
            colspan: 1,
            rowspan: 1,
            value: [
              {
                value: '...',
                font: '华文宋体',
                size: 14,
                rowFlex: 'center'
              }
            ],
            verticalAlign: 'middle'
          },
          {
            colspan: 1,
            rowspan: 1,
            value: [
              {
                value: '...',
                font: '华文宋体',
                size: 14,
                rowFlex: 'center'
              }
            ],
            verticalAlign: 'middle'
          },
          {
            colspan: 1,
            rowspan: 1,
            value: [
              {
                value: '...',
                font: '华文宋体',
                size: 14,
                rowFlex: 'center'
              }
            ],
            verticalAlign: 'middle'
          }
        ],
        minHeight: 42
      }
    ],
    width: 674,
    height: 84,
    colgroup: [
      {
        width: 198
      },
      {
        width: 168
      },
      {
        width: 121
      },
      {
        width: 187
      }
    ],
    dataKey: 'typicalEvents',
    outBorderWidth: 1
  }
]

interface IComment {
  id: string
  content: string
  userName: string
  rangeText: string
  createdDate: string
}
export const commentList: IComment[] = []

export const options: IEditorOption = {
  margins: [60, 60, 60, 60],
  pageNumber: {
    format: '第{pageNo}页/共{pageCount}页'
  },
  placeholder: {
    data: '请输入正文'
  },
  zone: {
    tipDisabled: false
  },
  maskMargin: [60, 0, 30, 0], // 菜单栏高度60，底部工具栏30为遮盖层
  paperDirection: PaperDirection.VERTICAL
}


