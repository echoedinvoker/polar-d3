import * as d3 from 'd3';
import { ItemModel } from './ItemModel';
import { ScaleGenerator } from './ScaleGenerator';
import { AxisRenderer } from './AxisRenderer';
import { ArcBarRenderer } from './ArcBarRenderer';
import { Config, config } from './config';

interface hasType {
  type: string
  [key: string]: any
}

export class Polar {
  private group!: d3.Selection<SVGGElement, unknown, HTMLElement, undefined>
  public config: Config
  private scale!: ScaleGenerator
  itemModel!: ItemModel
  private axisRenderer!: AxisRenderer
  private arcBarRenderer!: ArcBarRenderer
  constructor(customConfig?: Partial<Config>) {
    this.config = { ...config, ...customConfig }
    this.init()
  }

  init() {
    const svg = d3.select(this.config.selector).append('svg')
      .attr('width', this.config.svgWidth)
      .attr('height', this.config.svgHeight);

    this.group = svg.append('g')
      .attr('transform', `translate(${this.config.marginLeft / 2}, ${this.config.marginTop / 2})`)
      .attr('width', this.config.svgWidth - this.config.marginLeft - this.config.marginRight)
      .attr('height', this.config.svgHeight - this.config.marginTop - this.config.marginBottom);

    this.scale = new ScaleGenerator(
      this.config.arcRange,
      this.config.arcRadius
    )
    this.itemModel = new ItemModel(this)
    this.axisRenderer = new AxisRenderer(
      this.group.append('g'),
      this.group.append('g'),
      this.config.radialLength,
      this.config,
      this.itemModel,
      this.scale
    )
    this.arcBarRenderer = new ArcBarRenderer(
      this.group.append('g'),
      this.config,
      this.scale,
    )
  }

  updateInstances() {
    this.scale.update(this.itemModel)
    this.axisRenderer.update()
    this.arcBarRenderer.update(this.itemModel)
  }

  changeConfig(customConfig: Partial<Config>) {
    const temp = this.itemModel.new
    this.config = { ...this.config, ...customConfig }
    this.init()
    this.itemModel.new = temp
    this.updateInstances()
  }


  update(data: hasType[]) {
    data.forEach((d) => {
      if (!(this.config.fieldsId in d) && !(this.config.fieldsName in d) && !(this.config.fieldsValue in d)) {
        console.error(`Invalid data: ${JSON.stringify(d)}`)
        return
      }
      const entity = {
        id: d[this.config.fieldsId],
        name: d[this.config.fieldsName],
        value: d[this.config.fieldsValue]
      };
      switch (d.type) {
        case "added":
          this.itemModel.set(entity, entity.id)
          break;
        case "modified":
          const item = this.itemModel.getItem(entity.id)!
          item.value = entity.value
          break;
        case "removed":
          this.itemModel.remove(entity.id)
          break;
        default:
          console.log(`Unhandled type: ${d.type}`);
      }
    })
    this.updateInstances()
    // testing
    // const dataTextareaEl = document.getElementById('data') as HTMLTextAreaElement
    // dataTextareaEl.value = JSON.stringify(Array.from(polar.itemModel.menuMap.values()), null, 2)
  }
}


// testing
// const polar = new Polar()
// d3.select('#added').on('click', () => {
//   const name = d3.select('#name').property('value')
//   const value = d3.select('#value').property('value')
//   polar.update([{ type: 'added', name, value }])
// })
//
// d3.select('#updated').on('click', () => {
//   const name = d3.select('#name').property('value')
//   const value = d3.select('#value').property('value')
//   polar.update([{ type: 'modified', name, value }])
// })
//
// d3.select('#removed').on('click', () => {
//   const name = d3.select('#name').property('value')
//   polar.update([{ type: 'removed', name }])
// })
// d3.select('#save').on('click', () => {
//   const dataTextareaEl = document.getElementById('data') as HTMLTextAreaElement
//   const data = JSON.parse(dataTextareaEl.value)
//   polar.itemModel.new = data
// })
