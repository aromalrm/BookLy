"use client";

import { useState } from "react";
import styles from "./spine-image.module.css";

type Props = {
  src: string | null;
  onFail?: () => void;
};

/** A side view made from the front cover when no separate spine scan exists. */
export function SpineImage({ src, onFail }: Props) {
  const [failed, setFailed] = useState(false);
  if (!src || failed) return null;
  return (
    <>
      {/* Same Open Library file as the front cover, cropped onto the spine edge. */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        className={styles.art}
        src={src}
        alt=""
        draggable={false}
        data-testid="spine-image"
        onError={() => {
          setFailed(true);
          onFail?.();
        }}
      />
      <span className={styles.scrim} aria-hidden="true" />
    </>
  );
}
