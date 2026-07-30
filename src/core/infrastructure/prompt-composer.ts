/**
 * Dynamic Prompt Composer
 * Composes prompt stacks: `System Prompt + Capability Prompt + Company Prompt + Task Prompt + Output Contract`.
 */

import { CanonicalContextPackageV1 } from '../contracts/context-contract';

export interface PromptCompositionInput {
  systemPrompt: string;
  capabilityName: string;
  contextPackage: CanonicalContextPackageV1;
  taskDescription?: string;
  outputContractJsonSchema?: string;
}

export class PromptComposer {
  public static compose(input: PromptCompositionInput): string {
    const { systemPrompt, capabilityName, contextPackage, taskDescription, outputContractJsonSchema } = input;

    const brand = contextPackage.brandDna;
    const coverage = contextPackage.coverage;

    const companyPromptBlock = `--- BELLA EOS ENTERPRISE BRAND DNA ---
Thương hiệu: ${brand.brandName}
Tông giọng: ${brand.voiceTone}
Phong cách thiết kế: ${brand.designStyle}
Phân khúc mục tiêu: ${brand.targetSegment}
Mục tiêu chiến lược: ${brand.strategicIntent}`;

    const dataFactBlock = `--- BELLA EIP CRM/ERP LIVE DATA FACTS ---
Số Khách CRM Hoạt Động: ${coverage.crmActiveCount}
Số Lịch Hẹn Đặt: ${coverage.appointmentCount}
Số Kỹ Thuật Viên (KTV): ${coverage.technicianCount} | Nhân sự: ${coverage.staffCount}
Doanh thu Tháng: ${(coverage.monthlyRevenueVnd / 1000000).toFixed(0)}M VND | Chi phí: ${(coverage.monthlyExpensesVnd / 1000000).toFixed(0)}M VND
Hạn Mức Ngân Sách An Toàn (Policy Guard): ${(coverage.approvedBudgetLimitVnd / 1000000).toFixed(0)}M VND`;

    const taskBlock = taskDescription ? `\n--- THÔNG TIN NHIỆM VỤ THỰC THI ---\nNhiệm vụ (${capabilityName}): "${taskDescription}"` : '';

    const schemaBlock = outputContractJsonSchema ? `\n--- QUY ĐỊNH HẠN NGHĨA OUTPUT JSON SCHEMA ---\nBạn BẮT BUỘC trả về kết quả khớp với JSON Schema sau:\n${outputContractJsonSchema}` : '';

    return `${systemPrompt}

${companyPromptBlock}

${dataFactBlock}
${taskBlock}
${schemaBlock}

Mục tiêu CEO giao phó: "${contextPackage.objective}"`;
  }
}
