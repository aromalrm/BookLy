"use client";

import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { SpineImage } from "@/components/SpineImage";
import {
  coverInset,
  damp,
  facing,
  mod,
  trackOffset,
  wrapDelta,
} from "@/lib/shelf-motion";
import styles from "./bookshelf.module.css";

export type ShelfBook = {
  id: string;
  title: string;
  authors: string;
  spine: string;
  authorShort: string;
  coverUrl: string | null;
  bg: string;
  fg: string;
  band: string;
  aspect: number;
  label: string;
  meta: string;
};

type Props = {
  books: ShelfBook[];
  focusId?: string | null;
  emptyTitle: string;
  emptyBody: string;
  onOpenChange?: (open: boolean) => void;
  renderBook: (bookId: string, close: () => void) => React.ReactNode;
};

type Motion = {
  position: number;
  target: number;
  dragging: boolean;
  down: boolean;
  moved: boolean;
  pointerX: number;
  pointerY: number;
  cursorX: number;
  cursorY: number;
  tiltX: number;
  tiltY: number;
  hoverSlot: number;
  over: boolean;
  open: boolean;
  closing: boolean;
  animateOpen: boolean;
  hinge: number;
  hinging: boolean;
  holdHinge: boolean;
  openAfterTurn: boolean;
  reduce: boolean;
  lastStamp: number;
  settle: number;
  dragOrigin: number;
  dragX: number;
  cursorMode: string;
  activeId: string;
  loop: boolean;
};

type FaceCache = {
  spine: HTMLElement | null;
  cover: HTMLElement | null;
  lift: number;
};

function classNames(...parts: Array<string | false | null | undefined>): string {
  return parts.filter(Boolean).join(" ");
}

/**
 * The only shelf-motion component. Books stand in one row. Wheel, drag,
 * and the arrow keys slide that row. Clicking a spine turns that book
 * until its cover faces the reader. Clicking the top of the facing
 * cover tips it, then unfolds the page. A side spine lifts on hover.
 */
export function Bookshelf({
  books,
  focusId,
  emptyTitle,
  emptyBody,
  onOpenChange,
  renderBook,
}: Props) {
  const booksRef = useRef(books);
  booksRef.current = books;
  const shelfRef = useRef<HTMLDivElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const cursorRef = useRef<HTMLDivElement>(null);
  const sheetRef = useRef<HTMLDivElement>(null);
  const hitRef = useRef<HTMLDivElement>(null);
  const aspects = useRef(new Map<string, number>());
  const faces = useRef(new WeakMap<HTMLElement, FaceCache>());
  const motion = useRef<Motion>({
    position: 0,
    target: 0,
    dragging: false,
    down: false,
    moved: false,
    pointerX: -1,
    pointerY: -1,
    cursorX: -1,
    cursorY: -1,
    tiltX: 0,
    tiltY: 0,
    hoverSlot: -1,
    over: false,
    open: false,
    closing: false,
    animateOpen: false,
    hinge: 0,
    hinging: false,
    holdHinge: false,
    openAfterTurn: false,
    reduce: false,
    lastStamp: 0,
    settle: 0,
    dragOrigin: 0,
    dragX: 0,
    cursorMode: "",
    activeId: "",
    loop: false,
  });

  const [looping, setLooping] = useState(false);
  const [shownId, setShownId] = useState<string | null>(null);
  const [openTick, setOpenTick] = useState(0);
  const [centeredId, setCenteredId] = useState<string | null>(books[0]?.id ?? null);
  const [failedCovers, setFailedCovers] = useState<ReadonlySet<string>>(new Set());
  const drawRef = useRef<(now: number) => void>(() => {});
  const signature = books.map((book) => book.id).join("|");
  const lastSignature = useRef("");
  const lastFocus = useRef<string | null>(null);

  const slots = useMemo(() => {
    if (books.length === 0) return [];
    const copies = books.length > 1 && looping ? 3 : 1;
    return Array.from({ length: books.length * copies }, (_, slot) => {
      const book = books[slot % books.length];
      return { slot, book };
    });
  }, [books, looping]);

  const rememberAspect = useCallback((id: string, image: HTMLImageElement) => {
    const ratio = image.naturalWidth / image.naturalHeight;
    if (ratio > 0.4 && ratio < 1.15) aspects.current.set(id, ratio);
  }, []);

  const hideCover = useCallback((id: string) => {
    setFailedCovers((current) => {
      if (current.has(id)) return current;
      const next = new Set(current);
      next.add(id);
      return next;
    });
  }, []);

  const measureFront = useCallback(() => {
    const stage = stageRef.current;
    const list = booksRef.current;
    if (!stage || list.length === 0) return null;
    const nodes = stage.querySelectorAll<HTMLElement>("[data-slot]");
    const length = nodes.length;
    let best: HTMLElement | null = null;
    let bestDistance = Infinity;
    const state = motion.current;
    nodes.forEach((node) => {
      const slot = Number(node.dataset.slot);
      const delta = state.loop
        ? wrapDelta(slot, state.position, length)
        : slot - state.position;
      const distance = Math.abs(delta);
      if (distance < bestDistance) {
        bestDistance = distance;
        best = node;
      }
    });
    const cover = (best as HTMLElement | null)?.querySelector<HTMLElement>("[data-face=cover]");
    if (!cover) {
      const stageBox = stage.getBoundingClientRect();
      return new DOMRect(stageBox.left - 80, stageBox.top - 120, 160, 240);
    }
    return cover.getBoundingClientRect();
  }, []);

  const closeSheet = useCallback(() => {
    const state = motion.current;
    const sheet = sheetRef.current;
    if (!state.open || state.closing || !sheet) return;
    state.closing = true;
    const finish = () => {
      sheet.style.visibility = "hidden";
      sheet.style.transform = "";
      sheet.style.clipPath = "";
      state.open = false;
      state.closing = false;
      state.holdHinge = false;
      state.hinge = 0;
      state.hinging = false;
      setShownId(null);
      onOpenChange?.(false);
    };
    if (state.reduce) {
      finish();
      return;
    }
    const rect = measureFront();
    sheet.getAnimations().forEach((animation) => animation.cancel());
    if (rect) {
      sheet.style.transformOrigin = `${rect.left + rect.width / 2}px ${rect.top + rect.height / 2}px`;
    }
    const animation = sheet.animate(
      [
        { clipPath: "inset(0px 0px 0px 0px round 0px)", transform: "rotate(0deg)", opacity: 1 },
        { opacity: 1, offset: 0.55 },
        {
          clipPath: rect ? coverInset(rect, window.innerWidth, window.innerHeight) : "inset(40% 40% 40% 40% round 3px)",
          transform: "rotate(-4.5deg)",
          opacity: 0,
        },
      ],
      { duration: 780, easing: "cubic-bezier(.22,1,.36,1)", fill: "both" },
    );
    animation.onfinish = finish;
  }, [measureFront, onOpenChange]);

  const openSheet = useCallback(() => {
    const state = motion.current;
    if (state.open || state.closing || !state.activeId) return;
    state.hinging = false;
    state.openAfterTurn = false;
    state.holdHinge = true;
    state.hinge = 1;
    state.target = Math.round(state.target);
    state.position = state.target;
    drawRef.current(performance.now());
    state.open = true;
    state.animateOpen = true;
    setShownId(state.activeId);
    setOpenTick((tick) => tick + 1);
    onOpenChange?.(true);
  }, [onOpenChange]);

  useLayoutEffect(() => {
    const state = motion.current;
    const list = booksRef.current;
    const count = list.length;
    if (count === 0) return;
    const focusChanged = focusId !== lastFocus.current;
    lastFocus.current = focusId ?? null;
    const signatureChanged = signature !== lastSignature.current;
    lastSignature.current = signature;
    const base = state.loop && count > 1 ? count : 0;
    let index = 0;
    if (focusChanged && focusId) {
      const found = list.findIndex((book) => book.id === focusId);
      if (found >= 0) index = found;
    } else if (!signatureChanged) {
      return;
    }
    state.position = base + index;
    state.target = base + index;
    state.activeId = list[index]?.id ?? "";
    setCenteredId(state.activeId || null);
  }, [signature, focusId]);

  useLayoutEffect(() => {
    const state = motion.current;
    const sheet = sheetRef.current;
    if (!shownId || !sheet || !state.animateOpen) return;
    state.animateOpen = false;
    const rect = measureFront();
    sheet.style.visibility = "visible";
    sheet.scrollTop = 0;
    if (state.reduce || !rect) {
      sheet.style.clipPath = "none";
      sheet.style.transform = "none";
      return;
    }
    sheet.style.transformOrigin = `${rect.left + rect.width / 2}px ${rect.top + rect.height / 2}px`;
    sheet.getAnimations().forEach((animation) => animation.cancel());
    const animation = sheet.animate(
      [
        {
          clipPath: coverInset(rect, window.innerWidth, window.innerHeight),
          transform: "rotate(-8deg)",
        },
        {
          clipPath: coverInset(rect, window.innerWidth, window.innerHeight),
          transform: "rotate(-6deg)",
          offset: 0.18,
        },
        { clipPath: "inset(0px 0px 0px 0px round 0px)", transform: "rotate(0deg)" },
      ],
      { duration: 1080, easing: "cubic-bezier(.7,0,.18,1)", fill: "both" },
    );
    animation.onfinish = () => {
      sheet.style.clipPath = "";
      sheet.style.transform = "";
    };
    sheet.querySelector<HTMLElement>("[data-close]")?.focus({ preventScroll: true });
  }, [shownId, openTick, measureFront]);

  useEffect(() => {
    if (!shownId) return;
    const previous = document.documentElement.style.overflow;
    document.documentElement.style.overflow = "hidden";
    return () => {
      document.documentElement.style.overflow = previous;
    };
  }, [shownId]);

  useEffect(() => {
    if (books.length === 0) return;
    const shelf = shelfRef.current;
    const stage = stageRef.current;
    const cursor = cursorRef.current;
    if (!shelf || !stage || !cursor) return;
    const state = motion.current;
    state.reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const blocked = () => document.querySelector("[data-block-shelf]") !== null;

    const draw = (now: number) => {
      if (state.open || state.closing) {
        if (state.cursorMode) {
          state.cursorMode = "";
          cursor.className = styles.cursor;
        }
        return;
      }
      const list = booksRef.current;
      const count = list.length;
      const bounds = shelf.getBoundingClientRect();
      if (count === 0 || bounds.width < 20 || bounds.height < 20) return;
      const dt = Math.min(0.05, state.lastStamp ? (now - state.lastStamp) / 1000 : 0.016);
      state.lastStamp = now;
      const narrow = bounds.width < 760;
      const available = Math.max(96, bounds.height - 28);
      const byWidth = bounds.width * (narrow ? 0.62 : 0.3);
      const bookH = Math.max(110, Math.min(available, byWidth, 460));
      const spine = bookH * 0.15;
      const gap = bookH * 0.03;
      stage.style.setProperty("--book-h", `${bookH}px`);
      stage.style.setProperty("--spine-w", `${spine}px`);
      shelf.style.setProperty("--book-h", `${bookH}px`);

      const widths = list.map(
        (book) => bookH * (aspects.current.get(book.id) ?? book.aspect),
      );
      const front = mod(Math.round(state.target), count);
      const coverWidth = widths[front] ?? bookH * 0.67;
      const rowWidth = count * (spine + gap) + Math.max(0, coverWidth - spine);
      const shouldLoop = count > 1 && rowWidth > bounds.width * 1.02;
      if (shouldLoop !== state.loop) {
        const index = mod(Math.round(state.position), count);
        state.loop = shouldLoop;
        state.position = (shouldLoop ? count : 0) + index;
        state.target = (shouldLoop ? count : 0) + (shouldLoop ? index : Math.max(0, Math.min(count - 1, index)));
        setLooping(shouldLoop);
        return;
      }

      if (!state.loop) {
        state.target = Math.max(0, Math.min(count - 1, state.target));
      }
      const span = count * (state.loop ? 3 : 1);
      state.position = state.reduce
        ? state.target
        : damp(state.position, state.target, dt, state.dragging ? 18 : 5.2);
      if (state.loop && (state.position > span * 4 || state.position < -span * 4)) {
        const shift = Math.trunc(state.position / span) * span;
        state.position -= shift;
        state.target -= shift;
        state.dragOrigin -= shift;
      }

      const turned = Math.abs(state.target - state.position) < 0.035 && !state.dragging;
      if (state.openAfterTurn && turned) {
        state.openAfterTurn = false;
        state.hinging = true;
      }
      const hingeTarget = state.hinging || state.holdHinge ? 1 : 0;
      state.hinge = state.reduce ? hingeTarget : damp(state.hinge, hingeTarget, dt, 6.5);
      let hingeDone = false;
      if (state.hinging && state.hinge > 0.96 && turned) {
        state.hinging = false;
        state.hinge = 1;
        state.holdHinge = true;
        hingeDone = true;
      }

      const nodes = stage.querySelectorAll<HTMLElement>("[data-slot]");
      if (nodes.length !== span) return;
      const nearest: { node: HTMLElement | null; delta: number } = { node: null, delta: Infinity };

      const activeIndex = mod(Math.round(state.position), count);
      const active = list[activeIndex];
      if (active && active.id !== state.activeId) {
        state.activeId = active.id;
        setCenteredId(active.id);
      }

      const centerX = bounds.left + bounds.width / 2;
      const centerY = bounds.top + bounds.height / 2;
      const settled = Math.abs(state.target - state.position) < 0.3;
      const coverTop = centerY - bookH / 2;
      const onCover =
        state.over &&
        !state.open &&
        settled &&
        Math.abs(state.pointerX - centerX) < coverWidth * 0.55 &&
        Math.abs(state.pointerY - centerY) < bookH * 0.55;
      const onOpenEdge =
        onCover && state.pointerY <= coverTop + bookH * 0.32 && state.pointerY >= coverTop - 10;
      const yawTarget = onCover
        ? ((state.pointerX - centerX) / (coverWidth * 0.55)) * 9
        : state.over
          ? ((state.pointerX - centerX) / bounds.width) * 5
          : 0;
      const pitchTarget = onCover
        ? (-(state.pointerY - centerY) / (bookH / 2)) * 6
        : 0;
      const tiltEase = 1 - Math.exp(-7 * dt);
      state.tiltY += (yawTarget - state.tiltY) * (state.reduce ? 1 : tiltEase);
      state.tiltX += (pitchTarget - state.tiltX) * (state.reduce ? 1 : tiltEase);
      const liftEase = state.reduce ? 1 : 1 - Math.exp(-12 * dt);
      const limit = bounds.width / 2 + coverWidth * 1.5;

      nodes.forEach((node) => {
        const slot = Number(node.dataset.slot);
        const bookIndex = slot % count;
        const depth = widths[bookIndex] ?? bookH * 0.67;
        node.style.setProperty("--depth", `${depth}px`);
        const delta = state.loop ? wrapDelta(slot, state.position, span) : slot - state.position;
        if (Math.abs(delta) < nearest.delta) {
          nearest.delta = Math.abs(delta);
          nearest.node = node;
        }
        const x = trackOffset(delta, spine, gap, coverWidth);
        let cache = faces.current.get(node);
        if (!cache) {
          cache = {
            spine: node.querySelector<HTMLElement>("[data-face=spine]"),
            cover: node.querySelector<HTMLElement>("[data-face=cover]"),
            lift: 0,
          };
          faces.current.set(node, cache);
        }
        const wantLift = state.hoverSlot === slot && Math.abs(delta) > 0.5 && !state.open;
        cache.lift += ((wantLift ? 1 : 0) - cache.lift) * liftEase;
        if (Math.abs(x) > limit) {
          node.style.visibility = "hidden";
          return;
        }
        node.style.visibility = "";
        const frontAmount = facing(delta);
        const opening = frontAmount * state.hinge;
        const y = -bookH * (0.025 * frontAmount + 0.045 * cache.lift + 0.045 * opening);
        const z = bookH * (0.2 * frontAmount + 0.08 * opening);
        node.style.transform = `perspective(2200px) translate3d(${x}px, ${y}px, ${z}px) rotateZ(${-4.5 * frontAmount}deg) rotateX(${state.tiltX * frontAmount - 14 * opening}deg) rotateY(${-90 * frontAmount + state.tiltY * frontAmount}deg)`;
        node.style.zIndex = String(Math.round(100 - Math.abs(delta) * 4));
        cache.spine?.style.setProperty("--shade", (0.55 * frontAmount).toFixed(3));
        cache.cover?.style.setProperty("--shade", ((1 - frontAmount) * 0.5).toFixed(3));
      });

      const hit = hitRef.current;
      if (hit) {
        const cover = nearest.node?.querySelector<HTMLElement>("[data-face=cover]");
        const rect = cover?.getBoundingClientRect();
        const host = shelf.getBoundingClientRect();
        if (rect && nearest.delta < 0.45 && rect.width > 30) {
          hit.hidden = false;
          hit.style.left = `${rect.left - host.left}px`;
          hit.style.top = `${rect.top - host.top}px`;
          hit.style.width = `${rect.width}px`;
          hit.style.height = `${rect.height}px`;
        } else {
          hit.hidden = true;
        }
      }

      if (!stage.classList.contains(styles.ready)) stage.classList.add(styles.ready);
      shelf.dataset.ready = "true";

      const follow = 1 - Math.exp(-16 * dt);
      if (state.cursorX < 0) {
        state.cursorX = state.pointerX;
        state.cursorY = state.pointerY;
      }
      state.cursorX += (state.pointerX - state.cursorX) * follow;
      state.cursorY += (state.pointerY - state.cursorY) * follow;
      cursor.style.transform = `translate3d(${state.cursorX}px, ${state.cursorY}px, 0)`;
      let mode = state.over && !state.open ? "on" : "";
      if (mode && onOpenEdge) mode = "open";
      else if (
        mode &&
        state.hoverSlot >= 0 &&
        Math.abs(
          state.loop
            ? wrapDelta(state.hoverSlot, state.position, span)
            : state.hoverSlot - state.position,
        ) > 0.5
      ) {
        mode = "hot";
      }
      if (hingeDone) queueMicrotask(() => openSheet());

      if (mode !== state.cursorMode) {
        state.cursorMode = mode;
        cursor.className = classNames(
          styles.cursor,
          mode === "on" && styles.cursorOn,
          mode === "hot" && styles.cursorOn,
          mode === "hot" && styles.cursorHot,
          mode === "open" && styles.cursorOn,
          mode === "open" && styles.cursorOpen,
        );
      }
    };

    drawRef.current = draw;

    let frame = 0;
    const tick = (now: number) => {
      draw(now);
      frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);

    const onKey = (event: KeyboardEvent) => {
      if (event.metaKey || event.ctrlKey || event.altKey || blocked()) return;
      if (state.open) {
        if (event.key === "Escape") {
          event.preventDefault();
          closeSheet();
        }
        return;
      }
      const focused = document.activeElement;
      if (
        focused instanceof HTMLElement &&
        focused.closest("input, textarea, [contenteditable='true'], [data-block-shelf]")
      ) {
        return;
      }
      if (event.key === "ArrowLeft") {
        state.target = Math.round(state.target) - 1;
        event.preventDefault();
      } else if (event.key === "ArrowRight") {
        state.target = Math.round(state.target) + 1;
        event.preventDefault();
      } else if (event.key === "Enter" && (!focused || focused === document.body)) {
        requestOpen();
      }
    };

    const releaseHinge = () => {
      if (state.open || state.closing) return;
      state.hinging = false;
      state.holdHinge = false;
      state.openAfterTurn = false;
    };

    const requestOpen = () => {
      if (state.open || state.closing || state.hinging || state.holdHinge) return;
      state.target = Math.round(state.position);
      if (state.reduce) {
        openSheet();
        return;
      }
      if (Math.abs(state.target - state.position) < 0.02 && !state.dragging) {
        state.hinging = true;
        return;
      }
      state.openAfterTurn = true;
    };

    const onWheel = (event: WheelEvent) => {
      if (state.open || blocked() || booksRef.current.length < 2) return;
      releaseHinge();
      event.preventDefault();
      const dominant =
        Math.abs(event.deltaX) > Math.abs(event.deltaY) ? event.deltaX : event.deltaY;
      const bookH = Number.parseFloat(stage.style.getPropertyValue("--book-h")) || 180;
      const pitch = bookH * 0.18;
      state.target += (dominant / pitch) * 0.5;
      window.clearTimeout(state.settle);
      state.settle = window.setTimeout(() => {
        state.target = Math.round(state.target);
      }, 160);
    };

    const onPointerDown = (event: PointerEvent) => {
      if (event.button !== 0 || state.open || blocked()) return;
      state.down = true;
      state.dragging = false;
      state.moved = false;
      state.dragX = event.clientX;
      state.dragOrigin = state.target;
    };
    const onPointerMove = (event: PointerEvent) => {
      state.pointerX = event.clientX;
      state.pointerY = event.clientY;
      if (state.cursorX < 0) {
        state.cursorX = event.clientX;
        state.cursorY = event.clientY;
      }
      if (!state.down) return;
      const delta = event.clientX - state.dragX;
      if (!state.dragging && Math.abs(delta) > 5) {
        state.dragging = true;
        state.moved = true;
        releaseHinge();
      }
      if (!state.dragging) return;
      const bookH = Number.parseFloat(stage.style.getPropertyValue("--book-h")) || 180;
      state.target = state.dragOrigin - delta / (bookH * 0.18);
    };
    const onPointerUp = () => {
      if (state.dragging) state.target = Math.round(state.target);
      state.dragging = false;
      state.down = false;
      window.setTimeout(() => {
        state.moved = false;
      }, 0);
    };
    const onClick = (event: MouseEvent) => {
      if (state.moved || state.open || blocked()) return;
      const target = event.target as HTMLElement | null;
      if (target?.closest("[data-front-hit]")) {
        if (target.closest("[data-open-edge]")) requestOpen();
        return;
      }
      const slotNode = target?.closest<HTMLElement>("[data-slot]");
      if (!slotNode) return;
      const slot = Number(slotNode.dataset.slot);
      const length = stage.querySelectorAll("[data-slot]").length;
      const delta = state.loop ? wrapDelta(slot, state.position, length) : slot - state.position;
      const centered = Math.abs(delta) < 0.35;
      const settled = Math.abs(state.target - state.position) < 0.12;
      const openingTop = (event.target as HTMLElement | null)?.closest("[data-open-edge]");
      if (openingTop && centered && settled) {
        requestOpen();
        return;
      }
      releaseHinge();
      if (!centered) state.target = Math.round(state.position + delta);
    };
    const onOver = (event: PointerEvent) => {
      const slotNode = (event.target as HTMLElement | null)?.closest<HTMLElement>("[data-slot]");
      state.hoverSlot = slotNode ? Number(slotNode.dataset.slot) : -1;
    };
    const onEnter = (event: PointerEvent) => {
      if (event.pointerType !== "touch") state.over = true;
    };
    const onLeave = () => {
      state.over = false;
      state.hoverSlot = -1;
    };

    window.addEventListener("keydown", onKey);
    shelf.addEventListener("wheel", onWheel, { passive: false });
    shelf.addEventListener("pointerdown", onPointerDown);
    shelf.addEventListener("click", onClick);
    shelf.addEventListener("pointerover", onOver);
    shelf.addEventListener("pointerenter", onEnter);
    shelf.addEventListener("pointerleave", onLeave);
    window.addEventListener("pointermove", onPointerMove);
    window.addEventListener("pointerup", onPointerUp);
    window.addEventListener("pointercancel", onPointerUp);

    return () => {
      cancelAnimationFrame(frame);
      window.clearTimeout(state.settle);
      window.removeEventListener("keydown", onKey);
      shelf.removeEventListener("wheel", onWheel);
      shelf.removeEventListener("pointerdown", onPointerDown);
      shelf.removeEventListener("click", onClick);
      shelf.removeEventListener("pointerover", onOver);
      shelf.removeEventListener("pointerenter", onEnter);
      shelf.removeEventListener("pointerleave", onLeave);
      window.removeEventListener("pointermove", onPointerMove);
      window.removeEventListener("pointerup", onPointerUp);
      window.removeEventListener("pointercancel", onPointerUp);
    };
  }, [books.length === 0, closeSheet, openSheet]);

  const step = (direction: number) => {
    const state = motion.current;
    if (state.open) return;
    state.target = Math.round(state.target) + direction;
  };

  return (
    <div className={styles.root}>
      <div className={styles.fit}>
        {books.length === 0 ? (
          <div className={styles.empty} data-testid="empty-shelf">
            <div className={styles.emptyRail} />
            <h2>{emptyTitle}</h2>
            <p>{emptyBody}</p>
          </div>
        ) : (
          <div ref={shelfRef} className={styles.shelf} data-testid="shelf" aria-hidden={shownId ? true : undefined}>
            <div className={styles.floor} />
            <div ref={stageRef} className={styles.stage}>
              {slots.map(({ slot, book }) => (
                <div
                  key={`${book.id}:${slot}`}
                  className={styles.book}
                  data-slot={slot}
                  data-book={book.id}
                  style={
                    {
                      "--bg": book.bg,
                      "--fg": book.fg,
                      "--band": book.band,
                    } as React.CSSProperties
                  }
                >
                  <div className={classNames(styles.face, styles.spine)} data-face="spine">
                    {book.coverUrl && !failedCovers.has(book.id) ? (
                      <SpineImage src={book.coverUrl} onFail={() => hideCover(book.id)} />
                    ) : null}
                    <i className={styles.band}>{book.label}</i>
                    <span className={styles.spineTitle}>{book.spine}</span>
                    <span className={styles.spineAuthor}>{book.authorShort}</span>
                  </div>
                  <div
                    className={classNames(styles.face, styles.cover)}
                    data-face="cover"
                    data-blank={!book.coverUrl || failedCovers.has(book.id) ? "true" : undefined}
                  >
                    {book.coverUrl && !failedCovers.has(book.id) ? (
                      // Covers are remote Open Library images; next/image would require a loader for every size.
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={book.coverUrl}
                        alt=""
                        draggable={false}
                        onLoad={(event) => rememberAspect(book.id, event.currentTarget)}
                        onError={() => hideCover(book.id)}
                      />
                    ) : null}
                    <span className={styles.fallback}>{book.spine}</span>
                  </div>
                </div>
              ))}
            </div>
            <div ref={hitRef} className={styles.frontHit} data-front-hit hidden>
              <button
                type="button"
                className={styles.openEdge}
                data-open-edge=""
                data-testid="open-edge"
                tabIndex={-1}
                aria-label="Open this book"
              />
            </div>
          </div>
        )}
      </div>

      {books.length > 0 ? (
        <div className={styles.dock}>
          <p className={styles.caption} data-testid="book-caption">
            <strong>{(books.find((book) => book.id === centeredId) ?? books[0]).title}</strong>
            <span>{(books.find((book) => book.id === centeredId) ?? books[0]).meta}</span>
          </p>
          <div className={styles.arrows}>
            <button type="button" aria-label="Previous book" onClick={() => step(-1)}>
              <svg viewBox="0 0 18 10" aria-hidden="true">
                <path d="M5 1 L1 5 L5 9 M1 5 H17" />
              </svg>
            </button>
            <button type="button" aria-label="Next book" onClick={() => step(1)}>
              <svg viewBox="0 0 18 10" aria-hidden="true">
                <path d="M13 1 L17 5 L13 9 M17 5 H1" />
              </svg>
            </button>
          </div>
          <p className="srOnly" aria-live="polite">
            {(() => {
              const current = books.find((book) => book.id === centeredId) ?? books[0];
              return current ? `${current.title}, ${current.authors}. ${current.meta}.` : "";
            })()}
          </p>
        </div>
      ) : null}

      <div
        ref={cursorRef}
        className={styles.cursor}
        aria-hidden="true"
      >
        <span className={styles.ring} />
        <span className={styles.dot} />
        <span className={styles.word}>Open</span>
      </div>

      <div
        ref={sheetRef}
        className={styles.sheet}
        role="dialog"
        aria-modal="true"
        aria-hidden={shownId ? undefined : true}
        aria-label="Book"
        data-testid="book-page"
      >
        <button
          type="button"
          className={styles.close}
          data-close=""
          onClick={closeSheet}
        >
          Close
        </button>
        <p className={styles.mark}>BookLy</p>
        {shownId ? renderBook(shownId, closeSheet) : null}
      </div>
    </div>
  );
}
