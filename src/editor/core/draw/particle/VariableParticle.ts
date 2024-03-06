import { DeepRequired } from '../../../interface/Common'
import { IEditorOption } from '../../../interface/Editor'
import { IElement } from '../../../interface/Element'
import { Draw } from '../Draw'

export class VariableParticle {
  private draw: Draw
  private options: DeepRequired<IEditorOption>
  constructor(draw: Draw) {
    this.draw = draw
    this.options = draw.getOptions()
  }
  public render(
    ctx: CanvasRenderingContext2D,
    element: IElement,
    x: number,
    y: number
  ) {
    
  }
}
