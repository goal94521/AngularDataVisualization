import { Component, OnInit, ViewEncapsulation } from '@angular/core';

import * as d3 from 'd3';

interface Node {
  id: string;
  did: string;
  data: any;
  index?: number;
  x?: number;
  y?: number;
  vx?: number;
  vy?: number;
  fx?: number | null;
  fy?: number | null;
}

interface Link {
  source: any;
  target: any;
  value: number;
}

interface Graph {
  nodes: Node[];
  links: Link[];
}

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
  encapsulation: ViewEncapsulation.None
})

export class AppComponent implements OnInit {

 
  levels: string[] = [ "Organization", "Team", "Employee" ];
  currentLevelIndex: number = 0;
  svg: any;
  nodeBase: any;
  linkBase: any;
  width: number;
  height: number;
  currentLevel: string;
  radius: number = 40;
  node: any;
  link: any;
  graph: any;
  simulation: any;
  state : any;
  tooltip: any;
  tooltipFields: any;

  parentNodes: Node[] = [];
  nodes: Node[] = [];
  links: Link[] = [];


  constructor() {
    this.currentLevel = this.levels[this.currentLevelIndex];      
  }  


  draw( ) {

    const simulation = this.simulation;
    const nodes = this.nodes;
    const links = this.links;
       
    const graph:Graph = <Graph>{ nodes, links };

    console.log(graph.nodes);

    const that = this;

    const link = this.linkBase
      .selectAll('.links')
        .data(graph.links);

    link.exit().transition().duration(500)
        .style('opacity',0)
        .remove();        

    const linkEnter = link   
        .enter()
        .append('line')
        .classed('links', true)
        .style('opacity',0)
        
    linkEnter.transition().duration(500)
      .style('opacity',1)
    
    const allLinks = linkEnter.merge(link);

    const node = this.nodeBase
      .selectAll(".nodes").data(graph.nodes, d => d.id);

    node.exit().transition().duration(500)
      .style('opacity',0)
      .remove();

    const nodeEnter = node.enter()  
      .append("g")
      .attr("class", "nodes")
      .style('opacity',0)
      .attr("id", (d: any) => { 
        //console.log('Node created:' + d.id); 
          return  "node-" + d.id })    
      .on("mousemove", (d) => {
        this.tooltip
            .style("left",d3.event.pageX + 20 + "px")
            .style("top",d3.event.pageY  -10 + "px")

        })
      .on("mouseover", (d) => {
        if(!this.tooltipFields) return;
        this.tooltip
            .html( that.tooltipFunc(d) )
            .transition()
            .duration(500)
            .style("opacity", 1)
        })
      .on("mouseout", (d) => {
        this.tooltip
            .transition()
            .duration(400)
            .style("opacity", 0)
        })
      .call(
        d3.drag()
            .on("start", (d: any) => {
                if (!d3.event.active)
                    that.simulation.alphaTarget(0.01).restart()
                d.fx = d.x
                d.fy = d.y
               // d.movable = true
            })
            .on("drag",(d: any) => {
                d.fx = d3.event.x
                d.fy = d3.event.y
            })
            .on("end", (d: any) => {
                if (!d3.event.active) that.simulation.alphaTarget(0)
                d.fx = d.x // null
                d.fy = d.y // null
            })
    )


    nodeEnter
      .append('circle')
        .attr('r', d => this.radius - d.level *5)
        .attr('fill', (d: any) => d3.hsl(d.color || '#55F').darker(this.currentLevelIndex))
        .on('mouseover', (d: any) => {
          const el = d3.select(d3.event.currentTarget);
          el.attr('r', this.radius+10 - d.level *5);
        })
        .on('mouseout', (d: any) => {
          const el = d3.select(d3.event.currentTarget);
          el.transition().duration(300).attr('r', this.radius - d.level *5);
        })
        .on('click', (d: Node ,i) => {
          this.currentLevelIndex++;
          this.parentNodes.push(d);
          this.loadData('assets/data.json');     
          simulation.alpha(0.5).restart();     
        })
        .on("contextmenu", (d: any) => {
          if(this.currentLevelIndex) {
            this.currentLevelIndex--;
            this.parentNodes.pop();
            this.loadData('assets/data.json');       
            simulation.alpha(0.5).restart();
          }         
          d3.event.preventDefault();          
        })


    nodeEnter  
      .append('text')        
        .text(d => d.Name)
        .attr('dy',5)

    nodeEnter.transition().duration(500).style('opacity',1)

    const allNodes = nodeEnter.merge(node);

    simulation.nodes(graph.nodes)
        .on('tick', ticked)
        .force("link",d3.forceLink().links(graph.links).strength(0.01));

    


    function ticked() {

      allLinks  
        .attr('x1', function(d: any) { return d.source.x; })
        .attr('y1', function(d: any) { return d.source.y; })
        .attr('x2', function(d: any) { return d.target.x; })
        .attr('y2', function(d: any) { return d.target.y; });
  
      allNodes
        .attr(
          "transform",
            d => "translate(" +  ( 
              [
                d.x = Math.max(d.size, Math.min(that.width - d.size, d.x)),
                d.y = Math.max(d.size, Math.min(that.height - d.size, d.y))
            ] ) +
         ")"
    )

  }
   

  }

  processData(error: any, alldata: any) {



    const currentLevel = this.levels[this.currentLevelIndex];
    const data = alldata[currentLevel];
    if(!data) return false;
    let index = 1;
    this.links = [];
    this.nodes = [];

    if(this.parentNodes.length) {
      this.nodes.push(this.parentNodes[this.parentNodes.length-1]);
    }

    
    data.forEach((d) => {
      d.id = currentLevel + '_' + index++;
      if(this.nodes[0] && this.nodes[0].id == d.id) return;

      if(d._tooltipFields) {     
        this.tooltipFields = d._tooltipFields;
      }
      d.size = 40;
      d.x = this.width/2;
      d.y = this.height/2;
      d.level = this.currentLevelIndex;
      d.Name = d.Name || d.Firstname;
      d.data = d;
      this.nodes.push(<Node>d);
      if(this.currentLevelIndex) { // create link to parent element
        const link : Link = { source: this.nodes[0], target: this.nodes[this.nodes.length-1], value: 1}
        this.links.push(<Link>link);
      }
    });

   
    this.draw();

  }

  loadData(url: string) {

    d3.queue()
      .defer(d3.json, url)      
      .await(this.processData.bind(this));
  }

  

  tooltipFunc(d) {
    if(!this.tooltipFields) return "";         
    return this.tooltipFields.map(dd => {return dd + ' : ' + d[dd] }).join("<br>");
 }

  ngOnInit() {

    this.svg = d3.select('svg');    
    this.svg.attr("oncontextmenu", "return false;")
        .attr("preserveAspectRatio", "xMinYMin meet")
    this.nodeBase = d3.select('#nodeBase');
    this.linkBase = d3.select('#linkBase');
    this.tooltip = d3.select("#graph-tooltip");

    const sizes = this.svg.node().getBoundingClientRect();

    this.width = sizes.width;
    this.height = sizes.height;

    this.simulation = d3.forceSimulation()
    //  .force('link', d3.forceLink().id((d: any) => d.id))
      .force('charge', d3.forceManyBody())
      .force('collide',d3.forceCollide()
        .strength(1)
        .radius(d => this.radius + 10).iterations(2)
      )
      .force('centerX', d3.forceX(this.width / 2))
      .force('centerY', d3.forceY(this.height / 2));

      this.loadData('assets/data.json');
   
  }
}
