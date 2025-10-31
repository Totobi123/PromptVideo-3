# Tivideo Design Guidelines

## Design Approach
**System-Based with Video Platform References**: Drawing inspiration from Runway ML and Synthesia's intuitive video generation interfaces, combined with YouTube's recognizable visual language. The design emphasizes a streamlined workflow from prompt input through script generation to final export.

---

## Core Design Elements

### A. Typography
**Font Families:**
- Primary: Inter for UI elements and body text
- Secondary: Roboto for headings and emphasis
- Monospace: JetBrains Mono for timestamps and code-like elements

**Hierarchy:**
- Hero Heading: text-5xl font-bold (Roboto)
- Section Headings: text-3xl font-semibold (Roboto)
- Card Titles: text-xl font-medium (Inter)
- Body Text: text-base font-normal (Inter)
- Timestamps: text-sm font-mono (JetBrains Mono)
- Helper Text: text-sm text-gray-400 (Inter)

### B. Color System
**Primary Palette:**
- Primary Red: #DC2626 (CTAs, active states, branding)
- Accent Red: #EF4444 (hover states, highlights)
- Deep Black: #1F2937 (secondary elements, borders)
- Dark Background: #111827 (main background)
- Card Background: #374151 (elevated surfaces)
- Light Text: #F9FAFB (primary text)
- Muted Text: #9CA3AF (secondary text)
- Success Green: #10B981 (completion states)

**Application:**
- Backgrounds: #111827 base, #374151 for cards
- Text: #F9FAFB primary, #9CA3AF secondary
- Buttons: #DC2626 primary, #EF4444 hover
- Borders: #1F2937 subtle dividers
- Progress: #DC2626 for active steps

### C. Layout System
**Spacing Primitives:**
- Use Tailwind units: 2, 4, 6, 8, 12, 16, 24 (e.g., p-4, m-8, gap-6)
- Section padding: py-16 to py-24
- Card padding: p-6 to p-8
- Component gaps: gap-4 to gap-8

**Grid Structure:**
- Container: max-w-7xl mx-auto px-6
- Multi-step workflow: Single column on mobile, side-by-side on desktop
- Timeline view: Scrollable horizontal layout with fixed timestamps
- Media grid: 2 columns on tablet, 3 columns on desktop

---

## Component Library

### Navigation
- Fixed header with logo (Tivideo branding), minimal navigation
- Logo: Bold red (#DC2626) with YouTube-inspired styling
- Dark background (#1F2937) with subtle border-bottom
- Height: h-16

### Input & Form Components
**Prompt Input Area:**
- Large textarea with dark card background (#374151)
- Placeholder text in muted gray (#9CA3AF)
- Focus state: red border glow (#DC2626)
- Character counter in bottom-right corner

**Selection Boxes (Mood/Pace/Length):**
- Horizontal row of clickable cards
- Inactive: #374151 background, #F9FAFB text
- Active: #DC2626 border (2px), red glow shadow
- Hover: #EF4444 border preview
- Icons above text labels (use Heroicons)
- Padding: p-6, rounded-lg

**Progress Indicators:**
- Numbered steps with connecting lines
- Active step: red circle with white number
- Completed: red checkmark icon
- Upcoming: gray outline circle
- Labels below each step

### Content Display
**Script Timeline:**
- Dark card (#374151) with rounded-xl
- Left column: Timestamps in monospace font with red accent
- Right column: Script text in light gray
- Visual separator line between timestamp ranges
- Padding: p-8, gap-6 between segments

**Media Recommendations:**
- Card-based grid layout
- Thumbnail placeholder with dark overlay
- Timestamp range badge (top-left, red background)
- Media type label (IMAGE/VIDEO, bottom-right)
- Hover: scale-105 transition, red border glow

**Video Preview Area:**
- Large centered container (aspect-16/9)
- Dark background with subtle border
- Placeholder when no content generated
- Export buttons anchored to bottom-right

### Buttons & CTAs
**Primary Button:**
- Background: #DC2626
- Hover: #EF4444 with slight scale (scale-105)
- Padding: px-8 py-4
- Font: font-semibold text-base
- Rounded: rounded-lg
- Shadow on hover: shadow-lg shadow-red-900/50

**Secondary Button:**
- Border: 2px #DC2626
- Text: #DC2626
- Hover: Background #DC2626, Text #F9FAFB
- Same dimensions as primary

**Export Buttons:**
- Icon + text combination (Heroicons)
- Grouped horizontally with gap-3
- Green accent (#10B981) for download states

---

## Layout Patterns

### Hero Section
**No traditional hero**: Launch directly into the workflow interface with a prominent prompt input area at top. Small branding header only.

### Main Workflow Layout
**Multi-Step Progression:**
1. **Prompt Input Stage**: Large centered textarea with helper text, "Describe your video..." placeholder
2. **Clarification Stage**: AI-generated questions with selection boxes displayed in vertical stack
3. **Generation Stage**: Loading state with progress bar and percentage
4. **Results Stage**: Split view - left timeline script, right media recommendations preview
5. **Export Stage**: Final preview with download options

**Responsive Behavior:**
- Mobile: Full-width single column, stacked sections
- Tablet: Side-by-side for selection boxes (2 columns)
- Desktop: Full workflow visibility with fixed navigation

### Timeline Visualization
- Horizontal scrollable container on mobile
- Full visible layout on desktop
- Time markers every 10-20 seconds
- Color-coded segments matching media types
- Red playhead indicator for current position

---

## Images & Media

**Hero/Header:**
- No large hero image - focus on immediate utility
- Small abstract background pattern (subtle red gradient overlay on #111827)

**Placeholder States:**
- Video preview: Dark rectangle with play icon
- Media thumbnails: Gray placeholder with media type icon
- Loading states: Animated skeleton screens with red accent

**Stock Media Display:**
- Thumbnails: 16:9 aspect ratio
- Overlay gradient on hover showing timestamp range
- Click to preview in modal with full metadata

---

## Visual Enhancements

**Minimal Animations:**
- Button hover: scale-105, 200ms ease
- Card selection: border glow transition, 300ms
- Progress steps: fade-in when activated
- Loading states: subtle pulse animation on red elements
- **NO scroll-triggered animations, NO complex motion graphics**

**Interactive States:**
- Focus rings: 2px red outline with offset
- Disabled: 50% opacity, cursor-not-allowed
- Loading: Spinner icon in red with rotation animation
- Success: Green checkmark with scale-in animation

---

## Accessibility
- All form inputs with visible labels
- Keyboard navigation for all selection boxes
- ARIA labels for icons and interactive elements
- Focus indicators always visible (red outline)
- Sufficient color contrast (#F9FAFB on #111827 = WCAG AAA)
- Screen reader announcements for generation progress

---

## Key Design Principles
1. **Workflow Clarity**: Each step clearly defined with visual progression
2. **Dark Theme Consistency**: Maintain #111827 background throughout
3. **Red as Action**: Use #DC2626 sparingly for primary actions and branding
4. **Information Density**: Balance between detail and white space - scripts need breathing room
5. **YouTube Familiarity**: Borrow recognizable patterns from video platforms users know
6. **No Login Friction**: Emphasize immediate usability without barriers