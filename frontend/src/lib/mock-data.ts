// Mock data for the Veduwa demo
export interface Job {
  id: string
  title: string
  company: string
  companyLogo: string
  location: string
  jobType: 'full_time' | 'contract' | 'remote'
  salaryMin: number
  salaryMax: number
  seniority: 'junior' | 'mid' | 'senior' | 'lead'
  skills: string[]
  description: string
  status: 'active' | 'closed' | 'draft'
  candidateCount: number
  topMatch: number
  createdAt: string
}

export interface Candidate {
  id: string
  name: string
  avatar: string
  avatarUrl?: string
  title: string
  location: string
  skills: string[]
  experienceYears: number
  matchScore: number
  status: 'pending' | 'screening' | 'interviewed' | 'accepted' | 'rejected'
  summary: string
  email: string
}

export interface Screening {
  id: string
  candidateName: string
  jobTitle: string
  matchScore: number
  status: 'in_progress' | 'completed' | 'pending'
  startedAt: string
  messages: { role: 'ai' | 'candidate' | 'system'; content: string; timestamp: string }[]
}

export interface DashboardStats {
  activeJobs: number
  activeJobsDelta: number
  totalCandidates: number
  totalCandidatesDelta: number
  avgMatchScore: number
  avgMatchScoreDelta: number
  pendingScreenings: number
  pendingScreeningsDelta: number
}

export const mockStats: DashboardStats = {
  activeJobs: 12,
  activeJobsDelta: 3,
  totalCandidates: 284,
  totalCandidatesDelta: 47,
  avgMatchScore: 78,
  avgMatchScoreDelta: 5,
  pendingScreenings: 8,
  pendingScreeningsDelta: -2,
}

export const mockJobs: Job[] = [
  {
    id: '1',
    title: 'Senior Full-Stack Engineer',
    company: 'TechFlow AI',
    companyLogo: 'TF',
    location: 'San Francisco, CA',
    jobType: 'full_time',
    salaryMin: 150000,
    salaryMax: 200000,
    seniority: 'senior',
    skills: ['React', 'Node.js', 'TypeScript', 'PostgreSQL', 'AWS'],
    description: 'Build and scale our AI-powered analytics platform. Work with cutting-edge LLM integrations.',
    status: 'active',
    candidateCount: 45,
    topMatch: 94,
    createdAt: '2026-04-01',
  },
  {
    id: '2',
    title: 'ML Engineer — NLP Focus',
    company: 'DataMind Labs',
    companyLogo: 'DM',
    location: 'Remote',
    jobType: 'remote',
    salaryMin: 140000,
    salaryMax: 180000,
    seniority: 'senior',
    skills: ['Python', 'PyTorch', 'Transformers', 'FastAPI', 'Docker'],
    description: 'Design and deploy production NLP models for enterprise document processing.',
    status: 'active',
    candidateCount: 32,
    topMatch: 91,
    createdAt: '2026-04-02',
  },
  {
    id: '3',
    title: 'Frontend Developer — React',
    company: 'Nexus Design',
    companyLogo: 'ND',
    location: 'New York, NY',
    jobType: 'full_time',
    salaryMin: 120000,
    salaryMax: 160000,
    seniority: 'mid',
    skills: ['React', 'TypeScript', 'Tailwind CSS', 'Figma', 'Next.js'],
    description: 'Create beautiful, performant interfaces for our SaaS platform.',
    status: 'active',
    candidateCount: 67,
    topMatch: 88,
    createdAt: '2026-04-03',
  },
  {
    id: '4',
    title: 'DevOps Engineer',
    company: 'CloudScale Inc',
    companyLogo: 'CS',
    location: 'Austin, TX',
    jobType: 'full_time',
    salaryMin: 130000,
    salaryMax: 170000,
    seniority: 'senior',
    skills: ['Kubernetes', 'Terraform', 'AWS', 'CI/CD', 'Python'],
    description: 'Manage and optimize our cloud infrastructure across multiple regions.',
    status: 'active',
    candidateCount: 23,
    topMatch: 86,
    createdAt: '2026-04-04',
  },
  {
    id: '5',
    title: 'Backend Engineer — Python',
    company: 'FinAI Solutions',
    companyLogo: 'FA',
    location: 'Chicago, IL',
    jobType: 'contract',
    salaryMin: 100000,
    salaryMax: 140000,
    seniority: 'mid',
    skills: ['Python', 'FastAPI', 'PostgreSQL', 'Redis', 'Celery'],
    description: 'Build high-performance APIs for our financial analytics platform.',
    status: 'active',
    candidateCount: 38,
    topMatch: 92,
    createdAt: '2026-04-05',
  },
  {
    id: '6',
    title: 'AI Research Intern',
    company: 'DeepLogic AI',
    companyLogo: 'DL',
    location: 'Remote',
    jobType: 'remote',
    salaryMin: 60000,
    salaryMax: 80000,
    seniority: 'junior',
    skills: ['Python', 'TensorFlow', 'Research', 'NLP', 'Statistics'],
    description: 'Join our research team exploring novel approaches to language understanding.',
    status: 'active',
    candidateCount: 89,
    topMatch: 85,
    createdAt: '2026-04-06',
  },
]

export const mockCandidates: Candidate[] = [
  {
    id: '1',
    name: 'Sarah Chen',
    avatar: 'SC',
    avatarUrl: 'https://randomuser.me/api/portraits/women/44.jpg',
    title: 'Senior Full-Stack Developer',
    location: 'San Francisco, CA',
    skills: ['React', 'Node.js', 'TypeScript', 'PostgreSQL', 'AWS', 'Python'],
    experienceYears: 7,
    matchScore: 94,
    status: 'screening',
    summary: 'Experienced full-stack engineer with strong background in React and Node.js. Previously led a team of 5 at a YC-backed startup.',
    email: 'sarah.chen@email.com',
  },
  {
    id: '2',
    name: 'Marcus Johnson',
    avatar: 'MJ',
    avatarUrl: 'https://randomuser.me/api/portraits/men/32.jpg',
    title: 'ML Engineer',
    location: 'New York, NY',
    skills: ['Python', 'PyTorch', 'Transformers', 'FastAPI', 'Docker', 'Kubernetes'],
    experienceYears: 5,
    matchScore: 91,
    status: 'interviewed',
    summary: 'ML engineer specializing in NLP and production model deployment. Published researcher with 3 papers on transformer architectures.',
    email: 'marcus.j@email.com',
  },
  {
    id: '3',
    name: 'Elena Rodriguez',
    avatar: 'ER',
    avatarUrl: 'https://randomuser.me/api/portraits/women/68.jpg',
    title: 'Frontend Engineer',
    location: 'Remote',
    skills: ['React', 'TypeScript', 'Tailwind CSS', 'Next.js', 'Figma', 'Framer Motion'],
    experienceYears: 4,
    matchScore: 88,
    status: 'pending',
    summary: 'Creative frontend developer with an eye for design. Strong portfolio of SaaS products with focus on animation and UX.',
    email: 'elena.r@email.com',
  },
  {
    id: '4',
    name: 'David Kim',
    avatar: 'DK',
    avatarUrl: 'https://randomuser.me/api/portraits/men/75.jpg',
    title: 'DevOps Engineer',
    location: 'Seattle, WA',
    skills: ['Kubernetes', 'Terraform', 'AWS', 'GCP', 'Python', 'Go'],
    experienceYears: 6,
    matchScore: 86,
    status: 'pending',
    summary: 'Infrastructure specialist with experience managing large-scale Kubernetes clusters. AWS Solutions Architect certified.',
    email: 'david.kim@email.com',
  },
  {
    id: '5',
    name: 'Aisha Patel',
    avatar: 'AP',
    avatarUrl: 'https://randomuser.me/api/portraits/women/26.jpg',
    title: 'Backend Engineer',
    location: 'Austin, TX',
    skills: ['Python', 'FastAPI', 'PostgreSQL', 'Redis', 'Celery', 'Docker'],
    experienceYears: 5,
    matchScore: 92,
    status: 'screening',
    summary: 'Backend engineer focused on high-performance APIs and distributed systems. Experience with financial technology platforms.',
    email: 'aisha.p@email.com',
  },
  {
    id: '6',
    name: 'James Wright',
    avatar: 'JW',
    avatarUrl: 'https://randomuser.me/api/portraits/men/22.jpg',
    title: 'Full-Stack Developer',
    location: 'Chicago, IL',
    skills: ['React', 'Python', 'Django', 'PostgreSQL', 'Redis', 'TypeScript'],
    experienceYears: 3,
    matchScore: 79,
    status: 'pending',
    summary: 'Versatile developer comfortable across the stack. Previous experience at two startups building MVP products from scratch.',
    email: 'james.w@email.com',
  },
  {
    id: '7',
    name: 'Lisa Nakamura',
    avatar: 'LN',
    avatarUrl: 'https://randomuser.me/api/portraits/women/90.jpg',
    title: 'AI/ML Engineer',
    location: 'Remote',
    skills: ['Python', 'TensorFlow', 'NLP', 'FastAPI', 'SQL', 'Statistics'],
    experienceYears: 2,
    matchScore: 85,
    status: 'accepted',
    summary: 'Recent MS graduate in Computer Science with focus on NLP. Published work on sentiment analysis and text classification.',
    email: 'lisa.n@email.com',
  },
  {
    id: '8',
    name: 'Omar Hassan',
    avatar: 'OH',
    avatarUrl: 'https://randomuser.me/api/portraits/men/46.jpg',
    title: 'Senior Backend Engineer',
    location: 'Remote',
    skills: ['Go', 'Python', 'PostgreSQL', 'gRPC', 'Kubernetes', 'Redis'],
    experienceYears: 8,
    matchScore: 83,
    status: 'rejected',
    summary: 'Seasoned backend engineer with experience at FAANG companies. Expert in distributed systems and microservices architecture.',
    email: 'omar.h@email.com',
  },
]

export const mockScreening: Screening = {
  id: '1',
  candidateName: 'Sarah Chen',
  jobTitle: 'Senior Full-Stack Engineer',
  matchScore: 94,
  status: 'in_progress',
  startedAt: '2026-04-07T10:30:00Z',
  messages: [
    {
      role: 'system',
      content: 'AI screening session started for Sarah Chen — Senior Full-Stack Engineer at TechFlow AI',
      timestamp: '2026-04-07T10:30:00Z',
    },
    {
      role: 'ai',
      content: "Hello Sarah! I'm the AI interviewer for the Senior Full-Stack Engineer position at TechFlow AI. Let's start with your experience. Can you tell me about a complex full-stack project you've led from architecture to deployment?",
      timestamp: '2026-04-07T10:30:05Z',
    },
    {
      role: 'candidate',
      content: "Sure! At my previous company, I led the rebuild of our analytics dashboard. I designed the system architecture using React with TypeScript on the frontend and Node.js with PostgreSQL on the backend. We served 50K+ daily active users and I implemented real-time data streaming using WebSockets. The project involved migrating from a monolithic Rails app to a microservices architecture on AWS ECS.",
      timestamp: '2026-04-07T10:31:20Z',
    },
    {
      role: 'ai',
      content: "That's impressive! The migration from monolith to microservices is particularly relevant for this role. Can you walk me through how you handled the database migration strategy? Specifically, how did you ensure data consistency during the transition?",
      timestamp: '2026-04-07T10:31:25Z',
    },
    {
      role: 'candidate',
      content: "We used a strangler fig pattern. We kept the old database running and implemented a dual-write strategy where both the old and new services wrote to their respective databases. We used CDC (Change Data Capture) with Debezium to sync data between them. For consistency, we implemented saga patterns for distributed transactions. The whole migration took about 4 months with zero downtime.",
      timestamp: '2026-04-07T10:33:10Z',
    },
    {
      role: 'ai',
      content: "Excellent approach with the strangler fig pattern and CDC. Now, this role involves working with AI/LLM integrations. Have you had experience integrating AI models or LLM APIs into production applications? If so, how did you handle challenges like latency and reliability?",
      timestamp: '2026-04-07T10:33:15Z',
    },
  ],
}

export const allSkills = [
  'React', 'TypeScript', 'Next.js', 'Node.js', 'Python', 'FastAPI', 'Django',
  'PostgreSQL', 'Redis', 'MongoDB', 'AWS', 'GCP', 'Docker', 'Kubernetes',
  'Terraform', 'CI/CD', 'Go', 'Rust', 'Java', 'Spring Boot',
  'PyTorch', 'TensorFlow', 'Transformers', 'NLP', 'Computer Vision',
  'Tailwind CSS', 'Figma', 'GraphQL', 'gRPC', 'Celery',
  'Elasticsearch', 'Kafka', 'RabbitMQ', 'Microservices', 'REST API',
]
