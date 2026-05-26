export type ViewportMode = 'desktop' | 'laptop' | 'tablet' | 'mobile';

export interface StyleConfig {
  background: string;
  theme: 'minimal_modern' | 'glassmorphism' | 'brutalist' | 'neo_brutalist' | 'cosmic_dark';
  fontFamily: string;
  uiStyle: string;
  radius: string; // 'none' | 'md' | 'xl' | '2xl'
  shadows: string; // 'none' | 'soft' | 'heavy'
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
  | 'spacer';

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
  spacerHeight?: number; // in pixels
  imageAspectRatio?: 'auto' | 'square' | 'video' | 'portrait' | 'wide';
  imageFit?: 'cover' | 'contain' | 'fill';
  imageFilter?: 'none' | 'grayscale' | 'blur' | 'sepia' | 'vintage' | 'warm' | 'cool';
  imageBorderWidth?: number;
  imageBorderColor?: string;
}

export interface BlockStyles {
  paddingTop: number; // in pixels/rem equivalents
  paddingBottom: number;
  bgColor: string;
  textColor: string;
  brandColor: string; // Accent colors for buttons/highlights
  borderRadius: 'none' | 'md' | 'xl' | '3xl' | 'full';
  shadow: 'none' | 'soft' | 'heavy';
  align: 'left' | 'center' | 'right';
  fontFamily?: string;
}

export interface Block {
  id: string;
  type: BlockType;
  name: string;
  styles: BlockStyles;
  content: BlockContent;
}

export interface SelectionState {
  blockId: string | null;
  elementId: 'title' | 'subtitle' | 'brandName' | 'description' | 'primaryBtn' | 'secondaryBtn' | 'image' | 'video' | 'copyright' | 'form' | null;
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
