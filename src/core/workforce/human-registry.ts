export interface HumanWorker {
  id: string;
  name: string;
  avatar: string;
  role: string;
  department: string;
  skills: string[];
  experience: number; // 1 to 5 stars
  workload: number;    // workload percentage (0-100)
  workingHours: string;
  timezone: string;
  performanceHistory: number; // Average rating (e.g. 4.9)
  hourlyCost: number; // in USD
  status: 'idle' | 'working' | 'overloaded';
}

export const HUMAN_WORKER_REGISTRY: HumanWorker[] = [
  {
    id: 'nguyen_van_a',
    name: 'Nguyễn Văn A',
    avatar: '👨‍💼',
    role: 'Senior Creative Designer',
    department: 'Thiết Kế & Sáng Tạo',
    skills: ['Photoshop', 'Premiere', 'Branding', 'create_banner_design', 'generate_media_creative'],
    experience: 5,
    workload: 68,
    workingHours: '08:00 - 17:30',
    timezone: 'GMT+7',
    performanceHistory: 4.9,
    hourlyCost: 25,
    status: 'working'
  },
  {
    id: 'tran_thi_b',
    name: 'Trần Thị B',
    avatar: '👩‍💼',
    role: 'Marketing Copywriter Specialist',
    department: 'Truyền Thông & Nội Dung',
    skills: ['Copywriting', 'SEO', 'Zalo Marketing', 'write_facebook_post', 'write_zalo_message'],
    experience: 4,
    workload: 40,
    workingHours: '08:30 - 18:00',
    timezone: 'GMT+7',
    performanceHistory: 4.7,
    hourlyCost: 18,
    status: 'idle'
  },
  {
    id: 'le_van_c',
    name: 'Lê Văn C',
    avatar: '👨‍💻',
    role: 'PR Coordinator',
    department: 'Quan Hệ Công Chúng',
    skills: ['Translation', 'PR', 'Outreach', 'write_press_release', 'manage_brand_reputation'],
    experience: 3,
    workload: 25,
    workingHours: '09:00 - 18:00',
    timezone: 'GMT+7',
    performanceHistory: 4.5,
    hourlyCost: 15,
    status: 'idle'
  }
];
