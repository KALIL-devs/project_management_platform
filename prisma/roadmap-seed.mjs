import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const SEO_TEMPLATE = [
  {
    monthNumber: 1,
    title: "Phase 1: Foundation (Day 1–30)",
    modules: [
      {
        title: "Module 1: Market & Keyword Research",
        description: "Day 1–5: Research target audience, competitors and keywords",
        order: 1,
        priority: "URGENT",
        tasks: [
          { title: "Define target audience (age, interests, problems)", dueDay: 1, priority: "URGENT" },
          { title: "Identify top 5–10 competitors", dueDay: 2, priority: "URGENT" },
          { title: "Set up Ahrefs / SEMrush / Google Keyword Planner", dueDay: 2, priority: "URGENT" },
          { title: "Find 50–100 keywords (low + medium competition)", dueDay: 4, priority: "URGENT" },
          { title: "Focus on problem-based keywords", dueDay: 4, priority: "HIGH" },
          { title: "Focus on long-tail keywords", dueDay: 5, priority: "HIGH" },
        ],
      },
      {
        title: "Module 2: Website Setup & Technical SEO",
        description: "Day 5–10: Set up hosting, analytics and fix technical basics",
        order: 2,
        priority: "URGENT",
        tasks: [
          { title: "Set up fast hosting + mobile responsive design", dueDay: 5, priority: "URGENT" },
          { title: "Install Google Analytics", dueDay: 6, priority: "URGENT" },
          { title: "Install Google Search Console", dueDay: 6, priority: "URGENT" },
          { title: "Create and submit Sitemap.xml", dueDay: 8, priority: "HIGH" },
          { title: "Configure Robots.txt", dueDay: 8, priority: "HIGH" },
          { title: "Fix page speed using Google PageSpeed Insights", dueDay: 10, priority: "HIGH" },
        ],
      },
      {
        title: "Module 3: On-Page SEO",
        description: "Day 10–20: Optimize all pages for search engines",
        order: 3,
        priority: "HIGH",
        tasks: [
          { title: "Optimize title tags with keywords", dueDay: 11, priority: "HIGH" },
          { title: "Write meta descriptions for all pages", dueDay: 12, priority: "HIGH" },
          { title: "Fix H1 and H2 structure across all pages", dueDay: 13, priority: "HIGH" },
          { title: "Set up internal linking strategy", dueDay: 14, priority: "HIGH" },
          { title: "Add image ALT tags to all images", dueDay: 15, priority: "MEDIUM" },
          { title: "Create Home page", dueDay: 16, priority: "URGENT" },
          { title: "Create Product/Service page", dueDay: 17, priority: "URGENT" },
          { title: "Create About page", dueDay: 18, priority: "HIGH" },
          { title: "Create Blog page", dueDay: 19, priority: "HIGH" },
        ],
      },
      {
        title: "Module 4: Content Strategy",
        description: "Day 15–30: Create blog posts and pillar articles",
        order: 4,
        priority: "HIGH",
        tasks: [
          { title: "Write 10–15 blog posts", dueDay: 25, priority: "HIGH" },
          { title: "Write 2–3 pillar articles (1500–3000 words)", dueDay: 28, priority: "HIGH" },
          { title: "Create How-to content pieces", dueDay: 20, priority: "MEDIUM" },
          { title: "Create Comparison content pieces", dueDay: 22, priority: "MEDIUM" },
          { title: "Create Problem-solving content pieces", dueDay: 24, priority: "MEDIUM" },
          { title: "Maintain 3–4 blogs/week posting frequency", dueDay: 30, priority: "HIGH" },
        ],
      },
      {
        title: "Module 5: Social Media Setup",
        description: "Day 20–30: Set up and start posting on all platforms",
        order: 5,
        priority: "HIGH",
        tasks: [
          { title: "Set up and optimize X (Twitter) profile", dueDay: 20, priority: "HIGH" },
          { title: "Set up and optimize Instagram profile", dueDay: 21, priority: "HIGH" },
          { title: "Set up and optimize LinkedIn profile", dueDay: 22, priority: "HIGH" },
          { title: "Start daily posting on X (threads + short posts)", dueDay: 25, priority: "MEDIUM" },
          { title: "Start daily posting on Instagram (visuals)", dueDay: 26, priority: "MEDIUM" },
          { title: "Start daily posting on LinkedIn", dueDay: 27, priority: "MEDIUM" },
        ],
      },
    ],
  },
  {
    monthNumber: 2,
    title: "Phase 2: Growth (Day 31–60)",
    modules: [
      {
        title: "Module 6: Off-Page SEO & Backlinks",
        description: "Day 31–45: Build authority through backlinks",
        order: 1,
        priority: "HIGH",
        tasks: [
          { title: "Submit to 10+ web directories", dueDay: 33, priority: "HIGH" },
          { title: "Write and publish 3–5 guest posts", dueDay: 38, priority: "HIGH" },
          { title: "Create 20+ profile creations", dueDay: 35, priority: "MEDIUM" },
          { title: "Sign up and respond on HARO", dueDay: 32, priority: "MEDIUM" },
          { title: "Engage on Reddit and Quora (5+ threads)", dueDay: 36, priority: "MEDIUM" },
          { title: "Submit to classifieds sites", dueDay: 37, priority: "LOW" },
          { title: "Do microblogging submissions", dueDay: 39, priority: "LOW" },
          { title: "Do social bookmarking submissions", dueDay: 40, priority: "LOW" },
          { title: "Submit to article directories", dueDay: 41, priority: "LOW" },
          { title: "Achieve 20–50 total backlinks", dueDay: 45, priority: "HIGH" },
        ],
      },
      {
        title: "Module 7: Content Distribution",
        description: "Day 31–60: Repurpose and distribute content across platforms",
        order: 2,
        priority: "MEDIUM",
        tasks: [
          { title: "Repurpose blogs into X threads", dueDay: 35, priority: "MEDIUM" },
          { title: "Repurpose blogs into Instagram carousels", dueDay: 37, priority: "MEDIUM" },
          { title: "Repurpose blogs into LinkedIn posts", dueDay: 39, priority: "MEDIUM" },
          { title: "Maintain 2–3 posts per platform daily", dueDay: 60, priority: "HIGH" },
        ],
      },
      {
        title: "Module 8: Paid Ads Testing",
        description: "Day 40–60: Test small budget paid campaigns",
        order: 3,
        priority: "MEDIUM",
        tasks: [
          { title: "Set up Google Ads campaign", dueDay: 42, priority: "MEDIUM" },
          { title: "Set up Meta Ads Manager campaign", dueDay: 43, priority: "MEDIUM" },
          { title: "Test 3–5 ad creatives", dueDay: 50, priority: "MEDIUM" },
          { title: "Test 2 target audiences", dueDay: 55, priority: "MEDIUM" },
        ],
      },
      {
        title: "Module 9: Email Marketing Setup",
        description: "Day 45–60: Build email list and automation",
        order: 4,
        priority: "MEDIUM",
        tasks: [
          { title: "Set up Mailchimp or ConvertKit", dueDay: 45, priority: "MEDIUM" },
          { title: "Create lead magnet (ebook or checklist)", dueDay: 50, priority: "HIGH" },
          { title: "Write welcome email sequence (3–5 emails)", dueDay: 55, priority: "HIGH" },
          { title: "Launch email capture on website", dueDay: 58, priority: "HIGH" },
        ],
      },
    ],
  },
  {
    monthNumber: 3,
    title: "Phase 3: Scale (Day 61–90)",
    modules: [
      {
        title: "Module 10: SEO Optimization & Ranking Push",
        description: "Day 61–75: Push rankings from top 10 to top 3",
        order: 1,
        priority: "HIGH",
        tasks: [
          { title: "Update and refresh all old blog posts", dueDay: 65, priority: "HIGH" },
          { title: "Add internal links to existing content", dueDay: 67, priority: "HIGH" },
          { title: "Improve CTR with better title tags", dueDay: 70, priority: "HIGH" },
          { title: "Push top 10 ranking pages into top 3", dueDay: 75, priority: "URGENT" },
        ],
      },
      {
        title: "Module 11: Analytics & Optimization",
        description: "Day 61–90: Track, measure and double down on what works",
        order: 2,
        priority: "HIGH",
        tasks: [
          { title: "Track traffic with Google Analytics", dueDay: 63, priority: "HIGH" },
          { title: "Analyse bounce rate and fix weak pages", dueDay: 68, priority: "HIGH" },
          { title: "Track conversions and set up goals", dueDay: 70, priority: "HIGH" },
          { title: "Double down on top-performing content", dueDay: 80, priority: "HIGH" },
          { title: "Scale best traffic sources", dueDay: 85, priority: "HIGH" },
        ],
      },
      {
        title: "Module 12: Advanced Growth Strategies",
        description: "Day 70–85: Influencer marketing, affiliates and community",
        order: 3,
        priority: "MEDIUM",
        tasks: [
          { title: "Launch influencer marketing campaign", dueDay: 72, priority: "MEDIUM" },
          { title: "Set up affiliate program", dueDay: 78, priority: "MEDIUM" },
          { title: "Build community on Discord or Telegram", dueDay: 82, priority: "LOW" },
        ],
      },
      {
        title: "Module 13: Branding & Authority",
        description: "Day 75–90: Establish brand authority through PR and case studies",
        order: 4,
        priority: "MEDIUM",
        tasks: [
          { title: "Publish 2–3 case studies", dueDay: 78, priority: "MEDIUM" },
          { title: "Publish client success stories", dueDay: 80, priority: "MEDIUM" },
          { title: "Write and distribute PR articles", dueDay: 85, priority: "MEDIUM" },
          { title: "Publish press releases", dueDay: 88, priority: "LOW" },
        ],
      },
    ],
  },
];

export async function createRoadmapForClient(clientId) {
  const existing = await prisma.roadmap.findUnique({
    where: { clientId },
  });

  if (existing) {
    console.log("Roadmap already exists for this client");
    return existing;
  }

  const roadmap = await prisma.roadmap.create({
    data: {
      title: "90-Day SEO Roadmap",
      clientId,
      months: {
        create: SEO_TEMPLATE.map((month) => ({
          monthNumber: month.monthNumber,
          title: month.title,
          modules: {
            create: month.modules.map((mod) => ({
              title: mod.title,
              description: mod.description,
              order: mod.order,
              tasks: {
                create: mod.tasks.map((task) => ({
                  title: task.title,
                  dueDay: task.dueDay,
                  priority: task.priority,
                })),
              },
            })),
          },
        })),
      },
    },
  });

  console.log(`✅ Roadmap created for client: ${clientId}`);
  return roadmap;
}

await prisma.$disconnect();