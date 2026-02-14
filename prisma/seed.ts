import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const templates = [
  {
    name: "Minimal Developer",
    description:
      "A clean, minimal portfolio template designed for software developers. Features a focused layout with hero section, project showcase, and contact form.",
    category: "DEVELOPER",
    thumbnail: "/templates/minimal-developer.png",
    theme: "MINIMAL",
    isPremium: false,
    blocks: [
      {
        type: "HERO",
        title: "Hero",
        order: 0,
        visible: true,
        content: {
          heading: "Hi, I'm [Your Name]",
          subheading: "Full-Stack Developer",
          bio: "I build modern web applications with clean code and thoughtful design.",
          ctaText: "View My Work",
          ctaLink: "#projects",
        },
      },
      {
        type: "ABOUT",
        title: "About",
        order: 1,
        visible: true,
        content: {
          text: "Write a brief introduction about yourself, your background, and what drives you as a developer.",
          skills: ["TypeScript", "React", "Node.js", "PostgreSQL", "AWS"],
        },
      },
      {
        type: "PROJECTS",
        title: "Projects",
        order: 2,
        visible: true,
        content: {
          items: [
            {
              title: "Project One",
              description: "A brief description of this project and the problem it solves.",
              techStack: ["Next.js", "Prisma", "Tailwind CSS"],
              liveUrl: "",
              repoUrl: "",
              image: "",
            },
            {
              title: "Project Two",
              description: "A brief description of this project and the problem it solves.",
              techStack: ["React", "Node.js", "MongoDB"],
              liveUrl: "",
              repoUrl: "",
              image: "",
            },
          ],
        },
      },
      {
        type: "CONTACT",
        title: "Contact",
        order: 3,
        visible: true,
        content: {
          heading: "Get In Touch",
          email: "",
          socials: {
            github: "",
            linkedin: "",
            twitter: "",
          },
        },
      },
    ],
  },
  {
    name: "Creative Designer",
    description:
      "A visually rich portfolio template for designers and creatives. Includes a gallery-style project display, testimonials section, and bold typography.",
    category: "DESIGNER",
    thumbnail: "/templates/creative-designer.png",
    theme: "BOLD",
    isPremium: false,
    blocks: [
      {
        type: "HERO",
        title: "Hero",
        order: 0,
        visible: true,
        content: {
          heading: "Creative Designer & Visual Storyteller",
          subheading: "",
          bio: "Crafting memorable brand experiences through design.",
          ctaText: "See My Portfolio",
          ctaLink: "#work",
        },
      },
      {
        type: "ABOUT",
        title: "About",
        order: 1,
        visible: true,
        content: {
          text: "Share your design philosophy, your creative process, and the types of projects you love working on.",
          skills: ["UI/UX Design", "Figma", "Illustration", "Branding", "Motion Design"],
        },
      },
      {
        type: "PROJECTS",
        title: "Work",
        order: 2,
        visible: true,
        content: {
          layout: "gallery",
          items: [
            {
              title: "Brand Identity - Client A",
              description: "Complete brand identity design including logo, color palette, and guidelines.",
              techStack: ["Figma", "Illustrator"],
              liveUrl: "",
              repoUrl: "",
              image: "",
            },
            {
              title: "Mobile App UI - Client B",
              description: "End-to-end mobile app design from wireframes to high-fidelity prototypes.",
              techStack: ["Figma", "Protopie"],
              liveUrl: "",
              repoUrl: "",
              image: "",
            },
            {
              title: "Web Redesign - Client C",
              description: "Complete website redesign focused on conversion and user experience.",
              techStack: ["Figma", "Webflow"],
              liveUrl: "",
              repoUrl: "",
              image: "",
            },
          ],
        },
      },
      {
        type: "TESTIMONIALS",
        title: "Testimonials",
        order: 3,
        visible: true,
        content: {
          items: [
            {
              quote: "An exceptional designer who truly understands how to bring ideas to life.",
              author: "Client Name",
              role: "CEO, Company",
            },
          ],
        },
      },
      {
        type: "CONTACT",
        title: "Contact",
        order: 4,
        visible: true,
        content: {
          heading: "Let's Create Together",
          email: "",
          socials: {
            dribbble: "",
            behance: "",
            instagram: "",
          },
        },
      },
    ],
  },
  {
    name: "Professional Resume",
    description:
      "A structured, professional template ideal for job seekers. Includes experience timeline, education, skills breakdown, and downloadable resume support.",
    category: "PROFESSIONAL",
    thumbnail: "/templates/professional-resume.png",
    theme: "ELEGANT",
    isPremium: false,
    blocks: [
      {
        type: "HERO",
        title: "Hero",
        order: 0,
        visible: true,
        content: {
          heading: "[Your Name]",
          subheading: "Software Engineer | Product Manager | Data Scientist",
          bio: "Experienced professional with a passion for building impactful products.",
          ctaText: "Download Resume",
          ctaLink: "#resume",
        },
      },
      {
        type: "EXPERIENCE",
        title: "Experience",
        order: 1,
        visible: true,
        content: {
          items: [
            {
              company: "Company Name",
              role: "Senior Software Engineer",
              startDate: "2022-01",
              endDate: "Present",
              description: "Describe your key responsibilities and achievements in this role.",
              highlights: [
                "Led a team of 5 engineers",
                "Improved system performance by 40%",
              ],
            },
            {
              company: "Previous Company",
              role: "Software Engineer",
              startDate: "2019-06",
              endDate: "2021-12",
              description: "Describe your key responsibilities and achievements in this role.",
              highlights: [
                "Built core features used by 10K+ users",
                "Mentored 3 junior engineers",
              ],
            },
          ],
        },
      },
      {
        type: "EDUCATION",
        title: "Education",
        order: 2,
        visible: true,
        content: {
          items: [
            {
              institution: "University Name",
              degree: "B.S. Computer Science",
              year: "2019",
              details: "Relevant coursework, honors, or activities.",
            },
          ],
        },
      },
      {
        type: "SKILLS",
        title: "Skills",
        order: 3,
        visible: true,
        content: {
          categories: [
            {
              name: "Languages",
              items: ["TypeScript", "Python", "Go"],
            },
            {
              name: "Frameworks",
              items: ["React", "Next.js", "FastAPI"],
            },
            {
              name: "Tools",
              items: ["Docker", "AWS", "Git"],
            },
          ],
        },
      },
      {
        type: "CONTACT",
        title: "Contact",
        order: 4,
        visible: true,
        content: {
          heading: "Get In Touch",
          email: "",
          socials: {
            github: "",
            linkedin: "",
          },
          resumeUrl: "",
        },
      },
    ],
  },
];

async function main() {
  console.log("Seeding starter templates...");

  for (const template of templates) {
    const existing = await prisma.template.findFirst({
      where: { name: template.name },
    });

    if (existing) {
      console.log(`  Skipping "${template.name}" (already exists)`);
      continue;
    }

    await prisma.template.create({
      data: {
        name: template.name,
        description: template.description,
        category: template.category,
        thumbnail: template.thumbnail,
        theme: template.theme,
        isPremium: template.isPremium,
        blocks: template.blocks,
      },
    });

    console.log(`  Created "${template.name}"`);
  }

  console.log("Seeding complete.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
