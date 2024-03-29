import * as d3 from 'd3';
import { createRadialAxis } from './axisRadias';
import { createArcAxis } from './axisArc';
import { Config } from './config';
import { ItemModel } from './ItemModel';
import { ScaleGenerator } from './ScaleGenerator';


export class AxisRenderer {
  radialAxis: (selection: d3.Selection<SVGGElement, unknown, HTMLElement, undefined>) => void;
  arcAxis: (selection: d3.Selection<SVGGElement, unknown, HTMLElement, undefined>) => void;

  constructor(
    private arcAxisGroup: d3.Selection<SVGGElement, unknown, HTMLElement, undefined>,
    private namesGroup: d3.Selection<SVGGElement, unknown, HTMLElement, undefined>,
    radius: number,
    private config: Config,
    private itemModel: ItemModel,
    private scale: ScaleGenerator
  ) {
    this.radialAxis = createRadialAxis(this.scale, radius, config);
    this.arcAxis = createArcAxis(this.scale, config);
  }

  update() {
    const scaleXCopied = this.scale.x.copy();
    scaleXCopied.domain(this.scale.x.domain().slice().reverse());
    const namesAxis = d3.axisBottom(scaleXCopied)

    this.arcAxisGroup
      .call(this.radialAxis)
      .call(this.arcAxis)
      .attr('transform', `translate(${this.config.radialLength}, ${this.config.radialLength})`)
    this.arcAxisGroup.selectAll('text')
      .attr('font-size', this.config.radialTextSize)
      .attr('font-family', this.config.radialTextFamily)
      .attr('fill', this.config.radialTextColor)
    this.namesGroup
      .call(namesAxis)
      .attr('transform', `translate(${this.config.radialLength - this.scale.x.range().at(0)!}, ${this.config.radialLength})`);
    this.namesGroup.selectAll('text')
      .attr('transform', `rotate(-45)`)
      .attr('text-anchor', 'end')
      .attr('font-size', this.config.xTextSize)
      .attr('font-family', this.config.xTextFamily)
      .attr('fill', this.config.xTextColor)
      .style('cursor', 'pointer')

    this.namesGroup.selectAll('text')
      .on(this.config.eventHandlerEvent, (_, d) => {
        this.config.eventHandlerHandler(Array.from(this.itemModel.getMenu).find((item) => item.name === d)!)
      })
  }
}
