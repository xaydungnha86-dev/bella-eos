import { MemoryCenter } from './memory';

export interface FeedbackRecord {
  id: string;
  taskId?: string;
  taskName?: string;
  rating: number; // 1-5
  feedbackText: string;
  category?: 'content' | 'creative' | 'strategy' | 'publisher' | 'general';
  timestamp: string;
  sopMutation: string;
}

export class LearningCenter {
  private static feedbackHistory: FeedbackRecord[] = [];

  static submitFeedback(feedback: {
    taskId?: string;
    taskName?: string;
    rating: number;
    feedbackText: string;
    category?: 'content' | 'creative' | 'strategy' | 'publisher' | 'general';
  }): FeedbackRecord {
    const category = feedback.category || 'general';
    let sopMutation = 'Đã cập nhật quy chuẩn vận hành dựa trên phản hồi của CEO.';

    if (feedback.rating >= 4) {
      sopMutation = `[Ưu tiên Mẫu Thành Công]: Ghi nhận đánh giá ${feedback.rating}⭐ cho "${feedback.taskName || 'Nhiệm vụ'}". Giữ vững phong cách: "${feedback.feedbackText}".`;
    } else {
      sopMutation = `[Đột Biến SOP Khắc Phục]: Đánh giá ${feedback.rating}⭐ cho "${feedback.taskName || 'Nhiệm vụ'}". Điều chỉnh: "${feedback.feedbackText}". Tránh lỗi này trong các chiến dịch tới.`;
    }

    const record: FeedbackRecord = {
      id: `fb_${Date.now()}`,
      taskId: feedback.taskId,
      taskName: feedback.taskName,
      rating: feedback.rating,
      feedbackText: feedback.feedbackText,
      category,
      timestamp: new Date().toISOString(),
      sopMutation
    };

    this.feedbackHistory.unshift(record);

    // Save to MemoryCenter
    MemoryCenter.addRecord('decision', `CEO Feedback [Rating: ${feedback.rating}/5]: ${feedback.feedbackText}`, {
      sopMutation,
      taskId: feedback.taskId
    });

    // Save to LocalStorage if client-side
    if (typeof window !== 'undefined') {
      try {
        const stored = JSON.parse(localStorage.getItem('bella_eos_learning_history') || '[]');
        stored.unshift(record);
        localStorage.setItem('bella_eos_learning_history', JSON.stringify(stored.slice(0, 50)));
      } catch (e) {}
    }

    return record;
  }

  static getFeedbackHistory(): FeedbackRecord[] {
    if (typeof window !== 'undefined') {
      try {
        const stored = JSON.parse(localStorage.getItem('bella_eos_learning_history') || '[]');
        if (stored.length > 0) return stored;
      } catch (e) {}
    }
    return [...this.feedbackHistory];
  }

  static getLearnedLessonsPrompt(): string {
    const lessons = this.getFeedbackHistory();
    if (lessons.length === 0) return '';

    const summary = lessons.slice(0, 5).map((l, i) =>
      `• [Đánh giá ${l.rating}⭐] (${l.taskName || 'Chiến dịch'}): "${l.feedbackText}" ➔ Đột biến SOP: ${l.sopMutation}`
    ).join('\n');

    return `\n\n📌 TRI THỨC VÀ BÀI HỌC ĐÃ TÍCH LŨY TỪ PHẢN HỒI CEO (CONTINUOUS LEARNING MEMORY):\n${summary}\nHãy BẮT BUỘC áp dụng các bài học và đột biến SOP trên vào quá trình lập kế hoạch và sáng tạo nội dung mới!`;
  }

  static learnFromEvidence(task: { id: number; name: string }, evidenceContent: string): { target: string; mutationStatus: string } {
    console.log(`[Learning Center] Analyzing evidence for task: ${task.name}`);
    let targetRule = 'General Operational Guideline';
    let mutation = 'Đã tối ưu hóa lịch đăng bài vào các khung giờ vàng để đạt tương tác tối đa.';

    MemoryCenter.addRecord('operational', `Mutated Rule [${targetRule}]: ${mutation}`);

    return {
      target: targetRule,
      mutationStatus: mutation
    };
  }
}
