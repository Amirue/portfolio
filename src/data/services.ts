// Services — copy from the design (design/png-desktop/KN2nw.png, c0bkc.png, yjXsu.png).
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
    tagline: 'Custom builds that hold up under real traffic.',
    chips: ['WordPress', 'Elementor', 'Breakdance', 'Divi', 'cPanel', 'Cloudflare'],
    workType: 'wordpress',
    offerings: [
      {
        title: 'Custom themes & blocks',
        desc: 'Bespoke WordPress themes and Gutenberg blocks built to your brand — not a page builder.',
      },
      {
        title: 'ACF Pro & custom post types',
        desc: 'Editor-friendly content models that non-technical teams actually enjoy using.',
      },
      {
        title: 'Headless (GraphQL / REST)',
        desc: 'Decoupled WordPress feeding a fast Next.js or React front end.',
      },
      {
        title: 'Core Web Vitals & speed',
        desc: 'Audits and fixes that push LCP, CLS and INP into the green.',
      },
      {
        title: 'Migrations & maintenance',
        desc: 'Safe moves off legacy hosts and page builders, plus ongoing care.',
      },
      {
        title: 'WooCommerce & integrations',
        desc: 'Stores and third-party integrations wired cleanly into your stack.',
      },
    ],
  },
  {
    slug: 'ui-ux-design',
    n: '02',
    title: 'UI/UX Design',
    tagline: 'Interfaces that are easy to use, look clean, and work on every screen.',
    chips: ['Figma', 'Affinity', 'Photoshop'],
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
        title: 'Micro-interactions & motion',
        desc: 'Purposeful motion that makes interfaces feel alive, not busy.',
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
        title: 'Usability testing',
        desc: 'Small, cheap tests that catch big problems early.',
      },
    ],
  },
  {
    slug: 'ai-integration',
    n: '03',
    title: 'AI Integration',
    tagline: 'Practical AI that solves a real problem — not a chatbot bolted on for show.',
    chips: ['OpenAI', 'Replit', 'OpenCode', 'Antigravity', 'Sendgrid'],
    workType: 'ai',
    offerings: [
      {
        title: 'LLM agents & prompting',
        desc: 'Task-specific agents with tools, guardrails and a clearly defined job.',
      },
      {
        title: 'RAG & vector search',
        desc: 'Your own content, answerable, with citations instead of confident guesses.',
      },
      {
        title: 'Workflow automation',
        desc: 'Repetitive internal steps handed to reliable, monitored automation.',
      },
      {
        title: 'Realtime (WebSockets)',
        desc: 'Live, streaming experiences — voice, chat and collaboration.',
      },
      {
        title: 'API integrations',
        desc: 'OpenAI, Gemini and friends wired safely into production.',
      },
      {
        title: 'Evaluation & guardrails',
        desc: 'Measuring quality and keeping output on-brand and safe.',
      },
    ],
  },
];

export const serviceBySlug = (slug: string) => services.find((s) => s.slug === slug);
