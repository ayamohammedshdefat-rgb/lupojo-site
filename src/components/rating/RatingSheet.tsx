'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { LoaderCircle, X } from 'lucide-react';
import { AnimatePresence, m } from 'motion/react';
import { useEffect, useId, useRef, useState, useTransition } from 'react';
import { createPortal } from 'react-dom';
import { Controller, useForm, useWatch } from 'react-hook-form';
import { MotionProvider } from '@/components/motion/MotionProvider';
import { toast } from '@/components/ui/toast';
import { ar } from '@/i18n/ar';
import { SPRING_SOFT } from '@/lib/motion-tokens';
import { COMMENT_MAX, reviewInputSchema, type ReviewInput } from '@/schemas/review';
import { submitReview, type SubmitReviewResult } from '@/server/actions/reviews';
import { StarInput } from './StarInput';
import { SuccessBurst } from './SuccessBurst';
import { TurnstileField } from './TurnstileField';
import { STATS_EVENT, type StatsEventDetail } from './events';


type RatingSheetProps = { itemId: string; itemName: string; onClose: () => void };

const FOCUSABLE = 'a[href], button:not([disabled]), input:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

function Sheet({ itemId, itemName, onClose }: RatingSheetProps) {
  const titleId = useId();
  const panelRef = useRef<HTMLDivElement>(null);
  const [pending, startTransition] = useTransition();
  const [done, setDone] = useState<Extract<SubmitReviewResult, { ok: true }> | null>(null);
  const [formError, setFormError] = useState<string | null>(null);

  const form = useForm<ReviewInput, unknown, ReviewInput>({
    resolver: zodResolver(reviewInputSchema, undefined, { raw: true }),
    defaultValues: { itemId, rating: 0, name: '', phone: '', comment: '', website: '', turnstileToken: undefined },
    mode: 'onTouched',
  });
  const { register, control, handleSubmit, formState, setError } = form;
  const comment = useWatch({ control, name: 'comment' }) ?? '';

  useEffect(() => {
    const opener = document.activeElement as HTMLElement | null;
    panelRef.current?.querySelector<HTMLElement>('[role="radio"][tabindex="0"]')?.focus();
    return () => opener?.focus({ preventScroll: true });
  }, []);

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      e.stopPropagation();
      onClose();
      return;
    }
    if (e.key !== 'Tab' || !panelRef.current) return;
    const nodes = [...panelRef.current.querySelectorAll<HTMLElement>(FOCUSABLE)].filter((n) => n.offsetParent !== null);
    const first = nodes[0];
    const last = nodes.at(-1);
    if (!first || !last) return;
    if (e.shiftKey && document.activeElement === first) {
      e.preventDefault();
      last.focus();
    } else if (!e.shiftKey && document.activeElement === last) {
      e.preventDefault();
      first.focus();
    }
  };

  const onSubmit = handleSubmit((values) => {
    setFormError(null);
    startTransition(async () => {
      const res = await submitReview(values);
      if (res.ok) {
        setDone(res);
        toast(res.message, 'success');
        if (res.stats) {
          window.dispatchEvent(new CustomEvent<StatsEventDetail>(STATS_EVENT, { detail: { itemId, stats: res.stats } }));
        }
        return;
      }
      if (res.fieldErrors) {
        for (const [k, msg] of Object.entries(res.fieldErrors)) {
          setError(k as keyof ReviewInput, { type: 'server', message: msg });
        }
      }
      setFormError(res.message);
    });
  });

  const field =
    'w-full rounded-[18px] border border-line bg-white/[0.05] px-4 py-3 text-base leading-ui text-fg placeholder:text-muted focus:border-accent/60 focus:bg-white/[0.08] focus:outline-none aria-[invalid=true]:border-danger/70';

  return (
    <div className="fixed inset-0 z-[60] flex items-end justify-center md:items-center md:p-6" onKeyDown={onKeyDown}>
      <m.div
        aria-hidden="true"
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
      />
      <m.div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        data-rating-sheet
        className="glass-strong relative flex max-h-[94dvh] w-full max-w-lg flex-col overflow-y-auto overscroll-contain rounded-t-[32px] px-5 pt-4 pb-[calc(1.5rem+env(safe-area-inset-bottom))] shadow-card md:rounded-[32px] md:px-8 md:pt-6"
        initial={{ y: '100%' }}
        animate={{ y: 0 }}
        exit={{ y: '100%' }}
        transition={SPRING_SOFT}
      >
        <span aria-hidden="true" className="mx-auto mb-3 h-1.5 w-11 rounded-full bg-white/25 md:hidden" />
        <button
          type="button"
          onClick={onClose}
          aria-label={ar.common.close}
          className="glass absolute end-4 top-4 flex size-11 items-center justify-center rounded-full text-fg hover:bg-white/10"
        >
          <X size={20} strokeWidth={1.75} aria-hidden="true" />
        </button>

        <AnimatePresence mode="wait" initial={false}>
          {done ? (
            <m.div
              key="done"
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex flex-col items-center gap-5 py-6 text-center"
              data-rating-success
            >
              <SuccessBurst />
              <h2 id={titleId} className="text-xl leading-heading font-bold text-fg">
                {done.message}
              </h2>
              <button
                type="button"
                onClick={onClose}
                className="min-h-12 rounded-full bg-accent px-8 text-base leading-ui font-semibold text-canvas hover:bg-accent-hi"
              >
                {ar.common.close}
              </button>
            </m.div>
          ) : (
            <m.form
              key="form"
              exit={{ opacity: 0, scale: 0.96 }}
              onSubmit={onSubmit}
              noValidate
              className="flex flex-col gap-5"
            >
              <h2 id={titleId} className="pe-12 text-xl leading-heading font-bold text-fg">
                {ar.rating.title(itemName)}
              </h2>

              <Controller
                control={control}
                name="rating"
                render={({ field: f, fieldState }) => (
                  <StarInput value={f.value || 0} onChange={(v) => f.onChange(v)} error={fieldState.error?.message} />
                )}
              />

              <div className="flex flex-col gap-1.5">
                <label htmlFor="rv-name" className="text-sm leading-ui font-semibold text-fg">
                  {ar.rating.name}
                </label>
                <input
                  id="rv-name"
                  autoComplete="name"
                  className={field}
                  aria-invalid={formState.errors.name ? true : undefined}
                  aria-describedby={formState.errors.name ? 'rv-name-err' : undefined}
                  {...register('name')}
                />
                {formState.errors.name && (
                  <p id="rv-name-err" role="alert" className="text-sm leading-ui text-danger">
                    {formState.errors.name.message}
                  </p>
                )}
              </div>

              <div className="flex flex-col gap-1.5">
                <label htmlFor="rv-phone" className="text-sm leading-ui font-semibold text-fg">
                  {ar.rating.phone}
                </label>
                <input
                  id="rv-phone"
                  type="tel"
                  dir="ltr"
                  inputMode="tel"
                  autoComplete="tel"
                  placeholder={ar.rating.phonePlaceholder}
                  className={`${field} text-end`}
                  aria-invalid={formState.errors.phone ? true : undefined}
                  aria-describedby={['rv-phone-note', formState.errors.phone ? 'rv-phone-err' : ''].filter(Boolean).join(' ')}
                  {...register('phone')}
                />
                <p id="rv-phone-note" className="text-xs leading-ui text-muted">
                  {ar.rating.phoneNote}
                </p>
                {formState.errors.phone && (
                  <p id="rv-phone-err" role="alert" className="text-sm leading-ui text-danger">
                    {formState.errors.phone.message}
                  </p>
                )}
              </div>

              <div className="flex flex-col gap-1.5">
                <div className="flex items-baseline justify-between">
                  <label htmlFor="rv-comment" className="text-sm leading-ui font-semibold text-fg">
                    {ar.rating.comment}
                  </label>
                  <span
                    dir="ltr"
                    className={`tabular text-xs leading-ui ${comment.length > COMMENT_MAX ? 'text-danger' : 'text-muted'}`}
                    aria-live="polite"
                  >
                    {comment.length}/{COMMENT_MAX}
                  </span>
                </div>
                <textarea
                  id="rv-comment"
                  rows={3}
                  placeholder={ar.rating.commentPlaceholder}
                  className={`${field} resize-none leading-ar`}
                  aria-invalid={formState.errors.comment ? true : undefined}
                  aria-describedby={formState.errors.comment ? 'rv-comment-err' : undefined}
                  {...register('comment')}
                />
                {formState.errors.comment && (
                  <p id="rv-comment-err" role="alert" className="text-sm leading-ui text-danger">
                    {formState.errors.comment.message}
                  </p>
                )}
              </div>

              {/* Honeypot: invisible to people, tempting to bots. */}
              <div aria-hidden="true" className="absolute -z-10 h-px w-px overflow-hidden opacity-0">
                <label htmlFor="rv-website">website</label>
                <input id="rv-website" tabIndex={-1} autoComplete="off" {...register('website')} />
              </div>

              <Controller
                control={control}
                name="turnstileToken"
                render={({ field: f }) => <TurnstileField onToken={(t) => f.onChange(t)} />}
              />

              {formError && (
                <p role="alert" className="rounded-[14px] bg-danger/10 px-4 py-3 text-sm leading-ui text-danger" data-form-error>
                  {formError}
                </p>
              )}

              <button
                type="submit"
                disabled={pending}
                className="flex min-h-13 items-center justify-center gap-2 rounded-full bg-accent px-6 text-base leading-ui font-semibold text-canvas shadow-glow transition-[scale,background-color] duration-180 hover:bg-accent-hi active:scale-[0.97] disabled:opacity-70"
              >
                {pending && <LoaderCircle size={20} strokeWidth={2} className="animate-spin" aria-hidden="true" />}
                {pending ? ar.rating.submitting : ar.rating.submit}
              </button>
            </m.form>
          )}
        </AnimatePresence>
      </m.div>
    </div>
  );
}

/** Rating sheet (lazy-loaded): bottom sheet on mobile, dialog on desktop, portaled above the item modal. */
export default function RatingSheet(props: RatingSheetProps & { open: boolean }) {
  const { open, ...rest } = props;
  if (typeof document === 'undefined') return null;
  return createPortal(
    <MotionProvider>
      <AnimatePresence>{open && <Sheet key="sheet" {...rest} />}</AnimatePresence>
    </MotionProvider>,
    document.body,
  );
}
