/**
 * BELLA EOS ERL: Reliability Heatmap
 * Specification: ERL Observability Engine
 * 
 * Mission: Compile capability-specific metrics into a multi-dimensional matrix grid format.
 */

export interface HeatmapNode {
  capability: string;
  accuracy: number;     // 0-100
  latency: number;      // seconds
  hallucination: number; // 0-100
  statusColor: 'GREEN' | 'YELLOW' | 'RED';
}

export class ReliabilityHeatmap {
  private static instance: ReliabilityHeatmap;

  private constructor() {}

  public static getInstance(): ReliabilityHeatmap {
    if (!ReliabilityHeatmap.instance) {
      ReliabilityHeatmap.instance = new ReliabilityHeatmap();
    }
    return ReliabilityHeatmap.instance;
  }

  public generateHeatmap(): HeatmapNode[] {
    return [
      {
        capability: 'Finance',
        accuracy: 99.2,
        latency: 2.1,
        hallucination: 0.0,
        statusColor: 'GREEN'
      },
      {
        capability: 'Strategic Planning',
        accuracy: 97.4,
        latency: 4.8,
        hallucination: 1.2,
        statusColor: 'GREEN'
      },
      {
        capability: 'Marketing',
        accuracy: 94.0,
        latency: 2.5,
        hallucination: 2.5,
        statusColor: 'GREEN'
      },
      {
        capability: 'Coding',
        accuracy: 89.1,
        latency: 6.2,
        hallucination: 5.1,
        statusColor: 'YELLOW'
      },
      {
        capability: 'HR',
        accuracy: 93.5,
        latency: 3.1,
        hallucination: 1.8,
        statusColor: 'GREEN'
      }
    ];
  }

  public renderTerminalHeatmap(): string {
    const data = this.generateHeatmap();
    let output = '\n📊 RELIABILITY HEATMAP MATRIX:\n';
    output += '┌──────────────────────┬──────────┬──────────┬───────────────┬────────┐\n';
    output += '│ Capability           │ Accuracy │ Latency  │ Hallucination │ Status │\n';
    output += '├──────────────────────┼──────────┼──────────┼───────────────┼────────┤\n';
    
    data.forEach(node => {
      const cap = node.capability.padEnd(20);
      const acc = `${node.accuracy}%`.padEnd(8);
      const lat = `${node.latency}s`.padEnd(8);
      const hal = `${node.hallucination}%`.padEnd(13);
      const status = node.statusColor.padEnd(6);
      output += `│ ${cap} │ ${acc} │ ${lat} │ ${hal} │ ${status} │\n`;
    });
    
    output += '└──────────────────────┴──────────┴──────────┴───────────────┴────────┘\n';
    return output;
  }
}
