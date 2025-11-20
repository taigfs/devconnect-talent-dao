import { JobCategory } from '@/contexts/AppContext';

interface JobFormData {
  title: string;
  description: string;
  reward: string;
  category: JobCategory;
  deadline: string;
}

const jobTitles = [
  'Build a React Dashboard',
  'Create E-commerce Website',
  'Design Mobile App UI',
  'Implement REST API',
  'Develop Smart Contract',
  'Create Marketing Campaign',
  'Build Authentication System',
  'Design Logo and Branding',
  'Optimize Database Queries',
  'Create Social Media Content',
  'Build Real-time Chat Feature',
  'Design Landing Page',
  'Implement Payment Integration',
  'Create Video Editing Project',
  'Build Analytics Dashboard',
];

// Company keywords for injection into dummy data
const COMPANY_KEYWORDS = ['Coinbase', 'Scroll', 'Base', 'Chainlink', 'Aave', 'Uniswap', 'MercadoLibre', 'Nubank', 'Rappi', 'Globant'];

const descriptionTemplates = [
  (company: string) => `Looking for an experienced developer to help with this project for ${company}. Must have strong attention to detail and good communication skills.`,
  (company: string) => `Need someone who can deliver high-quality work within the deadline. This is a partnership with ${company} and previous experience in similar projects is a plus.`,
  (company: string) => `Seeking a talented professional to complete this task for ${company}. The ideal candidate should be reliable and proactive.`,
  (company: string) => `This project requires expertise and creativity for ${company}. Looking for someone who can bring fresh ideas to the table.`,
  (company: string) => `We need a skilled individual to handle this work in collaboration with ${company}. Must be comfortable working independently and meeting deadlines.`,
  (company: string) => `Searching for a dedicated professional who can take ownership of this ${company} project from start to finish.`,
  (company: string) => `Looking for someone with proven experience in this field to work on a ${company} integration. Quality and timely delivery are essential.`,
  (company: string) => `Need a creative and technical person who can understand requirements and deliver exceptional results for our ${company} partnership.`,
];

const rewards = ['0.00001', '0.000025', '0.00005', '0.000075', '0.0001', '0.00015', '0.0002', '0.00025', '0.0003', '0.0005'];

const categories: JobCategory[] = ['FRONTEND', 'BACKEND', 'DESIGN', 'MARKETING'];

/**
 * Generates a random deadline timestamp between 1 and 3 days from now
 */
function generateRandomDeadline(): string {
  const daysInFuture = Math.floor(Math.random() * 3) + 1; // Random number between 1 and 3
  const deadline = Math.floor(Date.now() / 1000) + 60 * 60 * 24 * daysInFuture;
  return deadline.toString();
}

/**
 * Generates random job form data for testing purposes
 * Automatically injects company names into descriptions for demo purposes
 */
export function generateRandomJobData(): JobFormData {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const randomIndex = (arr: any[]) => Math.floor(Math.random() * arr.length);

  // Pick a random company for this dummy job
  const randomCompany = COMPANY_KEYWORDS[randomIndex(COMPANY_KEYWORDS)];
  
  // Pick a random description template and inject the company
  const descriptionTemplate = descriptionTemplates[randomIndex(descriptionTemplates)];
  const description = descriptionTemplate(randomCompany);

  return {
    title: jobTitles[randomIndex(jobTitles)],
    description,
    reward: rewards[randomIndex(rewards)],
    category: categories[randomIndex(categories)],
    deadline: generateRandomDeadline(),
  };
}

