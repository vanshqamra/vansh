"use client";
import NextImage, { ImageProps } from "next/image";

/**
 * ImageSafe wraps next/image and forces `unoptimized` by default for remote images.
 * This avoids runtime optimizer issues on hosts like Heroku while keeping Next’s layout behavior.
 * You can still override with explicit `unoptimized={false}` if you want.
 */
export default function ImageSafe(props: ImageProps) {
  // If caller passed unoptimized explicitly, respect it; else default to true.
  const final = props.unoptimized === undefined ? true : props.unoptimized;
  return <NextImage {...props} unoptimized={final} />;
}
