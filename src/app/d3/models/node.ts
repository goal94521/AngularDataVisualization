import APP_CONFIG from '../../app.config';

export class Node implements d3.SimulationNodeDatum {
  // optional - defining optional implementation properties - required for relevant typing assistance
  index?: number;
  x?: number;
  y?: number;
  vx?: number;
  vy?: number;
  fx?: number | null;
  fy?: number | null;

  id: string;
  data: Object;
  linkCount: number = 0;

  constructor(id, data = {}) {
    this.id = id;
    this.data = data;
  }

  normal = () => {
    return 40;
  }

  get r() {
    return this.normal() + 10;
  }

  get fontSize() {
    return (this.normal() /8 + 5) + 'px';
  }

  get color() {
    return this.data.color || APP_CONFIG.DEFAULT_COLOR;
  }
}
