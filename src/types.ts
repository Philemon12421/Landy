export type ViewportMode = 'desktop' | 'laptop' | 'tablet' | 'mobile';

export interface StyleConfig {
  background: string;
  theme: 'minimal_modern' | 'glassmorphism' | 'brutalist' | 'neo_brutalist' | 'cosmic_dark';
  fontFamily: string;
  uiStyle: string;
  radius: string;
  shadows: string;
  spacingSystem: string;
  animationSpeed: string;
}

export type BlockType =
  | 'navbar'
  | 'hero_section'
  | 'features_grid'
  | 'pricing_cards'
  | 'testimonials'
  | 'cta_block'
  | 'contact_form'
  | 'image_block'
  | 'video_embed'
  | 'footer'
  | 'divider'
  | 'spacer'
  | 'text_block'
  | 'stats_block'
  | 'logo_bar'
  | 'faq_block'
  | 'team_block';

export interface FeatureItem {
  icon: string;
  title: string;
  description: string;
}

export interface TestimonialItem {
  quote: string;
  author: string;
  role: string;
  avatarUrl: string;
}

export interface PricingPlan {
  name: string;
  price: string;
  period: string;
  features: string[];
  btnText: string;
  popular?: boolean;
}

export interface FormField {
  label: string;
  placeholder: string;
  type: 'text' | 'email' | 'textarea' | 'tel';
}

export interface StatItem {
  value: string;
  label: string;
  prefix?: string;
  suffix?: string;
}

export interface FAQItem {
  question: string;
  answer: string;
}

export interface TeamMember {
  name: string;
  role: string;
  bio: string;
  avatarUrl: string;
  linkedinUrl?: string;
  twitterUrl?: string;
}

export interface LogoItem {
  name: string;
  logoUrl: string;
}

export interface BlockContent {
  brandName?: string;
  logoUrl?: string;
  links?: Array<{ label: string; url: string }>;
  title?: string;
  subtitle?: string;
  description?: string;
  primaryBtnText?: string;
  primaryBtnUrl?: string;
  secondaryBtnText?: string;
  secondaryBtnUrl?: string;
  imageUrl?: string;
  imageAlt?: string;
  videoUrl?: string;
  features?: FeatureItem[];
  testimonials?: TestimonialItem[];
  pricingPlans?: PricingPlan[];
  copyright?: string;
  formFields?: FormField[];
  formBtnText?: string;
  formEmailTarget?: string;
  dividerStyle?: 'solid' | 'dashed' | 'dotted';
  spacerHeight?: number;
  imageAspectRatio?: 'auto' | 'square' | 'video' | 'portrait' | 'wide';
  imageFit?: 'cover' | 'contain' | 'fill';
  imageFilter?: 'none' | 'grayscale' | 'blur' | 'sepia' | 'vintage' | 'warm' | 'cool';
  imageBorderWidth?: number;
  imageBorderColor?: string;
  // text_block
  textContent?: string;
  textTag?: 'h1' | 'h2' | 'h3' | 'h4' | 'p' | 'blockquote';
  textFontSize?: number;
  textFontWeight?: '400' | '500' | '600' | '700' | '800' | '900';
  textLineHeight?: number;
  textLetterSpacing?: number;
  textDecoration?: 'none' | 'underline' | 'line-through';
  textTransform?: 'none' | 'uppercase' | 'lowercase' | 'capitalize';
  textMaxWidth?: string;
  // stats_block
  stats?: StatItem[];
  statsLayout?: 'row' | 'grid';
  // logo_bar
  logos?: LogoItem[];
  logoBarTitle?: string;
  // faq_block
  faqs?: FAQItem[];
  // team_block
  team?: TeamMember[];
  // shared rich content
  badgeText?: string;
  badgeColor?: string;
  showBadge?: boolean;
  // button styles
  primaryBtnStyle?: 'filled' | 'outline' | 'ghost';
  secondaryBtnStyle?: 'filled' | 'outline' | 'ghost';
  // navbar extras
  navbarStyle?: 'default' | 'transparent' | 'frosted';
  showNavCta?: boolean;
}

export interface BlockStyles {
  paddingTop: number;
  paddingBottom: number;
  paddingLeft?: number;
  paddingRight?: number;
  bgColor: string;
  textColor: string;
  brandColor: string;
  borderRadius: 'none' | 'md' | 'xl' | '3xl' | 'full';
  shadow: 'none' | 'soft' | 'heavy';
  align: 'left' | 'center' | 'right';
  fontFamily?: string;
  fontSize?: number;
  // border
  borderWidth?: number;
  borderColor?: string;
  borderStyle?: 'solid' | 'dashed' | 'dotted' | 'none';
  // gradient bg option
  useGradient?: boolean;
  gradientFrom?: string;
  gradientTo?: string;
  gradientDirection?: 'to-r' | 'to-b' | 'to-br' | 'to-tr';
  // custom max width
  maxWidth?: 'full' | '7xl' | '5xl' | '4xl' | '3xl' | '2xl';
}


export type ElementType = 'text' | 'image' | 'button' | 'shape' | 'container' | 'video';

export interface CanvasElement {
  id: string;
  type: ElementType;
  parentId: string;
  position: { x: number; y: number };
  size: { width: number | 'auto' | '100%'; height: number | 'auto' };
  locked?: boolean;
  hidden?: boolean;
  name?: string;
  content: {
    text?: string;
    imageUrl?: string;
    url?: string;
    tag?: 'h1' | 'h2' | 'h3' | 'h4' | 'p' | 'span';
    shapeType?: 'rectangle' | 'circle' | 'line';
  };
  styles: {
    color?: string;
    backgroundColor?: string;
    fontFamily?: string;
    fontSize?: number;
    fontWeight?: string;
    textAlign?: 'left' | 'center' | 'right';
    lineHeight?: number;
    letterSpacing?: number;
    opacity?: number;
    borderWidth?: number;
    borderColor?: string;
    borderRadius?: number;
    shadow?: 'none' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';
    paddingTop?: number;
    paddingRight?: number;
    paddingBottom?: number;
    paddingLeft?: number;
  };
}

export interface Block {
  elements: CanvasElement[];
  id: string;
  type: BlockType;
  name: string;
  styles: BlockStyles;
  content: BlockContent;
}

export interface SelectionState {
  blockId: string | null;
  elementId: string | null;
}

export interface ProjectState {
  name: string;
  blocks: Block[];
  style: StyleConfig;
}

export interface CommunityTemplate {
  id: string;
  component_name: string;
  description: string;
  category: string;
  projectData: ProjectState;
  createdAt?: string;
}
