'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  BUSINESS_EXPERIENCE_OPTIONS,
  CAREER_GOAL_OPTIONS,
  INTEREST_OPTIONS,
  MOTIVATION_OPTIONS,
  OPPORTUNITY_OPTIONS,
  SUCCESS_OPTIONS,
  type Option,
} from '@/lib/onboarding-options';
import styles from './onboarding.module.css';

type Plan = {
  _id: string;
  name: string;
  description: string;
  pricePerMonth: number;
};

type Answers = {
  fullName: string;
  interests: string[];
  motivations: string[];
  careerGoals: string[];
  careerGoalsOther: string;
  successValues: string[];
  successOther: string;
  opportunityValues: string[];
  opportunityOther: string;
  businessExperience: string;
  aboutMe: string;
  planId: string;
};

type ListKey = 'interests' | 'motivations' | 'careerGoals' | 'successValues' | 'opportunityValues';
type TextKey = 'careerGoalsOther' | 'successOther' | 'opportunityOther' | 'aboutMe';

type Step =
  | { id: 'intro' }
  | { id: 'name' }
  | {
      id: ListKey;
      title: (first: string) => string;
      help: string;
      options: Option[];
      other?: TextKey;
      otherPlaceholder?: string;
      allowCustom?: boolean;
      compact?: boolean;
    }
  | { id: 'experience' }
  | { id: 'about' }
  | { id: 'plan' };

const STEPS: Step[] = [
  { id: 'intro' },
  { id: 'name' },
  {
    id: 'interests',
    title: (first) => `Nice to meet you${first ? `, ${first}` : ''}! What are your interests?`,
    help: 'Select as many as you’d like.',
    options: INTEREST_OPTIONS,
    allowCustom: true,
    compact: true,
  },
  {
    id: 'motivations',
    title: () => 'What are your primary motivations for exploring Mothers to Daughters?',
    help: 'Select all that apply.',
    options: MOTIVATION_OPTIONS,
  },
  {
    id: 'careerGoals',
    title: () => 'What are your career goals?',
    help: 'Select all that apply, and add your own if you like.',
    options: CAREER_GOAL_OPTIONS,
    other: 'careerGoalsOther',
    otherPlaceholder: 'Anything else you’re working toward? (optional)',
  },
  {
    id: 'successValues',
    title: () => 'What does success mean to you?',
    help: 'Select all that apply, and add your own if you like.',
    options: SUCCESS_OPTIONS,
    other: 'successOther',
    otherPlaceholder: 'In your own words… (optional)',
  },
  {
    id: 'opportunityValues',
    title: () => 'What do you look for in your next career opportunity?',
    help: 'Select all that apply, and add your own if you like.',
    options: OPPORTUNITY_OPTIONS,
    other: 'opportunityOther',
    otherPlaceholder: 'Something else that matters to you? (optional)',
  },
  { id: 'experience' },
  { id: 'about' },
  { id: 'plan' },
];

const LETTERS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
const QUESTION_COUNT = STEPS.length - 1; // the intro isn't numbered

function isTyping(target: EventTarget | null) {
  const el = target as HTMLElement | null;
  return !!el && (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA' || el.isContentEditable);
}

export default function OnboardingForm({ initialName = '' }: { initialName?: string }) {
  const [index, setIndex] = useState(0);
  const [answers, setAnswers] = useState<Answers>({
    fullName: initialName,
    interests: [],
    motivations: [],
    careerGoals: [],
    careerGoalsOther: '',
    successValues: [],
    successOther: '',
    opportunityValues: [],
    opportunityOther: '',
    businessExperience: '',
    aboutMe: '',
    planId: '',
  });
  const [customInterest, setCustomInterest] = useState('');
  const [plans, setPlans] = useState<Plan[]>([]);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);
  const focusRef = useRef<HTMLInputElement & HTMLTextAreaElement>(null);

  const step = STEPS[index];
  const first = answers.fullName.trim().split(/\s+/)[0] ?? '';

  useEffect(() => {
    fetch('/api/subscriptions/plans')
      .then((r) => (r.ok ? r.json() : []))
      .then((data: Plan[]) => setPlans(Array.isArray(data) ? data : []))
      .catch(() => setPlans([]));
  }, []);

  // Focus the text box of each text step as it appears.
  useEffect(() => {
    setError('');
    const t = setTimeout(() => focusRef.current?.focus(), 50);
    return () => clearTimeout(t);
  }, [index]);

  const set = <K extends keyof Answers>(key: K, value: Answers[K]) =>
    setAnswers((a) => ({ ...a, [key]: value }));

  const toggle = useCallback((key: ListKey, value: string) => {
    setAnswers((a) => ({
      ...a,
      [key]: a[key].includes(value) ? a[key].filter((v) => v !== value) : [...a[key], value],
    }));
  }, []);

  function addCustomInterest() {
    const v = customInterest.trim();
    if (v && !answers.interests.includes(v)) toggle('interests', v);
    setCustomInterest('');
  }

  const validate = useCallback((): string => {
    switch (step.id) {
      case 'name':
        return answers.fullName.trim() ? '' : 'Please tell us your name.';
      case 'interests':
        return answers.interests.length ? '' : 'Pick at least one interest.';
      case 'motivations':
        return answers.motivations.length ? '' : 'Pick at least one.';
      case 'careerGoals':
      case 'successValues':
      case 'opportunityValues':
        return answers[step.id].length || (step.other && answers[step.other].trim())
          ? ''
          : 'Pick at least one, or describe your own.';
      case 'experience':
        return answers.businessExperience ? '' : 'Choose one.';
      case 'plan':
        return answers.planId ? '' : 'Choose a plan.';
      default:
        return '';
    }
  }, [answers, step]);

  const submit = useCallback(async () => {
    setSaving(true);
    setError('');
    try {
      const res = await fetch('/api/mentee/onboarding', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...answers, fullName: answers.fullName.trim() }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? 'Something went wrong.');
        setSaving(false);
        return;
      }
      if (data.redirect) {
        window.location.href = data.redirect;
        return;
      }
      if (data.next === 'checkout') {
        const c = await fetch('/api/subscriptions/checkout', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ tierId: data.planId }),
        });
        const cd = await c.json().catch(() => ({}));
        // Checkout returns a Zeffy link ({ zeffyUrl }); fall back to the legacy
        // `url` field just in case, then to the pending page.
        const checkoutUrl = c.ok ? (cd.zeffyUrl ?? cd.url) : null;
        window.location.href = checkoutUrl ?? '/dashboard/mentee/subscription?pending=1';
        return;
      }
      window.location.href = '/dashboard/mentee';
    } catch {
      setError('Something went wrong. Please try again.');
      setSaving(false);
    }
  }, [answers]);

  const next = useCallback(() => {
    const problem = validate();
    if (problem) {
      setError(problem);
      return;
    }
    if (index === STEPS.length - 1) {
      void submit();
    } else {
      setIndex((i) => i + 1);
    }
  }, [index, submit, validate]);

  const back = () => setIndex((i) => Math.max(0, i - 1));

  // Typeform-style keys: Enter continues, letters pick options.
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (saving) return;
      const typing = isTyping(e.target);
      if (e.key === 'Enter') {
        const tag = (e.target as HTMLElement | null)?.tagName;
        if (tag === 'INPUT') return; // the form's own submit handles it
        if (tag === 'TEXTAREA' && !(e.metaKey || e.ctrlKey)) return; // new line
        e.preventDefault();
        next();
        return;
      }
      if (typing || e.metaKey || e.ctrlKey || e.altKey || e.key.length !== 1) return;
      const i = LETTERS.indexOf(e.key.toUpperCase());
      if (i < 0) return;
      if ('options' in step && i < step.options.length) {
        toggle(step.id, step.options[i].value);
      } else if (step.id === 'experience' && i < BUSINESS_EXPERIENCE_OPTIONS.length) {
        setAnswers((a) => ({ ...a, businessExperience: BUSINESS_EXPERIENCE_OPTIONS[i] }));
      } else if (step.id === 'plan' && i < plans.length) {
        setAnswers((a) => ({ ...a, planId: plans[i]._id }));
      }
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [next, plans, saving, step, toggle]);

  const customInterests = useMemo(
    () => answers.interests.filter((v) => !INTEREST_OPTIONS.some((o) => o.value === v)),
    [answers.interests]
  );

  const progress = Math.round((index / (STEPS.length - 1)) * 100);
  const isLast = index === STEPS.length - 1;

  return (
    <div className={styles.shell}>
      <div className={styles.progress} aria-hidden="true">
        <div className={styles.progressBar} style={{ width: `${progress}%` }} />
      </div>

      <form
        className={styles.stage}
        onSubmit={(e) => {
          e.preventDefault();
          next();
        }}
        aria-live="polite"
      >
        <div key={step.id} className={styles.step}>
          {step.id === 'intro' ? (
            <div className={styles.intro}>
              <p className={styles.introKicker}>Mothers to Daughters</p>
              <h1 className={styles.introTitle}>Let&apos;s get to know you a little more!</h1>
              <p className={styles.help}>
                A few quick questions help us pair you with the right mentor. It takes about
                three minutes.
              </p>
            </div>
          ) : (
            <p className={styles.counter}>
              {index} <span aria-hidden="true">→</span>
              <span className={styles.srOnly}> of {QUESTION_COUNT}</span>
            </p>
          )}

          {step.id === 'name' && (
            <>
              <label htmlFor="ob-name" className={styles.question}>
                First thing&apos;s first: what is your full name?
              </label>
              <input
                id="ob-name"
                ref={focusRef}
                className={styles.lineInput}
                value={answers.fullName}
                onChange={(e) => set('fullName', e.target.value)}
                placeholder="Type your answer here…"
                autoComplete="name"
                maxLength={120}
              />
            </>
          )}

          {'options' in step && (
            <fieldset className={styles.fieldset}>
              <legend className={styles.question}>{step.title(first)}</legend>
              <p className={styles.help}>{step.help}</p>
              <div className={`${styles.options} ${step.compact ? styles.optionsGrid : ''}`}>
                {step.options.map((o, i) => {
                  const on = answers[step.id].includes(o.value);
                  return (
                    <button
                      type="button"
                      key={o.value}
                      className={`${styles.option} ${on ? styles.optionOn : ''}`}
                      aria-pressed={on}
                      onClick={() => toggle(step.id, o.value)}
                    >
                      <span className={styles.key} aria-hidden="true">
                        {LETTERS[i]}
                      </span>
                      <span className={styles.emoji} aria-hidden="true">
                        {o.emoji}
                      </span>
                      <span className={styles.optionLabel}>{o.label}</span>
                      {on && (
                        <span className={styles.check} aria-hidden="true">
                          ✓
                        </span>
                      )}
                    </button>
                  );
                })}
                {step.allowCustom &&
                  customInterests.map((v) => (
                    <button
                      type="button"
                      key={v}
                      className={`${styles.option} ${styles.optionOn}`}
                      aria-pressed
                      onClick={() => toggle('interests', v)}
                    >
                      <span className={styles.emoji} aria-hidden="true">
                        ✨
                      </span>
                      <span className={styles.optionLabel}>{v}</span>
                      <span className={styles.check} aria-hidden="true">
                        ✕
                      </span>
                    </button>
                  ))}
              </div>

              {step.allowCustom && (
                <div className={styles.addRow}>
                  <input
                    className={styles.lineInput}
                    value={customInterest}
                    data-custom="true"
                    onChange={(e) => setCustomInterest(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        addCustomInterest();
                      }
                    }}
                    placeholder="Something else? Type it and press Enter"
                    aria-label="Add your own interest"
                    maxLength={60}
                  />
                </div>
              )}

              {step.other && (
                <textarea
                  className={styles.textArea}
                  value={answers[step.other]}
                  onChange={(e) => set(step.other!, e.target.value)}
                  placeholder={step.otherPlaceholder}
                  aria-label={step.otherPlaceholder}
                  rows={2}
                  maxLength={500}
                />
              )}
            </fieldset>
          )}

          {step.id === 'experience' && (
            <fieldset className={styles.fieldset}>
              <legend className={styles.question}>
                How many years of business or work experience do you have?
              </legend>
              <div className={styles.options}>
                {BUSINESS_EXPERIENCE_OPTIONS.map((o, i) => {
                  const on = answers.businessExperience === o;
                  return (
                    <button
                      type="button"
                      key={o}
                      className={`${styles.option} ${on ? styles.optionOn : ''}`}
                      aria-pressed={on}
                      onClick={() => set('businessExperience', o)}
                    >
                      <span className={styles.key} aria-hidden="true">
                        {LETTERS[i]}
                      </span>
                      <span className={styles.optionLabel}>{o}</span>
                      {on && (
                        <span className={styles.check} aria-hidden="true">
                          ✓
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </fieldset>
          )}

          {step.id === 'about' && (
            <>
              <label htmlFor="ob-about" className={styles.question}>
                Is there anything else you&apos;d like us to know about you?
              </label>
              <p className={styles.help}>Optional. Share as much or as little as you like.</p>
              <textarea
                id="ob-about"
                ref={focusRef}
                className={styles.textArea}
                value={answers.aboutMe}
                onChange={(e) => set('aboutMe', e.target.value)}
                placeholder="Type your answer here…"
                rows={4}
                maxLength={2000}
              />
              <p className={styles.hintSmall}>Press Ctrl + Enter (⌘ + Enter on Mac) to continue.</p>
            </>
          )}

          {step.id === 'plan' && (
            <fieldset className={styles.fieldset}>
              <legend className={styles.question}>Last step: choose your plan</legend>
              {plans.length === 0 && <p className={styles.help}>Loading plans…</p>}
              <div className={styles.plans}>
                {plans.map((p, i) => {
                  const on = answers.planId === p._id;
                  return (
                    <button
                      type="button"
                      key={p._id}
                      className={`${styles.planCard} ${on ? styles.optionOn : ''}`}
                      aria-pressed={on}
                      onClick={() => set('planId', p._id)}
                    >
                      <span className={styles.key} aria-hidden="true">
                        {LETTERS[i]}
                      </span>
                      <span className={styles.planName}>{p.name}</span>
                      <span className={styles.planPrice}>
                        ${(p.pricePerMonth / 100).toFixed(2)}/mo
                      </span>
                      {p.description && <span className={styles.planDesc}>{p.description}</span>}
                    </button>
                  );
                })}
              </div>
            </fieldset>
          )}

          {error && (
            <p className={styles.error} role="alert">
              {error}
            </p>
          )}

          <div className={styles.actions}>
            <button type="submit" className={styles.ok} disabled={saving}>
              {step.id === 'intro'
                ? 'Let’s go'
                : isLast
                  ? saving
                    ? 'Saving…'
                    : 'Finish'
                  : 'OK ✓'}
            </button>
            <span className={styles.enterHint}>
              press <strong>Enter ↵</strong>
            </span>
          </div>
        </div>
      </form>

      {index > 0 && (
        <div className={styles.nav}>
          <button type="button" onClick={back} aria-label="Previous question" disabled={saving}>
            ↑
          </button>
          <button type="button" onClick={next} aria-label="Next question" disabled={saving}>
            ↓
          </button>
        </div>
      )}
    </div>
  );
}
