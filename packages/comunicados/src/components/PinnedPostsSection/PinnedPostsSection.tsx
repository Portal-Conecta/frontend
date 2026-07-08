"use client";

import type { MouseEvent, PointerEvent } from "react";
import type {
  AnnouncementDetail,
  AnnouncementSummary,
} from "../../types/announcement";

import { useRef } from "react";

import { Text } from "@portal/ui";

import { AnnouncementCard } from "../AnnouncementCard";
import styles from "./PinnedPostsSection.module.css";

export interface PinnedPostsSectionProps {
  posts: AnnouncementDetail[];
}

type DragState = {
  active: boolean;
  moved: boolean;
  startX: number;
  scrollLeft: number;
};

function getPinnedOrder(post: AnnouncementDetail): number {
  return post.announcement.pinnedOrder ?? Number.MAX_SAFE_INTEGER;
}

function getPostTime(post: AnnouncementDetail): number {
  const date =
    post.announcement.publishedAt ??
    post.announcement.scheduledFor ??
    post.announcement.createdAt;
  const timestamp = Date.parse(date);

  return Number.isNaN(timestamp) ? 0 : timestamp;
}

function toAnnouncementSummary(post: AnnouncementDetail): AnnouncementSummary {
  const tagNames = post.tags.map((tag) => tag.tagName);

  const summary: AnnouncementSummary = {
    id: post.announcement.id,
    title: post.announcement.title,
    description: post.announcement.description,
    origin: post.announcement.origin,
    status: post.announcement.status,
    pinned: post.announcement.pinned,
    pinnedOrder: post.announcement.pinnedOrder,
    scheduledFor: post.announcement.scheduledFor,
    publishedAt: post.announcement.publishedAt,
    createdAt: post.announcement.createdAt,
  };

  if (tagNames.length > 0) {
    summary.tags = tagNames;
  }

  return summary;
}

export function PinnedPostsSection({ posts }: PinnedPostsSectionProps) {
  const scrollerDraggingClass = styles.scrollerDragging ?? "";
  const scrollerRef = useRef<HTMLUListElement>(null);
  const dragRef = useRef<DragState>({
    active: false,
    moved: false,
    startX: 0,
    scrollLeft: 0,
  });

  const pinnedPosts = posts
    .filter((post) => post.announcement.pinned)
    .sort(
      (a, b) =>
        getPinnedOrder(a) - getPinnedOrder(b) ||
        getPostTime(b) - getPostTime(a),
    );

  if (pinnedPosts.length === 0) return null;

  function handlePointerDown(event: PointerEvent<HTMLUListElement>) {
    const scroller = scrollerRef.current;
    if (!scroller) return;

    dragRef.current = {
      active: true,
      moved: false,
      startX: event.clientX,
      scrollLeft: scroller.scrollLeft,
    };

    if (scrollerDraggingClass) {
      scroller.classList.add(scrollerDraggingClass);
    }
    scroller.setPointerCapture(event.pointerId);
  }

  function handlePointerMove(event: PointerEvent<HTMLUListElement>) {
    const scroller = scrollerRef.current;
    const drag = dragRef.current;

    if (!scroller || !drag.active) return;

    const distance = event.clientX - drag.startX;

    if (Math.abs(distance) > 4) {
      drag.moved = true;
    }

    scroller.scrollLeft = drag.scrollLeft - distance;
  }

  function handlePointerUp(event: PointerEvent<HTMLUListElement>) {
    const scroller = scrollerRef.current;
    dragRef.current.active = false;

    if (!scroller) return;

    if (scrollerDraggingClass) {
      scroller.classList.remove(scrollerDraggingClass);
    }

    if (scroller.hasPointerCapture(event.pointerId)) {
      scroller.releasePointerCapture(event.pointerId);
    }
  }

  function handleClickCapture(event: MouseEvent<HTMLUListElement>) {
    if (!dragRef.current.moved) return;

    event.preventDefault();
    event.stopPropagation();
    dragRef.current.moved = false;
  }

  return (
    <section
      aria-labelledby="pinned-posts-title"
      className="w-full overflow-hidden"
    >
      <Text
        id="pinned-posts-title"
        as="h2"
        variant="body-xl-emphasis"
        tone="brand"
      >
        Fixados
      </Text>

      <ul
        ref={scrollerRef}
        className={`${styles.scroller} mt-4 flex gap-4 overflow-x-auto pb-2`}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
        onClickCapture={handleClickCapture}
      >
        {pinnedPosts.map((post) => (
          <li key={post.announcement.id} className="w-96 shrink-0">
            <AnnouncementCard
              announcement={toAnnouncementSummary(post)}
              highlighted
            />
          </li>
        ))}
      </ul>
    </section>
  );
}
