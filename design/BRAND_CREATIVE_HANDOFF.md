# Unfuck Your Taxes — Brand & Creative Handoff

Version: 1.1<br>
Source of truth: the live implementation in `style.css` and current page templates  
For: agents creating paid-social, display, organic-social, and supporting brand assets

## The job of the brand

Unfuck Your Taxes makes tax help feel clear, capable, and free of shame. The brand should meet someone who is behind, confused, or under pressure with calm authority—not fear, cheerleading, or comedy.

The emotional movement is:

`overwhelmed → oriented → able to take one next step`

The name is blunt. The execution is serious and administratively credible.

### Copy voice

- Be casual, conversational, and a little irreverent. The brand speaks like a smart person who has seen this exact tax mess before.
- Lead with the actual problem in customer language: notices, missing returns, balances, books that are a mess, and deadlines.
- Use contractions, short sentences, and direct questions. “Here’s what we need,” “Let’s look at it,” and “What’s going on?” all sound right.
- Use the brand’s bluntness deliberately. An occasional “f*cked,” “mess,” or “bullshit” can name the pain or the promise; do not turn every sentence into a joke.
- Do not sound therapeutic, inspirational, corporate, or like a formal tax firm. Empathy comes from being useful, nonjudgmental, and easy to understand.
- Avoid vague, canned reassurance such as “you’re not alone,” “we’ve got you,” “way forward,” “move forward,” or “we make it easy.”
- Never promise a tax result, savings amount, timeline, settlement, or eligibility before the underlying record is reviewed.
- Prefer CTAs that sound like a conversation: “Let’s look at it,” “Let’s talk,” “Start here,” and “Ask us.”

## Non-negotiable visual system

### Color tokens

| Token | Value | Use |
| --- | --- | --- |
| `black` | `#050505` | Default canvas, most creative backgrounds, body text on white |
| `white` | `#F8F8F4` | Primary type on black/blue, information panel background, button fill |
| `blue` | `#078BFF` | Small action/wayfinding accents: asterisk, arrows, selected rules, hover state |
| `blue-surface` | `#0867CF` | Full CTA/conversion panels only |
| `muted` | `#B9B9B3` | Secondary copy on black |
| `line` | `rgba(248,248,244,.24)` | Strong 1 px rule on black |
| `line-soft` | `rgba(248,248,244,.10)` | Section-to-section rule on black |
| `line-dark` | `rgba(5,5,5,.28)` | 1 px rule on white |

Rules:

- Start every asset on black. It is the default, not a special treatment.
- Use `blue-surface` only when the asset is a direct conversion moment: a final CTA, consultation, lead prompt, or clear “act now” panel.
- Use `blue` sparingly. It should read as an instruction or a point of action—not a decorative wash.
- White backgrounds are informational exceptions. On the website, the resource-card section is the model.
- Never introduce lime, coral, gradients, gold, navy, or a second accent color.

### Typography

| Role | Font | Weight / treatment | Use |
| --- | --- | --- | --- |
| Display | IBM Plex Sans JP | Regular (`400`), natural sentence case, tight leading | Headline, major statement, and wordmark |
| Body | DM Sans | Light (`275`) for reading copy; `500+` only for UI emphasis | Explanations, proof, support copy |
| Utility | DM Mono | 500 | Eyebrows, labels, URLs, small metadata |

Display rules:

- Headings use natural sentence case. Do not force title case or all caps.
- Do not use italics. The live site sets `em { font-style: normal; }`; emphasis is conveyed by scale, line break, or copy—not slant.
- Use the display sans only for a statement that earns attention. It should feel like a direct administrative label, not editorial decoration.
- Keep display weight regular and measured. Do not use bold/black headings.
- Use a deliberate line break to create a thought, not to create a decorative staircase.

Utility rules:

- Eyebrows, tags, campaign labels, and URLs are uppercase DM Mono with generous tracking.
- Buttons and short CTAs are uppercase DM Sans, semibold/bold, with generous tracking.
- Body copy is sentence case and concise.

### Wordmark and asterisk

The wordmark is two stacked lines:

```text
UNF*CK
YOUR TAXES
```

- The asterisk is `blue`.
- Set the wordmark in IBM Plex Sans JP, regular, uppercase, and a tight two-line lockup. Use it small and left-aligned, usually at the upper left. It is a lockup, not a headline.
- The asterisk may censor `unf*ck` / `f*cked` when the copy directly invokes the brand. Do not scatter asterisks as an ornamental motif.
- Do not use profanity for shock value. One blunt phrase earns attention; the rest of the creative needs to be calm and useful.

## Layout grammar

### Site-derived geometry

| Element | Specification |
| --- | --- |
| Desktop content width | `min(1200px, 100% - 48px)` |
| Mobile content width | `100% - 32px` |
| Header height | 90 px desktop / 74 px mobile |
| Section padding | `clamp(5rem, 11vw, 10rem)` vertical |
| Major rule | 1 px horizontal line; soft between full sections, stronger inside lists/cards |
| Button | Pill-shaped (`99px` radius), white fill / black text by default |

For static creative, preserve the same proportions rather than copying web pixels:

- Work inside a 6% safe margin on each edge (minimum).
- Put the wordmark in the top-left safe area.
- Keep the main claim in the middle-to-lower half; do not center every element mechanically.
- Put a short utility line, CTA, or URL in the lower safe area.
- Use one principal alignment edge. Default to left alignment.
- Use 1 px-equivalent rules to divide information; no boxes, drop shadows, or decorative frames.

### Surface hierarchy

1. **Black information / problem statement** — normal state.
2. **White information panel** — a contained reading or reference moment, black text and black rules.
3. **Blue conversion panel** — final action or direct response, white text and a white button.

The website follows this pattern in its final panels:

- Home: blue CTA band.
- Why Us, How It Works, Straight Answers, FAQ, and Cost & Consultation: closing blue action section.
- Straight Answers: a white resource-card panel before its blue closing section.

Do not make a creative entirely blue unless it is unmistakably a conversion asset.

## Components to reuse

### Eyebrow

`ALL CAPS / DM MONO / 11–12 px web equivalent / tracked`

Use for campaign name, step number, audience, or factual framing:

```text
UNFILED RETURNS
START WITH THE FACTS
TAX HELP, WITHOUT THE SALES PITCH
```

### Headline

One statement, two to four short lines at most. Favor useful clarity over cleverness.

Good patterns:

```text
Missing years are not one giant problem.
Get the facts before the deadline gets closer.
Make the numbers make sense again.
```

### Body / proof line

One or two plain sentences. It should lower the temperature and state the next useful idea.

```text
Start with what is filed, what is missing, and what needs attention first.
```

### CTA

White pill button on black or blue. On hover in web contexts, it becomes `blue` with black text.

Prefer:

```text
TALK TO US ↗
START WITH THE FACTS ↗
SEE WHAT HAPPENS NEXT ↗
```

For non-interactive placements, render the CTA as a visual label; do not imply that an image itself is a functioning button.

### Rules and arrows

- Use a thin horizontal line before/after a grouped list or between major sections.
- Use the simple line arrow (`→`) or diagonal arrow (`↗`) as navigation/action language.
- Use blue for a small arrow or index number, never for every line of text.

## Copy and campaign system

### Voice

Be direct, human, and procedurally grounded.

| Do | Avoid |
| --- | --- |
| “Any tax problem. No shame required.” | Jokes about people being irresponsible |
| “A straight answer about your taxes.” | Generic reassurance: “We are here for you.” |
| “Start with the facts.” | Fear-first claims or countdown panic |
| “No sales pitch.” | Overexplaining credentials in the headline |
| “What is filed, what is missing, what matters first.” | Promising a settlement, savings, or outcome |

The brand can be frank, but never cruel, smug, flippant, or anti-IRS in tone. It is not a legal service and should never claim legal representation.

### Approved message territories

All campaigns should map to one of these four entry points. They can overlap operationally, but creative should make one entry point unmistakable.

| Campaign | Customer tension | Headline direction | Clarifying proof |
| --- | --- | --- | --- |
| Tax prep | “I need to file correctly and get current.” | `File it right. Start with what you have.` | Personal and business returns, records readiness, tax-ready reporting. |
| Tax relief | “Notices, debt, or collections are following me.” | `Get clear on what needs attention first.` | Deadlines, notices, payment-plan questions, and licensed EA/CPA support where needed. |
| Unfiled returns | “Missing years feel too large to start.” | `Missing years are not one giant problem.` | Identify years, records, sequence, and urgency. |
| Cleanup | “My books, payroll, or records do not make sense.” | `Make the numbers make sense again.` | Cleanup, catch-up books, payroll, and a routine that stays current. |

### Required compliance guardrails

Every asset that mentions an outcome, price, urgency, or representation must follow these rules:

- Do not promise a specific settlement, penalty reduction, savings amount, tax result, or timeline.
- Do not say or imply affiliation with the IRS or another government agency.
- Do not call the business a law firm or imply legal advice/representation.
- Representation language must be qualified: “handled or supervised by a licensed Enrolled Agent or CPA where needed.”
- Fee language: the first conversation is free; fees are quoted in writing after scope is understood and before billable work begins. Do not advertise a flat price.
- For urgent tax notices, use calm specificity: “If there is a deadline, levy, garnishment, or notice, say so when you reach out.” Do not manufacture urgency.
- Do not put sensitive-information requests (SSN, bank information, full tax records) into a social asset or unencrypted email CTA.

## Build recipes for creative agents

### Standard problem-to-action ad

```text
[Top-left]      UNF*CK / YOUR TAXES
[Eyebrow]       UNFILED RETURNS

[Headline]      Missing years are not
                one giant problem.

[Support]       Start with what is missing, what records exist,
                and what needs attention first.

[Bottom]        START WITH THE FACTS ↗       unfuckyourtaxes.com
```

- Background: black.
- Headline: white IBM Plex Sans JP, regular, natural sentence case.
- Asterisk and final arrow: blue.
- Use a subtle horizontal rule above the bottom action area.

### Blue conversion asset

```text
[Top-left]      UNF*CK / YOUR TAXES
[Eyebrow]       THE FIRST CONVERSATION IS FREE

[Headline]      The first conversation
                is usually the hardest part.

[CTA pill]      START WITH A STRAIGHT ANSWER ↗
```

- Background: `blue-surface`.
- All text: white.
- Button: white with black text.
- Use this format only for clear conversion messaging.

### White informational asset

```text
[Top-left]      UNF*CK / YOUR TAXES
[Eyebrow]       STRAIGHT ANSWER / 01

[Headline]      Got an IRS letter you
                do not understand?

[Bottom]        START HERE →
```

- Background: white.
- Text and rules: black.
- Use blue for the asterisk, small label detail, or arrow only.
- This is for articles, explainers, and practical checklists—not hard conversion.

## Deliverables and file discipline

Unless a media plan specifies otherwise, build every concept from a master portrait layout, then crop deliberately:

| Deliverable | Pixels | Notes |
| --- | --- | --- |
| Master paid-social portrait | 1080 × 1350 | Primary design source; keep all essential copy inside the 6% safe margin |
| Square crop | 1080 × 1080 | Recompose the copy; do not simply crop headline lines |
| Story / vertical crop | 1080 × 1920 | Keep key text within the platform safe zone; reserve the top and bottom for platform UI |
| Open Graph social card | 1200 × 630 | Use the same hierarchy as the existing card, but no italics |

Name source and exported files like this:

```text
ufyt_[campaign]_[concept]_[format]_v01
ufyt_unfiled-returns_missing-years_1080x1350_v01
```

Layer names should be functional: `wordmark`, `eyebrow`, `headline`, `support-copy`, `rule`, `cta`, `url`, `background`. Keep text editable until approval.

## QA checklist

Before delivering any asset, verify:

- [ ] Base is black unless it is intentionally white informational or blue conversion.
- [ ] Blue appears only as the approved surface, asterisk, arrow, rule/detail, or action state.
- [ ] Display type is IBM Plex Sans JP, regular, natural sentence case, and never italic.
- [ ] Headline is readable at phone size and carries one clear thought.
- [ ] Wordmark is intact; blue asterisk is used correctly.
- [ ] There are no gradients, shadows, stock-tax clichés, extra colors, rounded cards, or decorative noise.
- [ ] Claims are factual, conditional where needed, and do not promise outcomes or savings.
- [ ] It identifies one campaign entry point: tax prep, tax relief, unfiled returns, or cleanup.
- [ ] URL/CTA is present when the asset is conversion-oriented.
- [ ] Essential content sits inside the intended crop-safe area.

## Legacy reference warning

`assets/og-default.png` is useful only for overall hierarchy—black field, small wordmark, large statement, blue utility line—but its italic serif typography is retired. Do not recreate that treatment; follow this document and `style.css` instead.

`assets/logo-serif-blue-star.*` and `assets/logo-serif-white.*` are retired Times New Roman exports. Keep them only as historical reference; do not use them in new work. The live wordmark follows the IBM Plex Sans JP specification above.
