import { Block, BlockType, ProjectState } from '../types';

export const createBlockByType = (type: BlockType, id: string): Block => {
  const base = {
    id,
    type,
    styles: {
      paddingTop: 64,
      paddingBottom: 64,
      paddingLeft: 0,
      paddingRight: 0,
      bgColor: '#ffffff',
      textColor: '#0f172a',
      brandColor: '#4f46e5',
      borderRadius: 'xl' as const,
      shadow: 'none' as const,
      align: 'left' as const,
      borderWidth: 0,
      borderColor: '#e2e8f0',
      borderStyle: 'none' as const,
      useGradient: false,
      gradientFrom: '#4f46e5',
      gradientTo: '#7c3aed',
      gradientDirection: 'to-r' as const,
      maxWidth: '7xl' as const,
    },
    content: {}
  };

  switch (type) {
    case 'navbar':
      return {
        ...base,
        name: 'Navigation Bar',
        styles: { ...base.styles, paddingTop: 16, paddingBottom: 16, bgColor: '#ffffff', shadow: 'soft' },
        content: {
          brandName: 'YourBrand',
          links: [
            { label: 'Features', url: '#features' },
            { label: 'Pricing', url: '#pricing' },
            { label: 'About', url: '#about' }
          ],
          primaryBtnText: 'Get Started',
          primaryBtnUrl: '#',
          showNavCta: true,
          navbarStyle: 'default'
        }
      };

    case 'hero_section':
      return {
        ...base,
        name: 'Hero Section',
        styles: { ...base.styles, paddingTop: 96, paddingBottom: 96, bgColor: '#f8fafc', align: 'center' },
        content: {
          subtitle: 'Introducing v2.0',
          title: 'Build Beautiful Landing Pages in Minutes',
          description: 'The no-code page builder that turns your ideas into stunning, high-converting landing pages. No design skills required.',
          primaryBtnText: 'Start Building Free',
          primaryBtnUrl: '#',
          secondaryBtnText: 'See Examples',
          secondaryBtnUrl: '#',
          primaryBtnStyle: 'filled',
          secondaryBtnStyle: 'outline'
        }
      };

    case 'features_grid':
      return {
        ...base,
        name: 'Features Grid',
        styles: { ...base.styles, paddingTop: 80, paddingBottom: 80 },
        content: {
          subtitle: 'Why Choose Us',
          title: 'Everything you need to succeed',
          description: 'Packed with powerful features to help you build, launch, and grow faster than ever.',
          features: [
            { icon: 'Sparkles', title: 'AI-Powered Design', description: 'Smart suggestions that adapt to your brand and industry automatically.' },
            { icon: 'Zap', title: 'Lightning Fast', description: 'Pages that load in under a second, keeping visitors engaged and converting.' },
            { icon: 'Shield', title: 'Enterprise Security', description: 'Bank-grade encryption and compliance built into every project.' },
            { icon: 'BarChart', title: 'Analytics Built-In', description: 'Real-time insights on visitors, clicks, and conversions out of the box.' },
            { icon: 'Globe', title: 'Global CDN', description: 'Deployed to 200+ edge locations worldwide for instant availability.' },
            { icon: 'Code', title: 'Clean Code Export', description: 'Export pixel-perfect HTML or React code ready for production use.' }
          ]
        }
      };

    case 'stats_block':
      return {
        ...base,
        name: 'Stats / Numbers',
        styles: { ...base.styles, paddingTop: 64, paddingBottom: 64, bgColor: '#0f172a', textColor: '#f8fafc' },
        content: {
          subtitle: 'By The Numbers',
          title: 'Trusted by thousands of creators',
          stats: [
            { value: '50K', label: 'Happy Customers', suffix: '+' },
            { value: '99.9', label: 'Uptime SLA', suffix: '%' },
            { value: '2M', label: 'Pages Created', suffix: '+' },
            { value: '4.9', label: 'Average Rating', prefix: '⭐' }
          ],
          statsLayout: 'row'
        }
      };

    case 'text_block':
      return {
        ...base,
        name: 'Text Block',
        styles: { ...base.styles, paddingTop: 40, paddingBottom: 40, align: 'left' },
        content: {
          textContent: 'Add your custom text here. Click to edit this content and make it your own. Use this block for any long-form text, article introductions, policy content, or rich editorial copy.',
          textTag: 'p',
          textFontSize: 16,
          textFontWeight: '400',
          textLineHeight: 1.8,
          textLetterSpacing: 0,
          textDecoration: 'none',
          textTransform: 'none',
          textMaxWidth: '3xl'
        }
      };

    case 'logo_bar':
      return {
        ...base,
        name: 'Logo Bar / Trusted By',
        styles: { ...base.styles, paddingTop: 48, paddingBottom: 48, bgColor: '#f8fafc' },
        content: {
          logoBarTitle: 'Trusted by teams at',
          logos: [
            { name: 'Stripe', logoUrl: 'https://upload.wikimedia.org/wikipedia/commons/b/ba/Stripe_Logo%2C_revised_2016.svg' },
            { name: 'Notion', logoUrl: 'https://upload.wikimedia.org/wikipedia/commons/4/45/Notion_app_logo.png' },
            { name: 'Linear', logoUrl: 'https://asset.brandfetch.io/idJz-fGD_q/idg5HGnIcW.png' },
            { name: 'Vercel', logoUrl: 'https://asset.brandfetch.io/idXnFQRBiM/idg1xLlBnK.png' },
            { name: 'Figma', logoUrl: 'https://upload.wikimedia.org/wikipedia/commons/3/33/Figma-logo.svg' }
          ]
        }
      };

    case 'faq_block':
      return {
        ...base,
        name: 'FAQ Section',
        styles: { ...base.styles, paddingTop: 80, paddingBottom: 80 },
        content: {
          subtitle: 'FAQ',
          title: 'Frequently asked questions',
          description: 'Everything you need to know about the product and billing.',
          faqs: [
            { question: 'How does the free trial work?', answer: 'You get full access to all features for 14 days, no credit card required. After the trial, choose a plan that fits your needs.' },
            { question: 'Can I export my projects?', answer: 'Yes! Export to clean HTML/CSS or React TypeScript components that are ready for production deployment.' },
            { question: 'Is there a team collaboration feature?', answer: 'Team plans allow multiple editors on the same project with real-time collaboration and version history.' },
            { question: 'What payment methods do you accept?', answer: 'We accept all major credit cards, PayPal, and bank transfers for enterprise plans.' }
          ]
        }
      };

    case 'team_block':
      return {
        ...base,
        name: 'Team Section',
        styles: { ...base.styles, paddingTop: 80, paddingBottom: 80 },
        content: {
          subtitle: 'Our Team',
          title: 'The people behind the product',
          description: 'A diverse, remote-first team obsessed with building tools creators love.',
          team: [
            { name: 'Alex Morgan', role: 'Founder & CEO', bio: 'Former eng lead at Stripe. Building the future of no-code.', avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80' },
            { name: 'Sarah Chen', role: 'Head of Design', bio: 'Ex-Figma designer. Passionate about beautiful, functional interfaces.', avatarUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=200&q=80' },
            { name: 'Marcus Webb', role: 'CTO', bio: 'Full-stack wizard. Previously led infrastructure at Notion.', avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=200&q=80' }
          ]
        }
      };

    case 'testimonials':
      return {
        ...base,
        name: 'Testimonials',
        styles: { ...base.styles, paddingTop: 80, paddingBottom: 80, bgColor: '#f8fafc' },
        content: {
          subtitle: 'What Customers Say',
          title: 'Loved by thousands of creators',
          testimonials: [
            { quote: 'This tool completely transformed how we build landing pages. We went from 2 weeks to 2 hours per campaign.', author: 'Jessica Lin', role: 'Marketing Director at Acme Corp', avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=120&q=80' },
            { quote: 'The code export is incredible — clean, semantic, and ready to drop into our React app. Worth every penny.', author: 'Raj Patel', role: 'Senior Engineer at TechCo', avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=120&q=80' },
            { quote: 'My conversion rate increased 40% after switching to pages built with this tool. The templates are stunning.', author: 'Emma Rodriguez', role: 'Indie SaaS Founder', avatarUrl: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&w=120&q=80' },
            { quote: 'Finally a builder that gives designers control without sacrificing speed. My clients are blown away every time.', author: 'David Kim', role: 'Freelance Designer', avatarUrl: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=120&q=80' }
          ]
        }
      };

    case 'pricing_cards':
      return {
        ...base,
        name: 'Pricing Plans',
        styles: { ...base.styles, paddingTop: 80, paddingBottom: 80 },
        content: {
          subtitle: 'Simple Pricing',
          title: 'Choose the plan that fits you',
          description: 'Start free, scale as you grow. No hidden fees, cancel anytime.',
          pricingPlans: [
            { name: 'Starter', price: '$0', period: 'month', features: ['3 projects', '10 blocks per page', 'HTML export', 'Community support'], btnText: 'Start Free', popular: false },
            { name: 'Pro', price: '$29', period: 'month', features: ['Unlimited projects', 'All block types', 'HTML + React export', 'Priority support', 'Custom domain', 'Analytics'], btnText: 'Start Pro Trial', popular: true },
            { name: 'Team', price: '$79', period: 'month', features: ['Everything in Pro', '5 team seats', 'Collaboration tools', 'Dedicated account manager', 'Custom integrations', 'SLA guarantee'], btnText: 'Contact Sales', popular: false }
          ]
        }
      };

    case 'contact_form':
      return {
        ...base,
        name: 'Contact Form',
        styles: { ...base.styles, paddingTop: 80, paddingBottom: 80, align: 'center' },
        content: {
          title: "Let's work together",
          description: 'Have a project in mind? Fill out the form below and we\'ll get back to you within 24 hours.',
          formFields: [
            { label: 'Full Name', placeholder: 'Jane Smith', type: 'text' },
            { label: 'Email Address', placeholder: 'jane@example.com', type: 'email' },
            { label: 'Company', placeholder: 'Your company name', type: 'text' },
            { label: 'Message', placeholder: 'Tell us about your project...', type: 'textarea' }
          ],
          formBtnText: 'Send Message'
        }
      };

    case 'cta_block':
      return {
        ...base,
        name: 'Call to Action',
        styles: { ...base.styles, paddingTop: 80, paddingBottom: 80, bgColor: '#4f46e5', textColor: '#ffffff', align: 'center' },
        content: {
          title: 'Ready to build something amazing?',
          description: 'Join over 50,000 creators who are already building with Landy. Start your free 14-day trial today.',
          primaryBtnText: 'Start Building Free',
          primaryBtnUrl: '#',
          secondaryBtnText: 'View Demo',
          secondaryBtnUrl: '#'
        }
      };

    case 'image_block':
      return {
        ...base,
        name: 'Image Block',
        styles: { ...base.styles, paddingTop: 48, paddingBottom: 48 },
        content: {
          imageUrl: '',
          imageAlt: 'Featured image',
          description: '',
          imageAspectRatio: 'video',
          imageFit: 'cover',
          imageFilter: 'none',
          imageBorderWidth: 0,
          imageBorderColor: '#e2e8f0'
        }
      };

    case 'video_embed':
      return {
        ...base,
        name: 'Video Embed',
        styles: { ...base.styles, paddingTop: 64, paddingBottom: 64, align: 'center' },
        content: {
          title: 'See it in action',
          description: 'Watch how easy it is to build your perfect landing page.',
          videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ'
        }
      };

    case 'divider':
      return {
        ...base,
        name: 'Divider Line',
        styles: { ...base.styles, paddingTop: 8, paddingBottom: 8 },
        content: { dividerStyle: 'solid' }
      };

    case 'spacer':
      return {
        ...base,
        name: 'Layout Spacer',
        styles: { ...base.styles, paddingTop: 0, paddingBottom: 0 },
        content: { spacerHeight: 48 }
      };

    case 'footer':
      return {
        ...base,
        name: 'Footer',
        styles: { ...base.styles, paddingTop: 48, paddingBottom: 48, bgColor: '#0f172a', textColor: '#94a3b8' },
        content: {
          brandName: 'YourBrand',
          copyright: `© ${new Date().getFullYear()} YourBrand. All rights reserved.`,
          links: [
            { label: 'Privacy Policy', url: '#' },
            { label: 'Terms of Service', url: '#' },
            { label: 'Contact', url: '#' }
          ]
        }
      };

    default:
      return { ...base, name: 'Unknown Block' };
  }
};

export const INITIAL_PROJECT: ProjectState = {
  name: 'My Landing Page',
  style: {
    background: '#ffffff',
    theme: 'minimal_modern',
    fontFamily: 'Inter, system-ui, sans-serif',
    uiStyle: 'canva_like_clean_editor',
    radius: '12px',
    shadows: 'soft_elevation',
    spacingSystem: '8px_grid',
    animationSpeed: '150ms'
  },
  blocks: [
    createBlockByType('navbar', 'navbar-default'),
    createBlockByType('hero_section', 'hero-default'),
    createBlockByType('stats_block', 'stats-default'),
    createBlockByType('features_grid', 'features-default'),
    createBlockByType('cta_block', 'cta-default'),
    createBlockByType('footer', 'footer-default')
  ]
};
