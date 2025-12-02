A) FULL COLOR PALETTE TABLE
| Token                     | Hex       | Usage |
|--------------------------|-----------|-------|
| --primary-blue           | #0094E6   | Corefinity brand blue, main accents |
| --primary-blue-light     | #36B7FF   | Hovers, highlights, glows |
| --primary-blue-dark      | #005A8A   | Deep brand anchors, shadows |
| --primary-orange         | #FF6B35   | Accent, CTA sparks |
| --primary-orange-light   | #FF8A5A   | Hover accents |
| --primary-orange-dark    | #C44E24   | Active/pressed state |
| --bg-0                   | #05070A   | Absolute darkest, page root |
| --bg-1                   | #0A0F17   | Navbar, footer base |
| --bg-2                   | #0D1624   | Hero base background |
| --bg-3                   | #111C2C   | Section backgrounds |
| --bg-4                   | #152234   | Cards, mega menu panels |
| --surface-1              | #1A2D44   | Floating small surfaces |
| --surface-2              | #1E3550   | Larger floating panels |
| --surface-3              | #244062   | Highest elevation surfaces |
| --text-primary           | #F2F7FA   | Pure readable white |
| --text-secondary         | #C6D4E1   | Paragraphs, light UI text |
| --text-tertiary          | #9AA9BA   | Labels, helper text |
| --text-muted             | #6F8196   | Disabled, subtle text |
| --text-inverse           | #0A0F17   | Dark-on-light cases |
| --text-accent-blue       | #36B7FF   | Highlighted blue text |
| --text-accent-orange     | #FF8A5A   | Highlighted orange text |
| --border-light           | #27415E   | Thin separators |
| --border-mid             | #1E3550   | Cards, panels |
| --border-heavy           | #152234   | Strong dividers |
| --glow-blue              | #33AFFF   | Server edges, hero glows |
| --glow-orange            | #FF7A4A   | Accent glow |
| --glow-cloud             | #8ECFFF   | Cloud highlights |
| --hover-bg               | #1A2D44   | Hover background |
| --hover-text             | #E9F4FF   | Hover text |
| --hover-border           | #36B7FF   | Hover ring |
| --active-bg              | #244062   | Pressed state |
| --active-text            | #FFFFFF   | Active text |
| --active-border          | #0094E6   | Pressed border |
| --focus-outline          | #36B7FF   | Keyboard focus ring |
| --disabled-bg            | #0F1A27   | Disabled element |
| --disabled-text          | #6F8196   | Disabled typography |
| --cta-gradient-start     | #0094E6   | CTA button gradient left |
| --cta-gradient-end       | #36B7FF   | CTA button gradient right |
| --cta-hover-start        | #0AA2FF   | Hover left |
| --cta-hover-end          | #5BC5FF   | Hover right |
| --cta-pressed            | #005A8A   | Pressed CTA |
| --cta-shadow             | rgba(0,148,230,0.35) | CTA shadow |
| --scroll-fade-start      | rgba(10,15,23,0)      | Slider edge fade |
| --scroll-fade-end        | #0A0F17   | Slider fade background |

B) CSS VARIABLES BLOCK
:root {
  --primary-blue: #0094E6;
  --primary-blue-light: #36B7FF;
  --primary-blue-dark: #005A8A;

  --primary-orange: #FF6B35;
  --primary-orange-light: #FF8A5A;
  --primary-orange-dark: #C44E24;

  --bg-0: #05070A;
  --bg-1: #0A0F17;
  --bg-2: #0D1624;
  --bg-3: #111C2C;
  --bg-4: #152234;

  --surface-1: #1A2D44;
  --surface-2: #1E3550;
  --surface-3: #244062;

  --text-primary: #F2F7FA;
  --text-secondary: #C6D4E1;
  --text-tertiary: #9AA9BA;
  --text-muted: #6F8196;
  --text-inverse: #0A0F17;

  --text-accent-blue: #36B7FF;
  --text-accent-orange: #FF8A5A;

  --border-light: #27415E;
  --border-mid: #1E3550;
  --border-heavy: #152234;

  --glow-blue: #33AFFF;
  --glow-orange: #FF7A4A;
  --glow-cloud: #8ECFFF;

  --hover-bg: #1A2D44;
  --hover-text: #E9F4FF;
  --hover-border: #36B7FF;

  --active-bg: #244062;
  --active-text: #FFFFFF;
  --active-border: #0094E6;

  --focus-outline: #36B7FF;

  --disabled-bg: #0F1A27;
  --disabled-text: #6F8196;

  --cta-gradient-start: #0094E6;
  --cta-gradient-end: #36B7FF;
  --cta-hover-start: #0AA2FF;
  --cta-hover-end: #5BC5FF;
  --cta-pressed: #005A8A;
  --cta-shadow: rgba(0,148,230,0.35);

  --scroll-fade-start: rgba(10,15,23,0);
  --scroll-fade-end: #0A0F17;
}

C) MINI-PREVIEW NOTES
Core Harmony

Entire palette pivots around navy → azure → cyan transitions.

Orange is minimal but strategic: sparks, highlights, micro-accents.

Enterprise Grade

Dark backgrounds use micro-contrast gradations to maintain readability.

Text colors are tuned for WCAG AA compliance.

Runpod Influence, Matured

No purple.

No neon flooding.

Glows are subtle and expensive.

Symmetry / Golden Ratio

Contrast spacing between background layers follows a ratio scaling:
1.00 → 1.618 → 2.618 → 4.236
This creates natural visual hierarchy without clutter.

D) SECTION-BY-SECTION COLOR MAPPING
1. Tier-1 Announcement Bar

BG: --bg-1

Text: --text-secondary

Accent: --primary-blue-light (for links)

2. Tier-2 Promo Bar

BG: linear-gradient(90deg, #0D1624, #111C2C)

Text: --text-primary

Icons: --primary-orange

3. Navbar

BG: --bg-1

Text: --text-primary

Hover: --hover-bg, --hover-border

Mega Menu panel: --bg-4 with --border-mid

4. Hero
Hero Gradient
background: linear-gradient(
  145deg,
  #05070A 0%,
  #0A0F17 35%,
  #0D1624 65%,
  #111C2C 100%
);

Cloud Layers

Base: rgba(255,255,255,0.06)

Tint: --glow-cloud

Shadow: rgba(0,0,0,0.5)

Server Glow

Edges: --glow-blue

Orange detail glints: --glow-orange

Text

Header: --text-primary

Subheader: --text-secondary

5. Trusted-By Slider

BG: --bg-2

Logos: default colors

Fade: --scroll-fade-start → --scroll-fade-end

6. Solutions Overview

BG: --bg-3

Cards: --bg-4

Borders: --border-mid

Icons: --primary-blue-light

7. Workflow Line

BG: --bg-3

Line: --primary-blue-light

Connectors: --primary-orange

8. Autoscale Sections

BG: radial-gradient(circle, #0D1624, #0A0F17)

Icons: --primary-blue-light

9. Testimonials Carousel

Card BG: --surface-1

Text: --text-secondary

Glow ring: --hover-border

10. Stats Bar

BG: --bg-3

Number text: --primary-blue-light

Label: --text-tertiary

11. Footer

BG: --bg-1

Text primary: --text-secondary

Dividers: --border-heavy

E) CTA COLOR SYSTEM
Default
background: linear-gradient(90deg,#0094E6,#36B7FF);
box-shadow: 0 4px 20px rgba(0,148,230,0.35);

Hover
background: linear-gradient(90deg,#0AA2FF,#5BC5FF);

Pressed
background: #005A8A;

Focus
outline: 2px solid #36B7FF;