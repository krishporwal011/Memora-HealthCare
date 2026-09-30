# Memora: UI/UX Design System (v1)

> Canonical design system definition for Memora. All UI work must follow this specification. Do not invent new colors, sizes or components.

## 1. Design principle
**Calm, one-thing-at-a-time, forgiving.** Memora has two audiences with different needs:

| | Patient mode | Caregiver mode |
|---|---|---|
| Goal | Comfort, orientation, gentle activities | Monitoring, setup, reports |
| Density | Very low: 1 task per screen | Normal dashboard |
| Input | Voice + big taps | Standard forms |
| Tone | Warm, never corrective | Clear, factual |

Rules that apply everywhere in patient mode:
- Max 1 primary action per screen, max 3 choices.
- No wrong-answer states. Never show "Incorrect", red, or a score. Use "Let's try another" and gentle hints.
- No timers, countdowns, or surprise popups.
- Always-visible Home and "Call family" buttons in the same place.
- Show date, day and time on the home screen (orientation support).
- Nothing disappears or moves between visits. Predictable layout is a feature.

## 2. Visual language
Soft, warm, high-contrast. Rounded, friendly, no clutter, no decorative animation.

**Color tokens (light default, dark optional)**
```css
--bg:          #FBF8F3;  /* warm off-white */
--surface:     #FFFFFF;
--ink:         #1F2933;  /* body text (contrast > 12:1 on bg) */
--ink-soft:    #4B5563;
--primary:     #2F6F6B;  /* calm teal (main buttons) */
--primary-ink: #FFFFFF;
--accent:      #E8A33D;  /* warm amber (highlights, reminders) */
--success:     #3E8E5A;
--alert:       #B4452F;  /* only for real safety alerts (caregiver side) */
--focus:       #1D4ED8;  /* 3px focus ring */
```
Never use color alone to convey meaning; pair with icon + text.

**Typography**: Atkinson Hyperlegible (Latin) + Noto Sans for Devanagari/Bengali-Assamese/Meetei Mayek. Fallback system-ui.
- Patient body: 22px min, headings 32-40px, line-height 1.5
- Caregiver body: 16-18px
- No italics, no all-caps, no light weights below 400.

**Shape and spacing**: 8px grid. Radius 20px cards, 999px buttons. Soft shadow only (0 2px 8px rgba(0,0,0,.08)).

**Touch targets**: 64px min height in patient mode (48px caregiver). 16px+ gap between targets.

**Icons**: Lucide, 28px+, always with a text label. Real photos (family, places) over illustrations inside memory content.

**Motion**: 150-250ms fades only. Respect `prefers-reduced-motion`. No parallax, no bouncing, no auto-advancing carousels.

## 3. Core components
1. **BigButton** (primary/secondary, icon + label, 64px)
2. **MemoryCard** (large photo, name, relationship, one-line story, "Listen" button)
3. **VoiceButton** (hold/tap to talk, clear listening state with waveform + text "I'm listening")
4. **PromptBubble** (assistant message, max 2 short sentences, read aloud option)
5. **ActivityShell** (title, one question, answer options, Skip always allowed)
6. **DayHeader** (day, date, time of day greeting)
7. **FamilyCallBar** (persistent, 2-3 saved contacts with photos)
8. **ReminderCard** (medicine/meal/appointment, amber, with "Done" and "Remind me later")
9. **CaregiverStatCard / TrendChart** (simple, labeled, plain-language summary)
10. **SafetyBanner** (caregiver only, used sparingly)

## 4. Key screens
**Patient:** Welcome/Home -> Memory Album -> Memory detail -> Gentle Activity (name the photo, music recall, routine sequencing) -> Reminders -> Talk to Memora -> Call family.
**Caregiver:** Onboarding (add patient, upload photos + stories) -> Dashboard (mood, engagement, reminders) -> Content manager -> Reports -> Settings (language, font size, voice).

Home screen layout (patient): greeting + date on top, 3 big tiles (Memories, Activities, Talk), FamilyCallBar pinned at bottom.

## 5. Language, voice, inclusion (NER India)
- Language switch on first screen and in settings: English, Hindi, Assamese, Bengali, Manipuri, Bodo, Nepali (confirm the final list against the problem statement).
- Voice-first: every screen readable aloud, voice commands for main actions.
- Low literacy friendly: icons + photos + audio before text.
- Offline-first PWA: cached album, reminders and activities work with poor connectivity. Show a quiet "Offline, everything still works" chip.
- Font size control (M/L/XL) and high-contrast toggle in caregiver settings; default already large.

## 6. Accessibility and safety checklist
- WCAG 2.2 AA minimum, AAA contrast for patient text.
- Full keyboard and screen-reader support, visible focus ring, `lang` attribute per language.
- Tap-only alternatives for every gesture. No swipe-only, no long-press-only, no drag-only.
- Error messages in plain language with a next step.
- Privacy: photos and health data stay consent-gated; caregiver sees what was shared and why. Show a clear "Only your family can see this" line.
- Not a medical device. Do not show diagnoses or clinical claims in patient UI.

## 7. Agent instructions (paste to Antigravity)
```
Follow DESIGN.md strictly. Use CSS variables for all tokens (no hardcoded colors).
Build mobile-first (360px), PWA, Tailwind or plain CSS variables.
Build components in /components/ui with one story/demo page each.
Patient routes live under /app, caregiver under /care.
After each UI task: run an accessibility check (axe), verify 64px targets, verify 22px body text, and report.
Change only what the brief asks; refine existing screens rather than redesigning them.
```

## 8. Suggested build order (fits your B01-B26 plan)
1. Tokens + typography + BigButton + layout shell
2. Patient Home + DayHeader + FamilyCallBar
3. Memory Album + MemoryCard
4. VoiceButton + PromptBubble
5. ActivityShell + 2 activities
6. Reminders
7. Caregiver dashboard + content manager
8. Language switch + offline states
9. A11y pass and demo polish

Validate with 2-3 real caregivers or elders if possible before the demo; it is the strongest point for judges.
