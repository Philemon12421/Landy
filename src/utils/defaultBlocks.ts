import { Block, StyleConfig, ProjectState, BlockType } from '../types';

export const DEFAULT_STYLE_CONFIG: StyleConfig = {
  background: '#ffffff',
  theme: 'minimal_modern',
  fontFamily: 'Inter, system-ui',
  uiStyle: 'canva_like_clean_editor',
  radius: '12px',
  shadows: 'soft_elevation',
  spacingSystem: '8px_grid',
  animationSpeed: '150ms'
};

export const createDefaultNavbar = (id = 'navbar-1'): Block => ({
  id,
  type: 'navbar',
  name: 'Modern Clean Navigation',
  styles: {
    paddingTop: 16,
    paddingBottom: 16,
    bgColor: '#ffffff',
    textColor: '#1e293b',
    brandColor: '#4f46e5',
    borderRadius: 'none',
    shadow: 'soft',
    align: 'left'
  },
  content: {
    brandName: 'Landy',
    logoUrl: '',
    links: [
      { label: 'Features', url: '#features' },
      { label: 'Pricing', url: '#pricing' },
      { label: 'Reviews', url: '#reviews' },
      { label: 'Contact', url: '#contact' }
    ],
    primaryBtnText: 'Get Started',
    primaryBtnUrl: '#get-started'
  }
});

export const createDefaultHero = (id = 'hero-1'): Block => ({
  id,
  type: 'hero_section',
  name: 'Elegant Headline Hero',
  styles: {
    paddingTop: 80,
    paddingBottom: 80,
    bgColor: '#f8fafc',
    textColor: '#0f172a',
    brandColor: '#4f46e5',
    borderRadius: 'xl',
    shadow: 'none',
    align: 'center'
  },
  content: {
    title: 'Build landing pages that convert like magic.',
    subtitle: 'No Code Editor',
    description: 'Empower your marketing team to craft stunning, responsive landing pages in minutes. Drag, edit inline, adjust visual styling, and deploy with complete ease.',
    primaryBtnText: 'Start Building Free',
    primaryBtnUrl: '#get-started',
    secondaryBtnText: 'Watch Video Demo',
    secondaryBtnUrl: '#video',
    imageUrl: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=1200&q=80',
    imageAlt: 'Landy Platform Dashboard Preview'
  }
});

export const createDefaultFeatures = (id = 'features-1'): Block => ({
  id,
  type: 'features_grid',
  name: 'Multi-Column Feature Grid',
  styles: {
    paddingTop: 64,
    paddingBottom: 64,
    bgColor: '#ffffff',
    textColor: '#1e293b',
    brandColor: '#4f46e5',
    borderRadius: 'xl',
    shadow: 'none',
    align: 'center'
  },
  content: {
    title: 'Engineered for simplicity and power',
    subtitle: 'Interactive Features',
    description: 'We analyzed thousands of high-converting landing pages to engineer pre-built blocks that look gorgeous right out of the box.',
    features: [
      {
        icon: 'Sparkles',
        title: 'Canva-level Simplicity',
        description: 'Double click to edit text inline, drag blocks to order, and adjust margins instantly on-screen.'
      },
      {
        icon: 'Layers',
        title: 'Pixel-Perfect Components',
        description: 'Choose from a rich library of predesigned sections, complete with custom responsive layouts.'
      },
      {
        icon: 'Smartphone',
        title: 'Fully Responsive Canvas',
        description: 'Simulate mobile, tablet, and desktop views beautifully with our built-in device frames.'
      },
      {
        icon: 'Code2',
        title: 'Clean Export Code',
        description: 'Export clean HTML/Tailwind templates or custom React TypeScript files instantly with one tap.'
      },
      {
        icon: 'History',
        title: 'Infinite Undo & Redo',
        description: 'We track every element displacement, visual change, and alignment tweak so you never lose work.'
      },
      {
        icon: 'CloudUpload',
        title: 'Community Gallery',
        description: 'Publish your designs to the public timeline, and clone community designs into your canvas.'
      }
    ]
  }
});

export const createDefaultTestimonials = (id = 'testimonials-1'): Block => ({
  id,
  type: 'testimonials',
  name: 'Social Proof Carousel',
  styles: {
    paddingTop: 64,
    paddingBottom: 64,
    bgColor: '#f8fafc',
    textColor: '#0f172a',
    brandColor: '#4f46e5',
    borderRadius: 'xl',
    shadow: 'none',
    align: 'center'
  },
  content: {
    title: 'Adored by progressive marketers worldwide',
    subtitle: 'Testimonials',
    description: 'See how teams are building fast marketing funnels and capturing higher-quality leads with Landy.',
    testimonials: [
      {
        quote: 'Landy has completely replaced our bloated visual site builders. Creating high-fidelity responsive marketing pages takes literally 10 minutes now. The HTML export is impeccably clean!',
        author: 'Sarah Jenkins',
        role: 'VP of Marketing, SaaSify',
        avatarUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=120&q=80'
      },
      {
        quote: 'As a designer, I am very picky about typography and layouts. Landy is the first tool that doesn\'t distort styling. What you see is exactly what you get. The neo-brutalist theme presets are stunning!',
        author: 'Marcus Chen',
        role: 'Lead UI/UX Designer, CraftStudio',
        avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=120&q=80'
      }
    ]
  }
});

export const createDefaultPricing = (id = 'pricing-1'): Block => ({
  id,
  type: 'pricing_cards',
  name: 'High-Conversion Pricing',
  styles: {
    paddingTop: 64,
    paddingBottom: 64,
    bgColor: '#ffffff',
    textColor: '#1e293b',
    brandColor: '#4f46e5',
    borderRadius: 'xl',
    shadow: 'none',
    align: 'center'
  },
  content: {
    title: 'Transparent pricing, scale as you grow',
    subtitle: 'Pricing Plans',
    description: 'Select the optimal package for your design operations. Save up to 20% on annual billing.',
    pricingPlans: [
      {
        name: 'Starter',
        price: '$0',
        period: 'forever',
        features: [
          'Up to 3 landing projects',
          'Full visual Canva style editor',
          'Standard inline text editing',
          'Local project storage'
        ],
        btnText: 'Claim Free Forever',
        popular: false
      },
      {
        name: 'Pro Web Builder',
        price: '$19',
        period: 'per month',
        features: [
          'Unlimited projects',
          'Full HTML/CSS/JS code export',
          'Clean React component output',
          'Publish to Public Gallery timeline',
          'Interactive video & custom forms',
          'Priority updates & design tokens'
        ],
        btnText: 'Start 14-Day Free Trial',
        popular: true
      },
      {
        name: 'Enterprise',
        price: 'Custom',
        period: 'billed annually',
        features: [
          'Multi-user shared workspaces',
          'Custom brand alignment domains',
          'Dedicated CRM Webhook triggers',
          'SLA 99.9% uptime guarantees',
          '24/7 dedicated design advocate'
        ],
        btnText: 'Connect and Book Demo',
        popular: false
      }
    ]
  }
});

export const createDefaultCTA = (id = 'cta-1'): Block => ({
  id,
  type: 'cta_block',
  name: 'Minimal Call-to-Action',
  styles: {
    paddingTop: 48,
    paddingBottom: 48,
    bgColor: '#4f46e5',
    textColor: '#ffffff',
    brandColor: '#ffffff',
    borderRadius: 'xl',
    shadow: 'heavy',
    align: 'center'
  },
  content: {
    title: 'Ready to double your sign-up conversions?',
    subtitle: 'Accelerate Growth',
    description: 'Join over 12,000+ digital creators and companies building beautiful web landing pages in moments.',
    primaryBtnText: 'Launch Land Builder Now',
    primaryBtnUrl: '#get-started',
    secondaryBtnText: 'Browse Templates',
    secondaryBtnUrl: '#gallery'
  }
});

export const createDefaultContact = (id = 'contact-1'): Block => ({
  id,
  type: 'contact_form',
  name: 'Interactive Contact/Lead Capture Form',
  styles: {
    paddingTop: 56,
    paddingBottom: 56,
    bgColor: '#f8fafc',
    textColor: '#1e293b',
    brandColor: '#4f46e5',
    borderRadius: 'xl',
    shadow: 'none',
    align: 'center'
  },
  content: {
    title: 'Capture incoming leads instantly',
    subtitle: 'Contact Us',
    description: 'Our gorgeous, responsive lead form works automatically. Entries are processed client-side with full visual validation state feedback.',
    formFields: [
      { label: 'Full Name', placeholder: 'Jane Doe', type: 'text' },
      { label: 'Work Email Address', placeholder: 'jane@company.com', type: 'email' },
      { label: 'Tell us about your project', placeholder: 'Hi there, we need...', type: 'textarea' }
    ],
    formBtnText: 'Submit Inquiry',
    formEmailTarget: 'inquiries@landy.sh'
  }
});

export const createDefaultImageBlock = (id = 'image-1'): Block => ({
  id,
  type: 'image_block',
  name: 'Visual Frame block',
  styles: {
    paddingTop: 40,
    paddingBottom: 40,
    bgColor: '#ffffff',
    textColor: '#1e293b',
    brandColor: '#4f46e5',
    borderRadius: 'xl',
    shadow: 'none',
    align: 'center'
  },
  content: {
    imageUrl: 'https://images.unsplash.com/photo-1531403009284-440f080d1e12?auto=format&fit=crop&w=1200&q=80',
    imageAlt: 'Co-workers analyzing responsive landing mockups collaboratively',
    description: 'Fully responsive custom visual frame showing responsive layouts on target breakpoints.'
  }
});

export const createDefaultVideoEmbed = (id = 'video-1'): Block => ({
  id,
  type: 'video_embed',
  name: 'Custom Video Embed Player',
  styles: {
    paddingTop: 40,
    paddingBottom: 40,
    bgColor: '#f8fafc',
    textColor: '#1e293b',
    brandColor: '#4f46e5',
    borderRadius: 'xl',
    shadow: 'none',
    align: 'center'
  },
  content: {
    videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ', // Default video embed placeholder link
    title: 'How Landy works in under 60 seconds',
    description: 'Watch this quick visual breakdown of inline styles, grid layouts, and code exports.'
  }
});

export const createDefaultFooter = (id = 'footer-1'): Block => ({
  id,
  type: 'footer',
  name: 'Polished Bottom Footer',
  styles: {
    paddingTop: 32,
    paddingBottom: 32,
    bgColor: '#0f172a',
    textColor: '#94a3b8',
    brandColor: '#4f46e5',
    borderRadius: 'none',
    shadow: 'none',
    align: 'center'
  },
  content: {
    brandName: 'Landy',
    copyright: '© 2026 Landy Technologies Inc. All rights reserved. Built with Canva-level simplicity.',
    links: [
      { label: 'Privacy Policy', url: '#' },
      { label: 'Terms of Service', url: '#' },
      { label: 'Security Protocols', url: '#' },
      { label: 'Lead API Status', url: '#' }
    ]
  }
});

export const createDefaultDivider = (id = 'divider-1'): Block => ({
  id,
  type: 'divider',
  name: 'Horizontal Section Divider',
  styles: {
    paddingTop: 16,
    paddingBottom: 16,
    bgColor: '#ffffff',
    textColor: '#cbd5e1',
    brandColor: '#4f46e5',
    borderRadius: 'none',
    shadow: 'none',
    align: 'center'
  },
  content: {
    dividerStyle: 'solid'
  }
});

export const createDefaultSpacer = (id = 'spacer-1'): Block => ({
  id,
  type: 'spacer',
  name: 'Empty spacing padding section',
  styles: {
    paddingTop: 0,
    paddingBottom: 0,
    bgColor: '#ffffff',
    textColor: '#1e293b',
    brandColor: '#4f46e5',
    borderRadius: 'none',
    shadow: 'none',
    align: 'center'
  },
  content: {
    spacerHeight: 48
  }
});

export const createBlockByType = (type: BlockType, id: string): Block => {
  switch (type) {
    case 'navbar': return createDefaultNavbar(id);
    case 'hero_section': return createDefaultHero(id);
    case 'features_grid': return createDefaultFeatures(id);
    case 'testimonials': return createDefaultTestimonials(id);
    case 'pricing_cards': return createDefaultPricing(id);
    case 'cta_block': return createDefaultCTA(id);
    case 'contact_form': return createDefaultContact(id);
    case 'image_block': return createDefaultImageBlock(id);
    case 'video_embed': return createDefaultVideoEmbed(id);
    case 'footer': return createDefaultFooter(id);
    case 'divider': return createDefaultDivider(id);
    case 'spacer': return createDefaultSpacer(id);
  }
};

export const INITIAL_PROJECT: ProjectState = {
  name: 'Untitled Landing Page',
  style: DEFAULT_STYLE_CONFIG,
  blocks: [
    createDefaultNavbar('navbar-init'),
    createDefaultHero('hero-init'),
    createDefaultDivider('divider-init'),
    createDefaultFeatures('features-init'),
    createDefaultContact('contact-init'),
    createDefaultFooter('footer-init')
  ]
};
