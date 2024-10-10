// NIRAX --- A lightweight router

import { EventEmitter } from "eventemitter3";
import { Component, onMounted, shallowRef, ShallowRef, ref, Ref } from "vue";
import { safeURIDecode } from "@/scripts/safe-uri-decode";
import { $i } from "@/account";

type RouteDef = {
	path: string;
	component: Component;
	query?: Record<string, string>;
	loginRequired?: boolean;
	redirect?: (path: string) => string | undefined;
	name?: string;
	hash?: string;
	globalCacheKey?: string;
	children?: RouteDef[];
};

type ParsedPath = (
	| string
	| {
			name: string;
			startsWith?: string;
			wildcard?: boolean;
			optional?: boolean;
	  }
)[];

export type Resolved = {
	route: RouteDef;
	props: Map<string, string>;
	child?: Resolved;
};

function parsePath(path: string): ParsedPath {
	const res = [] as ParsedPath;

	path = path.substring(1);

	for (const part of path.split("/")) {
		if (part.includes(":")) {
			const prefix = part.substring(0, part.indexOf(":"));
			const placeholder = part.substring(part.indexOf(":") + 1);
			const wildcard = placeholder.includes("(*)");
			const optional = placeholder.endsWith("?");
			res.push({
				name: placeholder.replace("(*)", "").replace("?", ""),
				startsWith: prefix !== "" ? prefix : undefined,
				wildcard,
				optional,
			});
		} else if (part.length !== 0) {
			res.push(part);
		}
	}

	return res;
}

export class Router extends EventEmitter<{
	change: (ctx: {
		beforePath: string;
		path: string;
		resolved: Resolved;
		key: string;
	}) => void;
	replace: (ctx: {
		path: string;
		key: string;
	}) => void;
	push: (ctx: {
		beforePath: string;
		path: string;
		route: RouteDef | null;
		props: Map<string, string> | null;
		key: string;
	}) => void;
	same: () => void;
}> {
	private routes: RouteDef[];
	public current: Resolved;
	public currentRef: ShallowRef<Resolved> = shallowRef();
	public currentRoute: ShallowRef<RouteDef> = shallowRef();
	private currentPath: Ref<string> = ref("");
	private currentKey = Date.now().toString();

	public navHook: ((path: string, flag?: any) => boolean) | null = null;

	constructor(routes: Router["routes"], currentPath: string) {
		super();

		this.routes = routes;
		this.currentPath.value = currentPath;
		this.navigate(currentPath, null, false);
	}

	public geFullPathFromResolved(resolved: Resolved, path?: string): string {
		let fullPath = (path ?? "") + resolved.route.path;
		if (resolved.child) {
			fullPath = fullPath + this.geFullPathFromResolved(resolved.child);
		}
		return fullPath;
	}

	public resolve(path: string | null | undefined): Resolved | null {
		if (path === undefined) return null;

		let queryString: string | null = null;
		let hash: string | null = null;
		let resolvePath = path;
		if (resolvePath !== null && resolvePath !== "") {
			if (resolvePath.length > 0 && resolvePath[0] === "/")
				resolvePath = resolvePath.substring(1);
			if (resolvePath.includes("#")) {
				hash = resolvePath.substring(resolvePath.indexOf("#") + 1);
				resolvePath = resolvePath.substring(0, resolvePath.indexOf("#"));
			}
			if (resolvePath.includes("?")) {
				queryString = resolvePath.substring(resolvePath.indexOf("?") + 1);
				resolvePath = resolvePath.substring(0, resolvePath.indexOf("?"));
			}
		}

		if (_DEV_) console.log("Routing: ", resolvePath, queryString);

		function check(routes: RouteDef[], _parts: string[]): Resolved | null {
			forEachRouteLoop: for (const route of routes) {
				let parts = [..._parts];
				const props = new Map<string, string>();

				pathMatchLoop: for (const p of parsePath(route.path)) {
					if (typeof p === "string") {
						if (p === parts[0]) {
							parts.shift();
						} else {
							continue forEachRouteLoop;
						}
					} else {
						if (parts[0] == null && !p.optional) {
							continue forEachRouteLoop;
						}
						if (p.wildcard) {
							if (parts.length !== 0) {
								props.set(p.name, safeURIDecode(parts.join("/")));
								parts = [];
							}
							break pathMatchLoop;
						} else {
							if (p.startsWith) {
								if (parts[0] == null || !parts[0].startsWith(p.startsWith))
									continue forEachRouteLoop;

								props.set(
									p.name,
									safeURIDecode(parts[0].substring(p.startsWith.length)),
								);
								parts.shift();
							} else {
								if (parts[0]) {
									props.set(p.name, safeURIDecode(parts[0]));
								}
								parts.shift();
							}
						}
					}
				}

				if (parts.length === 0) {
					if (route.children) {
						const child = check(route.children, []);
						if (child) {
							return {
								route,
								props,
								child,
							};
						} else {
							continue forEachRouteLoop;
						}
					}

					if (route.hash != null && hash != null) {
						props.set(route.hash, safeURIDecode(hash));
					}

					if (route.query != null && queryString != null) {
						const queryObject = [
							...new URLSearchParams(queryString).entries(),
						].reduce((obj, entry) => ({ ...obj, [entry[0]]: entry[1] }), {});

						for (const q in route.query) {
							const as = route.query[q];
							if (queryObject[q]) {
								props.set(as, safeURIDecode(queryObject[q]));
							}
						}
					}

					return {
						route,
						props,
					};
				} else {
					if (route.children) {
						const child = check(route.children, parts);
						if (child) {
							return {
								route,
								props,
								child,
							};
						} else {
							continue forEachRouteLoop;
						}
					} else {
						continue forEachRouteLoop;
					}
				}
			}

			return null;
		}

		const _parts = resolvePath.split("/").filter((part) => part.length !== 0);

		return check(this.routes, _parts);
	}

	private navigate(
		path: string,
		key: string | null | undefined,
		emitChange = true,
	) {
		const beforePath = this.currentPath.value;
		this.currentPath.value = path;

		const res = this.resolve(this.currentPath.value);

		if (res == null) {
			throw new Error("no route found for: " + path);
		}

		if (res.child?.route.redirect) {
			const redirectUrl = res.child.route.redirect(this.currentPath.value);
			if (redirectUrl) {
				location.href = redirectUrl;
				return;
			}
		}

		if (res.route.redirect) {
			const redirectUrl = res.route.redirect(this.currentPath.value);
			if (redirectUrl) {
				location.href = redirectUrl;
				return;
			}
		}

		if (res.route.loginRequired) {
			if (!$i) {
				location.href = "/";
				return;
			}
		}

		const isSamePath = beforePath === path;
		if (isSamePath && key == null) key = this.currentKey;
		this.current = res;
		this.currentRef.value = res;
		this.currentRoute.value = res.route;
		this.currentKey = res.route.globalCacheKey ?? key ?? path;

		if (emitChange) {
			this.emit("change", {
				beforePath,
				path,
				resolved: res,
				key: this.currentKey,
			});
		}

		return res;
	}

	public getCurrentPath() {
		return this.currentPath.value;
	}

	public getCurrentPathRef() {
		return this.currentPath;
	}

	public getCurrentKey() {
		return this.currentKey;
	}

	public push(path: string, flag?: any) {
		const beforePath = this.currentPath.value;
		if (path === beforePath) {
			this.emit("same");
			return;
		}
		if (this.navHook) {
			const cancel = this.navHook(path, flag);
			if (cancel) return;
		}
		const res = this.navigate(path, null);
		this.emit("push", {
			beforePath,
			path,
			route: res.route,
			props: res.props,
			key: this.currentKey,
		});
	}

	public replace(path: string, key?: string | null) {
		this.navigate(path, key);
	}
}

export function useScrollPositionManager(
	getScrollContainer: () => HTMLElement,
	router: Router,
	key?: string,
) {
	const scrollPosStore = new Map<string, number>();

	onMounted(() => {
		const scrollContainer = getScrollContainer();

		scrollContainer.addEventListener(
			"scroll",
			() => {
				scrollPosStore.set(
					key ? key : router.getCurrentKey(),
					scrollContainer.scrollTop,
				);
			},
			{ passive: true },
		);

		router.addListener("change", (ctx) => {
			const scrollPos = scrollPosStore.get(key ? key : ctx.key) ?? 0;
			scrollContainer.scroll({ top: scrollPos, behavior: "instant" });
			if (scrollPos !== 0) {
				window.setTimeout(() => {
					// 遷移直後はタイミングによってはコンポーネントが復元し切ってない可能性も考えられるため少し時間を空けて再度スクロール
					scrollContainer.scroll({ top: scrollPos, behavior: "instant" });
				}, 100);
			}
		});

		router.addListener("same", () => {
			scrollContainer.scroll({ top: 0, behavior: "smooth" });
		});
	});
}
