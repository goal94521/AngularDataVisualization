import { Component, OnInit } from '@angular/core';
import APP_CONFIG from '../../app.config';
import {Link, Node} from "../models";


import jsonData  from '../../../../data.json';


@Component({
  selector: 'app-basic-chart',
  templateUrl: './basic-chart.component.html',
  styleUrls: ['./basic-chart.component.scss']
})
export class BasicChartComponent implements OnInit {

  nodes: Node[] = [];
  links: Link[] = [];
  level: integer;

  constructor() {

    this.level = "Organization";
    let i = 0;
    
    const nodeData = jsonData[this.level],
        getIndex = number => number - 1

    nodeData.forEach( d => {
      if(d.id === undefined) d.id == i++;
      this.nodes.push(new Node(d.id,d));
    });

    console.log(this.nodes);

    return;


    console.log(jsonData)
    const N = APP_CONFIG.N,
      ;

    /** constructing the nodes array */
    for (let i = 1; i <= N; i++) {
      this.nodes.push(new Node(i));
    }

    for (let i = 1; i <= N; i++) {
      for (let m = 2; i * m <= N; m++) {
        /** increasing connections toll on connecting nodes */
        this.nodes[getIndex(i)].linkCount++;
        this.nodes[getIndex(i * m)].linkCount++;

        /** connecting the nodes before starting the simulation */
        this.links.push(new Link(i, i * m));
      }
    }
  }

  ngOnInit(): void {
  }

}
