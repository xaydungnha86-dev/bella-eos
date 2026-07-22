export interface MemoryRecord {
  id: string;
  category: 'operational' | 'business' | 'conversation' | 'decision' | 'document';
  content: string;
  timestamp: string;
  metadata?: any;
}

export class MemoryCenter {
  private static buffers: MemoryRecord[] = [
    {
      id: 'mem_op_001',
      category: 'operational',
      content: 'Activated SOP v1.1 status: OK',
      timestamp: new Date().toISOString()
    },
    {
      id: 'mem_biz_001',
      category: 'business',
      content: 'Tháng trước: ROI đạt được: 345% | Doanh thu: 420M VND',
      timestamp: new Date().toISOString()
    },
    {
      id: 'mem_dec_001',
      category: 'decision',
      content: 'DEC-001: Khởi động chiến dịch marketing Zalo OA (ROI 380%)',
      timestamp: new Date().toISOString(),
      metadata: { score: 95 }
    }
  ];

  static addRecord(category: 'operational' | 'business' | 'conversation' | 'decision' | 'document', content: string, metadata?: any): MemoryRecord {
    const record: MemoryRecord = {
      id: `mem_${category.substring(0, 3)}_${Date.now()}`,
      category,
      content,
      timestamp: new Date().toISOString(),
      metadata
    };
    this.buffers.push(record);
    console.log(`[Memory Center] Added record to category [${category}]:`, content);
    return record;
  }

  static getRecordsByCategory(category: 'operational' | 'business' | 'conversation' | 'decision' | 'document'): MemoryRecord[] {
    return this.buffers.filter(r => r.category === category);
  }

  static getAllRecords(): MemoryRecord[] {
    return [...this.buffers];
  }
}
