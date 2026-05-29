"use client";

import Link from "next/link";
import { hrefForRoute, type Route } from "@/lib/routes";
import {
  IconCompose,
  IconHistory,
  IconMail,
  IconPeople,
} from "./icons";

const MOBILE_NAV_ITEMS = [
  { route: "compose", label: "작성", icon: IconCompose },
  { route: "inbox", label: "받은편지함", icon: IconMail },
  { route: "people", label: "사람", icon: IconPeople },
  { route: "history", label: "히스토리", icon: IconHistory },
] satisfies Array<{
  route: Route;
  label: string;
  icon: (props: { size?: number }) => JSX.Element;
}>;

export function MobileBottomNav({ route }: { route: Route }) {
  return (
    <nav className="mobile-bottom-nav" aria-label="빠른 메뉴">
      {MOBILE_NAV_ITEMS.map((item) => {
        const Icon = item.icon;
        const active = route === item.route;

        return (
          <Link
            key={item.route}
            href={hrefForRoute(item.route)}
            className={"mobile-bottom-nav-item" + (active ? " is-active" : "")}
            aria-current={active ? "page" : undefined}
          >
            <Icon size={16} />
            <span>{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
