// Services — copy aligned to the resume.
//
// Static for now, declared as data so a `service` CPT swap later is a one-line change.
// `workType` matches the WordPress work_type taxonomy, so "Selected work" is pulled
// live from real posts instead of hardcoded slugs (several designed slugs don't exist
// in WordPress — see design/HANDOFF.md §6).

export interface Offering {
  title: string;
  desc: string;
}

export interface Service {
  slug: string;
  n: string;
  title: string;
  tagline: string;
  chips: string[];
  workType: string;
  offerings: Offering[];
}

export const services: Service[] = [
  {
    slug: 'wordpress-development',
    n: '01',
    title: 'WordPress & Web Development',
    tagline: 'Custom builds and client platforms that hold up under real traffic.',
    chips: ['WordPress', 'Breakdance', 'Elementor Pro', 'Divi', 'PHP', 'MySQL'],
    workType: 'wordpress',
    offerings: [
      {
        title: 'Custom themes & page builds',
        desc: 'Bespoke WordPress themes and page-builder builds (Breakdance, Elementor Pro, Divi) matched to your brand — not a one-size template.',
      },
      {
        title: 'Client sites & ongoing care',
        desc: 'Building, updating and maintaining business and enterprise WordPress sites, with regular client reporting.',
      },
      {
        title: 'WooCommerce & integrations',
        desc: 'Stores and third-party integrations — payments with Stripe, email with SendGrid — wired cleanly into your stack.',
      },
      {
        title: 'Core Web Vitals & speed',
        desc: 'Audits and fixes that push LCP, CLS and INP into the green.',
      },
      {
        title: 'Hosting, DNS & security',
        desc: 'cPanel, WHM and Cloudflare setup — DNS, SSL and email delivery handled end to end.',
      },
      {
        title: 'Migrations & maintenance',
        desc: 'Safe moves off legacy hosts and page builders, plus long-term upkeep.',
      },
    ],
  },
  {
    slug: 'ui-ux-design',
    n: '02',
    title: 'UI/UX Design',
    tagline: 'Interfaces that are easy to use, look clean, and work on every screen.',
    chips: ['Figma', 'Affinity', 'Photoshop', 'Illustrator'],
    workType: 'uiux',
    offerings: [
      {
        title: 'Design systems in Figma',
        desc: 'Tokens, components and docs so the whole team ships consistent UI.',
      },
      {
        title: 'Wireframes & prototypes',
        desc: 'Clickable flows to test the idea before a line of code is written.',
      },
      {
        title: 'Responsive layouts',
        desc: 'Mobile-first layouts that hold together on every screen size.',
      },
      {
        title: 'Accessibility (WCAG AA)',
        desc: 'Contrast, focus states, semantics and full keyboard support.',
      },
      {
        title: 'Brand & print assets',
        desc: 'Logo marks, brand collateral and image work in Affinity, Photoshop and Illustrator.',
      },
      {
        title: 'Video & social edits',
        desc: 'Short-form edits for launches and campaigns in Premiere Pro and CapCut.',
      },
    ],
  },
  {
    slug: 'ai-integration',
    n: '03',
    title: 'AI Integration',
    tagline: 'Practical AI and modern tooling that ships real products — not demos.',
    chips: ['Replit', 'OpenCode', 'Node.js', 'PostgreSQL'],
    workType: 'ai',
    offerings: [
      {
        title: 'AI-assisted development',
        desc: 'Using Replit and OpenCode to architect, build and ship custom web apps faster.',
      },
      {
        title: 'Full-stack apps',
        desc: 'Node.js and PostgreSQL backends behind real, production-ready products.',
      },
      {
        title: 'LLM agents & prompting',
        desc: 'Task-specific agents with tools, guardrails and a clearly defined job.',
      },
      {
        title: 'Workflow automation',
        desc: 'Repetitive internal steps handed to reliable, monitored automation.',
      },
      {
        title: 'API integrations',
        desc: 'AI and third-party APIs wired safely into production.',
      },
      {
        title: 'Event & print automation',
        desc: 'QR check-in straight to on-site thermal printers, with payments and email notifications.',
      },
    ],
  },
];

export const serviceBySlug = (slug: string) => services.find((s) => s.slug === slug);
