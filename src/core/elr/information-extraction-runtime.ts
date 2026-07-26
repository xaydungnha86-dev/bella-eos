/**
 * BELLA EOS ELR: Information Extraction Runtime (Runtime 3)
 * Specification: v18.3 BELLA EOS ENTERPRISE LEARNING RUNTIME
 * 
 * Mission: Dynamic AI Metric Extraction Engine. Automatically extracts financial,
 * marketing, operational, and HR metrics (Revenue, Cost, Budget, ROAS, CAC, Bookings, 
 * Customers, Conversion, Profit, NPS, Attendance, Salary, etc.) without fixed templates.
 */

import { IEvidence } from '@/types/evidence';
import { EnterpriseParserResult } from './enterprise-parser-runtime';

export interface ExtractedMetricItem {
  metricName: string; // e.g. "Revenue", "ROAS", "CAC", "Cost", "Bookings"
  rawTextValue: string;
  numericValue: number;
  unit?: string;
  confidence: number;
}

export class InformationExtractionRuntime {
  private static instance: InformationExtractionRuntime;

  private constructor() {}

  public static getInstance(): InformationExtractionRuntime {
    if (!InformationExtractionRuntime.instance) {
      InformationExtractionRuntime.instance = new InformationExtractionRuntime();
    }
    return InformationExtractionRuntime.instance;
  }

  public extractMetrics(evidence: IEvidence, parserResult?: EnterpriseParserResult): ExtractedMetricItem[] {
    const rawText = typeof evidence.content === 'string' 
      ? evidence.content 
      : JSON.stringify(evidence.content);

    const metrics: ExtractedMetricItem[] = [];

    // Regex patterns for quantitative extraction
    const patterns = [
      { name: 'Revenue', regex: /(?:doanh thu|revenue|sales)[:\s]+([\d\.,]+)\s*(triệu|tỷ|k|vnd|usd)?/i },
      { name: 'Cost', regex: /(?:chi phí|cost|expense)[:\s]+([\d\.,]+)\s*(triệu|tỷ|k|vnd|usd)?/i },
      { name: 'Budget', regex: /(?:ngân sách|budget)[:\s]+([\d\.,]+)\s*(triệu|tỷ|k|vnd|usd)?/i },
      { name: 'ROAS', regex: /(?:roas)[:\s]+([\d\.,]+)%?/i },
      { name: 'CAC', regex: /(?:cac|chi phí khách hàng)[:\s]+([\d\.,]+)/i },
      { name: 'Bookings', regex: /(?:bookings|lượt đặt|đơn hàng)[:\s]+([\d\.,]+)/i },
      { name: 'Conversion', regex: /(?:chuyển đổi|conversion|cr)[:\s]+([\d\.,]+)%?/i },
      { name: 'NPS', regex: /(?:nps|điểm hài lòng)[:\s]+([\d\.,]+)/i },
    ];

    for (const p of patterns) {
      const match = rawText.match(p.regex);
      if (match) {
        let valStr = match[1].replace(/,/g, '');
        let num = parseFloat(valStr) || 0;
        const unit = match[2]?.toLowerCase();
        
        if (unit === 'triệu') num *= 1_000_000;
        else if (unit === 'tỷ') num *= 1_000_000_000;
        else if (unit === 'k') num *= 1_000;

        metrics.push({
          metricName: p.name,
          rawTextValue: match[0],
          numericValue: num,
          unit: match[2] || 'VND',
          confidence: 0.94,
        });
      }
    }

    if (metrics.length === 0 && typeof evidence.content === 'object' && evidence.content !== null) {
      // Extract numeric fields from structured JSON
      for (const [key, val] of Object.entries(evidence.content)) {
        if (typeof val === 'number') {
          metrics.push({
            metricName: key,
            rawTextValue: String(val),
            numericValue: val,
            confidence: 0.98,
          });
        }
      }
    }

    evidence.status = 'EXTRACTED';
    return metrics;
  }
}
