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
  source: string;
  target: string;
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


   nodes: Node[] = [];
   links: Link[] = [];


  constructor() {

    this.currentLevel = this.levels[this.currentLevelIndex];

  }  


  render( ) {

    const simulation = this.simulation;
    const nodes = this.nodes;
    const links = this.links;
       
    const graph:Graph = <Graph>{ nodes, links };
    const that = this;

    const link = this.linkBase
      .selectAll('.links')
        .data(graph.links);

    const linkEnter = link   
        .enter()
        .append('line')
        .classed('links', true)

    const node = this.nodeBase
      .selectAll(".nodes").data(graph.nodes, d => d.id);

    node.exit().remove();

    const nodeEnter = node.enter()  
      .append("g")
      .attr("class", "nodes")
      .attr("id", (d: any) => {console.log(d); return "node-" + d.id } )
      .call(
        d3.drag()
            .on("start", (d: any) => {
                if (!d3.event.active)
                    that.simulation.alphaTarget(0.01).restart()
                d.fx = d.x
                d.fy = d.y
                d.movable = true
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
        }).on('click', (d: any ,i) => {
          const el = d3.select(d3.event.currentTarget);
          this.currentLevelIndex++;
          this.nodes = [d];
          this.loadData('assets/data.json');
          
        });


    nodeEnter  
      .append('text')        
        .text(d => d.Name)
        .attr('dy',5)

    nodeEnter.merge(node)

    simulation.nodes(graph.nodes)
      .on('tick', ticked);

    const forceLink = d3.forceLink().links(graph.links).strength(0.01)

    simulation.force("link",forceLink);


    function ticked() {
  

      linkEnter  
        .attr('x1', function(d: any) { return d.source.x; })
        .attr('y1', function(d: any) { return d.source.y; })
        .attr('x2', function(d: any) { return d.target.x; })
        .attr('y2', function(d: any) { return d.target.y; });
  
      nodeEnter
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
   
   // simulation.force<d3.ForceLink<any, any>>('link')
   // .links(graph.links);

  }

  processData(error: any, alldata: any) {


    console.log(alldata);

    const currentLevel = this.levels[this.currentLevelIndex];
    const data = alldata[currentLevel];
    let index = 1;

    data.forEach((d) => {
      d.size = 40;
      d.x = this.width/2;
      d.y = this.height/2;
      d.id = currentLevel + '_' + index++;
      d.level = this.currentLevelIndex;
      d.Name = d.Name || d.Firstname;
      d.data = d;
      this.nodes.push(<Node>d);
    });


    data.links && data.links.forEach((d) => {
      this.links.push(<Link>d);
    });

    this.render();


  }

  loadData(url: string) {

    d3.queue()
    .defer(d3.json, url)      
      .await(this.processData.bind(this));
}

  ngOnInit() {

    console.log('D3.js version:', d3['version']);

    this.svg = d3.select('svg');    
    this.nodeBase = d3.select('#nodeBase');
    this.linkBase = d3.select('#linkBase');

    const sizes = this.svg.node().getBoundingClientRect();

    this.width = sizes.width;
    this.height = sizes.height;

    this.simulation = d3.forceSimulation()
      .force('link', d3.forceLink().id((d: any) => d.id))
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
