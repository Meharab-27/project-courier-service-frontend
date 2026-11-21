"use client";

import { IconLayoutNavbarCollapse } from "@tabler/icons-react";
import {
  AnimatePresence,
  type MotionValue,
  motion,
  useMotionValue,
  useSpring,
  useTransform,
} from "motion/react";
import Link from "next/link";
import { type ReactNode, useRef, useState } from "react";
import { cn } from "@/lib/utils";

export interface FloatingDockItem {
  title: string;
  icon: ReactNode;
  href: string;
}

export const FloatingDock = ({
  items,
  desktopClassName,
  mobileClassName,
  tooltipPosition = "top",
  mobileDirection = "top",
}: {
  items: FloatingDockItem[];
  desktopClassName?: string;
  mobileClassName?: string;
  tooltipPosition?: "top" | "bottom";
  mobileDirection?: "top" | "bottom";
}) => {
  return (
    <>
      <FloatingDockDesktop
        items={items}
        className={desktopClassName}
        tooltipPosition={tooltipPosition}
      />
      <FloatingDockMobile
        items={items}
        className={mobileClassName}
        direction={mobileDirection}
      />
    </>
  );
};

const FloatingDockMobile = ({
  items,
  className,
  direction = "top",
}: {
  items: FloatingDockItem[];
  className?: string;
  direction?: "top" | "bottom";
}) => {
  const [open, setOpen] = useState(false);

  return (
    <div className={cn("relative block md:hidden", className)}>
      <AnimatePresence>
        {open && (
          <motion.div
            layoutId="nav"
            className={cn(
              "absolute z-50 flex flex-col gap-2 rounded-2xl border border-border/70 bg-card/95 p-2 shadow-2xl backdrop-blur-md",
              direction === "top"
                ? "inset-x-0 bottom-full mb-2"
                : "right-0 top-full mt-2 min-w-[160px]",
            )}
          >
            {items.map((item, idx) => (
              <motion.div
                key={item.title}
                initial={{ opacity: 0, y: direction === "top" ? 10 : -10 }}
                animate={{
                  opacity: 1,
                  y: 0,
                }}
                exit={{
                  opacity: 0,
                  y: direction === "top" ? 10 : -10,
                  transition: {
                    delay: idx * 0.05,
                  },
                }}
                transition={{ delay: (items.length - 1 - idx) * 0.05 }}
              >
                <Link
                  href={item.href}
                  onClick={() => setOpen(false)}
                  className="flex items-center gap-3 rounded-xl px-3 py-2 text-xs font-medium text-foreground transition-colors hover:bg-muted"
                >
                  <div className="flex size-7 items-center justify-center rounded-lg bg-primary/10 text-primary">
                    <div className="size-4">{item.icon}</div>
                  </div>
                  <span>{item.title}</span>
                </Link>
              </motion.div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="flex size-10 items-center justify-center rounded-full border border-border/70 bg-card/95 text-foreground shadow-sm backdrop-blur-md transition-transform hover:scale-105 active:scale-95"
        aria-label="Toggle Navigation Dock"
      >
        <IconLayoutNavbarCollapse className="size-5 text-muted-foreground" />
      </button>
    </div>
  );
};

const FloatingDockDesktop = ({
  items,
  className,
  tooltipPosition = "top",
}: {
  items: FloatingDockItem[];
  className?: string;
  tooltipPosition?: "top" | "bottom";
}) => {
  const mouseX = useMotionValue(Infinity);

  return (
    <motion.div
      onMouseMove={(e) => mouseX.set(e.pageX)}
      onMouseLeave={() => mouseX.set(Infinity)}
      className={cn(
        "mx-auto hidden h-14 items-center gap-3 rounded-2xl border border-border/70 bg-card/80 px-3 shadow-md backdrop-blur-md md:flex",
        className,
      )}
    >
      {items.map((item) => (
        <IconContainer
          mouseX={mouseX}
          key={item.title}
          tooltipPosition={tooltipPosition}
          {...item}
        />
      ))}
    </motion.div>
  );
};

function IconContainer({
  mouseX,
  title,
  icon,
  href,
  tooltipPosition = "top",
}: {
  mouseX: MotionValue;
  title: string;
  icon: ReactNode;
  href: string;
  tooltipPosition?: "top" | "bottom";
}) {
  const ref = useRef<HTMLDivElement>(null);

  const distance = useTransform(mouseX, (val) => {
    const bounds = ref.current?.getBoundingClientRect() ?? { x: 0, width: 0 };
    return val - bounds.x - bounds.width / 2;
  });

  const widthTransform = useTransform(distance, [-150, 0, 150], [38, 58, 38]);
  const heightTransform = useTransform(distance, [-150, 0, 150], [38, 58, 38]);

  const widthTransformIcon = useTransform(
    distance,
    [-150, 0, 150],
    [18, 30, 18],
  );
  const heightTransformIcon = useTransform(
    distance,
    [-150, 0, 150],
    [18, 30, 18],
  );

  const width = useSpring(widthTransform, {
    mass: 0.1,
    stiffness: 150,
    damping: 12,
  });
  const height = useSpring(heightTransform, {
    mass: 0.1,
    stiffness: 150,
    damping: 12,
  });

  const widthIcon = useSpring(widthTransformIcon, {
    mass: 0.1,
    stiffness: 150,
    damping: 12,
  });
  const heightIcon = useSpring(heightTransformIcon, {
    mass: 0.1,
    stiffness: 150,
    damping: 12,
  });

  const [hovered, setHovered] = useState(false);

  return (
    <Link href={href}>
      <motion.div
        ref={ref}
        style={{ width, height }}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        className="relative flex aspect-square items-center justify-center rounded-full border border-border/50 bg-muted/60 text-foreground transition-colors hover:border-primary/40 hover:bg-primary/10 hover:text-primary dark:bg-muted/40"
      >
        <AnimatePresence>
          {hovered && (
            <motion.div
              initial={{
                opacity: 0,
                y: tooltipPosition === "top" ? 8 : -8,
                x: "-50%",
              }}
              animate={{ opacity: 1, y: 0, x: "-50%" }}
              exit={{
                opacity: 0,
                y: tooltipPosition === "top" ? 4 : -4,
                x: "-50%",
              }}
              className={cn(
                "pointer-events-none absolute left-1/2 z-50 w-fit rounded-lg border border-border/80 bg-popover px-2.5 py-1 text-[11px] font-semibold whitespace-pre text-popover-foreground shadow-lg backdrop-blur-md",
                tooltipPosition === "top" ? "-top-8" : "-bottom-7",
              )}
            >
              {title}
            </motion.div>
          )}
        </AnimatePresence>
        <motion.div
          style={{ width: widthIcon, height: heightIcon }}
          className="flex items-center justify-center"
        >
          {icon}
        </motion.div>
      </motion.div>
    </Link>
  );
}
