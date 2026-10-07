# Persona Lab

A browser-based guided classroom activity for teaching **user personas, evidence, user needs, user stories and prioritisation**.

The activity is designed to work as a standalone teaching resource: each stage explains the concept, shows a worked example, then asks the learner to apply it.

## Learning journey

1. **Client brief**  
   Introduces user-centred design and records learner name/class for assessment evidence.

2. **Persona**  
   Explains what a persona is, where personas come from, and why demographics alone are not enough.

3. **Evidence → requirement**  
   Learners identify three requirements that are actually supported by their chosen persona.

4. **Guided user stories**  
   The exact requirements selected in stage 3 are carried forward. Learners match each requirement to an appropriate goal and benefit.

5. **Independent user story**  
   Learners choose one of their evidence-backed needs and write their own:
   **As a... / I want... / so that...**

6. **Critique**  
   Learners judge a randomised set of good and weak user stories, including circular benefits, over-large stories, implementation details and strong examples.

7. **Prioritisation**  
   Learners rank all three stories and justify the number-one priority using evidence from the persona.

8. **Evidence sheet**  
   Produces a timestamped summary containing the learner name/class, persona, evidence-backed requirements, guided stories, independently written story, ranked backlog and written priority justification.

## Classroom use

The final page is designed to be printed or screenshotted.

For assessment, the strongest evidence is:

- the independently written user story;
- the ranked backlog;
- the written priority justification.

The automatic score is useful feedback, but should not be treated as the final grade.

## Accessibility

The activity models the accessibility ideas it teaches:

- keyboard-operable controls;
- programmatically associated labels and form controls;
- `aria-pressed` on selectable requirement cards;
- `aria-current="step"` on the progress strip;
- focus moves to the new stage heading after navigation;
- reduced-motion preferences are respected;
- visible keyboard focus states.

## Technical details

The project is a single `index.html` file using plain HTML, CSS and JavaScript.

No dependencies, installs, accounts or backend are required.

## Run locally

Open `index.html` in a browser.

## GitHub Pages

The project is intended to run directly from the repository root on the `main` branch using GitHub Pages.
