import { Controller, Get } from '@nestjs/common';
import * as client from 'prom-client'; // Prometheus metrics library

@Controller('metrics') // Base route = /metrics
export class MetricsController {
  private readonly register: client.Registry;

  constructor() {
    this.register = new client.Registry();
    client.collectDefaultMetrics({ register: this.register });
  }

  @Get() // Handles GET /metrics
  async getMetrics(): Promise<string> {
    // Returns Prometheus-formatted metrics
    return this.register.metrics();
  }
}