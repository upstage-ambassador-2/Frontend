export type Route =
  | "compose"
  | "inbox"
  | "people"
  | "history"
  | "format"
  | "settings";

export type AppRoute = {
  key: Route;
  href: string;
  label: string;
};

export const APP_ROUTES: AppRoute[] = [
  { key: "compose", href: "/compose", label: "작성" },
  { key: "inbox", href: "/inbox", label: "받은편지함" },
  { key: "people", href: "/people", label: "사람" },
  { key: "history", href: "/history", label: "히스토리" },
  { key: "format", href: "/format", label: "내 메일 형식" },
  { key: "settings", href: "/settings", label: "설정" },
];

const ROUTE_BY_PATH = new Map(APP_ROUTES.map((route) => [route.href, route]));

export function routeFromPathname(pathname: string | null): Route {
  if (!pathname) return "compose";
  return ROUTE_BY_PATH.get(pathname)?.key ?? "compose";
}

export function hrefForRoute(route: Route): string {
  return APP_ROUTES.find((item) => item.key === route)?.href ?? "/compose";
}

export function labelForRoute(route: Route): string {
  return APP_ROUTES.find((item) => item.key === route)?.label ?? "작성";
}
