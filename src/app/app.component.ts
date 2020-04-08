import { Component, OnInit, ViewEncapsulation } from '@angular/core';

import * as d3 from 'd3';

interface Node {
  id: string;
  group: number;
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
  width: number;
  height: number;
  currentLevel: string;
  radius: number = 40;
  node: any;
  link: any;
  graph: any;
  simulation: any;

  constructor() {

    this.currentLevel = this.levels[this.currentLevelIndex];

  }  


  render( nodes, links) {

    const simulation = this.simulation;

    function dragstarted(d) {
      if (!d3.event.active) { simulation.alphaTarget(0.3).restart(); }
      d.fx = d.x;
      d.fy = d.y;
    }

    function dragged(d) {
      d.fx = d3.event.x;
      d.fy = d3.event.y;
    }

    function dragended(d) {
      if (!d3.event.active) { simulation.alphaTarget(0); }
      d.fx = null;
      d.fy = null;
    }

        
    const graph:Graph = <Graph>{ nodes, links };

    this.link = this.svg.append('g')
      .attr('class', 'links')
      .selectAll('line')
        .data(graph.links)
        .enter()
        .append('line')
     // .attr('stroke-width', (d: any) => Math.sqrt(d.value));

    this.node = this.svg.append('g')
      .attr('class', 'nodes')
      .selectAll(".node").data(graph.nodes);


    const nodeEnter = this.node.enter()  
      .append("g")
      .attr("class", "node")
      .attr("id", d => "node-" + d.id )

    nodeEnter
      .append('circle')
        .attr('r', this.radius)
        .attr('fill', (d: any) => d.color || '#55F')
        .call(d3.drag()
          .on('start', dragstarted)
          .on('drag', dragged)
          .on('end', dragended)
    );

    nodeEnter  
      .append('text')
        .text(d => d.Name)
        .attr('dy',5)


    simulation.nodes(graph.nodes);
   

  }

  ngOnInit() {

    console.log('D3.js version:', d3['version']);

    this.svg = d3.select('svg');    
    const sizes = this.svg.node().getBoundingClientRect();

    this.width = sizes.width;
    this.height = sizes.height;

    
    let currentLevelIndex = 0;

   

    this.simulation = d3.forceSimulation()
      .force('link', d3.forceLink().id((d: any) => d.id))
      .force('charge', d3.forceManyBody())
      .force('collide',d3.forceCollide()
        .strength(1)
        .radius(d => this.radius + 10).iterations(2)
      )
      .force('centerX', d3.forceX(this.width / 2))
      .force('centerY', d3.forceY(this.height / 2));


    d3.json('assets/data.json', (err, alldata: any) => {
      if (err) { throw new Error('Bad data file!'); }

      const nodes: Node[] = [];
      const links: Link[] = [];

      const that = this;

      const link = this.link;
      const node = this.node;
      
      const data = alldata[this.currentLevel];

      data.forEach((d) => {
        d.size = 40;
        nodes.push(<Node>d);
      });
/*
      data.links.forEach((d) => {
        links.push(<Link>d);
      });
  */

      this.render(nodes,links);

     
      this.simulation
        
        .on('tick', ticked);

      //this.simulation.force<d3.ForceLink<any, any>>('link')
       // .links(graph.links);

        this.simulation.force('link')
          .links(this.graph.links);

      function ticked() {
      /*  link
          .attr('x1', function(d: any) { return d.source.x; })
          .attr('y1', function(d: any) { return d.source.y; })
          .attr('x2', function(d: any) { return d.target.x; })
          .attr('y2', function(d: any) { return d.target.y; });
      */
        node && node
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
    });

  }
}
