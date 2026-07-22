import { MemoryCenter } from './memory';

export class LearningCenter {
  static learnFromEvidence(task: { id: number; name: string }, evidenceContent: string): { target: string; mutationStatus: string } {
    console.log(`[Learning Center] Analyzing evidence for task: ${task.name}`);
    
    let targetRule = 'General Operational Guideline';
    let mutation = 'None';

    if (task.name.includes('Sáng tạo Content') || task.name.includes('SEO')) {
      targetRule = 'Postings Schedule Limit Rule';
      mutation = 'Đã tối ưu hóa lịch đăng bài vào tối muộn để đạt tương tác tối đa (+12% Reach).';
      // Register mutation in memory
      MemoryCenter.addRecord('operational', `Mutated Rule [${targetRule}]: ${mutation}`);
    } else if (task.name.includes('Tuyển dụng') || task.name.includes('Phỏng vấn')) {
      targetRule = 'Interview Assessment Rubric';
      mutation = 'Cập nhật tiêu chí phỏng vấn: Đòi hỏi KTV có tối thiểu 2 năm kinh nghiệm trị liệu da liễu.';
      MemoryCenter.addRecord('operational', `Mutated Rule [${targetRule}]: ${mutation}`);
    }

    return {
      target: targetRule,
      mutationStatus: mutation
    };
  }
}
