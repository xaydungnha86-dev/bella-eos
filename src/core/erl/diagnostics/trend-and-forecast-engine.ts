/**
 * BELLA EOS ERL: Trend & Forecast Engine
 * Specification: ERL Diagnostics Engine
 * 
 * Mission: Log historical reliability trends and forecast SLA degradation 14 days out.
 */

import { IReliabilityTrend, IReliabilityForecast } from '@/types/erl';

export class TrendAndForecastEngine {
  private static instance: TrendAndForecastEngine;
  private eriLogs: number[] = [];

  private constructor() {
    this.seedHistoricalLogs();
  }

  public static getInstance(): TrendAndForecastEngine {
    if (!TrendAndForecastEngine.instance) {
      TrendAndForecastEngine.instance = new TrendAndForecastEngine();
    }
    return TrendAndForecastEngine.instance;
  }

  public logEri(score: number): void {
    this.eriLogs.push(score);
    if (this.eriLogs.length > 90) {
      this.eriLogs.shift(); // keep 90 days
    }
  }

  public getTrends(): IReliabilityTrend {
    return {
      last7DaysEri: this.eriLogs.slice(-7),
      last30DaysEri: this.eriLogs.slice(-30),
      lastQuarterEri: this.eriLogs.slice(-90)
    };
  }

  /**
   * Forecast future reliability using historical trend lines.
   */
  public generateForecast(targetSlaEri: number): IReliabilityForecast {
    if (this.eriLogs.length < 5) {
      return {
        daysToSlaViolation: -1, // Not enough data
        predictedEriIn14Days: 95.0,
        forecastConfidence: 0.5,
        recommendation: 'Thu thập thêm dữ liệu để chạy dự báo chất lượng.'
      };
    }

    // Linear regression approximation over last 5 entries
    const recent = this.eriLogs.slice(-5);
    let sumX = 0;
    let sumY = 0;
    let sumXY = 0;
    let sumXX = 0;
    const n = recent.length;

    for (let i = 0; i < n; i++) {
      sumX += i;
      sumY += recent[i];
      sumXY += i * recent[i];
      sumXX += i * i;
    }

    const slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);
    const intercept = (sumY - slope * sumX) / n;

    // Project 14 days out
    // The current day is index n - 1
    const targetIndexIn14Days = (n - 1) + 14;
    const predictedEriIn14Days = Math.round((slope * targetIndexIn14Days + intercept) * 100) / 100;

    let daysToSlaViolation = -1;
    let recommendation = 'Hệ thống vận hành ổn định. Các chỉ số đều đạt chuẩn SLA.';

    if (slope < 0) {
      // ERI is dropping
      const currentVal = recent[n - 1];
      const deltaNeeded = targetSlaEri - currentVal;
      
      if (currentVal < targetSlaEri) {
        daysToSlaViolation = 0;
        recommendation = '⚠️ ĐÃ VI PHẠM SLA. Cần kích hoạt quy trình tự sửa lỗi và tăng cường chất lượng RAG.';
      } else {
        const days = Math.round(deltaNeeded / slope);
        if (days > 0 && days <= 30) {
          daysToSlaViolation = days;
          recommendation = `⚠️ DỰ BÁO: Chất lượng sẽ giảm xuống dưới ngưỡng SLA (${targetSlaEri}) trong khoảng ${days} ngày tới do hiện tượng trôi ký ức (Knowledge Drift). Đề xuất tối ưu hóa Chunk Size và tăng TopK.`;
        }
      }
    }

    return {
      daysToSlaViolation,
      predictedEriIn14Days: Math.min(100.0, Math.max(0.0, predictedEriIn14Days)),
      forecastConfidence: 0.85,
      recommendation
    };
  }

  private seedHistoricalLogs(): void {
    // Seed 30 days of ERI climbing and then slightly dipping
    const base = [91, 91, 92, 92, 93, 93, 94, 94, 95, 95, 96, 96, 97, 97, 97, 97, 97, 96, 96, 95.8, 95.6, 95.4, 95.2, 95.0, 94.8, 94.6, 94.4, 94.2, 94.0, 93.8];
    base.forEach(val => this.logEri(val));
  }
}
