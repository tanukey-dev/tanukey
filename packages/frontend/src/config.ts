import { miLocalStorage } from "./local-storage";
import { ref, watch } from "vue";

const address = new URL(location.href);
const siteName = document.querySelector<HTMLMetaElement>(
	'meta[property="og:site_name"]',
)?.content;

export const host = address.host;
export const hostname = address.hostname;
export const url = address.origin;
export const apiUrl = url + "/api";
export const wsUrl =
	url.replace("http://", "ws://").replace("https://", "wss://") + "/streaming";
export const lang = miLocalStorage.getItem("lang") ?? "en-US";
export const langs = _LANGS_;
const preParseLocale = miLocalStorage.getItem("locale");
export let locale = preParseLocale ? JSON.parse(preParseLocale) : null;
export const version = _VERSION_;
export const instanceName = siteName === "Misskey" ? host : siteName;
export const ui = miLocalStorage.getItem("ui");
export const debug = miLocalStorage.getItem("debug") === "true";
export const siteGtagGoogleAnalytics = document.querySelector<HTMLMetaElement>(
	'meta[property="siteGtagGoogleAnalytics"]',
)?.content;
export const siteGtagGoogleAdsConversion =
	document.querySelector<HTMLMetaElement>(
		'meta[property="siteGtagGoogleAdsConversion"]',
	)?.content;

export function updateLocale(newLocale): void {
	locale = newLocale;
}

export const uiMode = ref(miLocalStorage.getItem("ui") ?? "default");
watch(uiMode, (newValue) => {
	miLocalStorage.setItem("ui", newValue);
});
