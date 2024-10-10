import * as os from "@/os";
import { instance } from "@/instance";
import { host } from "@/config";
import { i18n } from "@/i18n";
import { $i } from "@/account";

export function openInstanceMenu(ev: MouseEvent) {
	os.popupMenu(
		[
			{
				text: instance.name ?? host,
				type: "label",
			},
			{
				type: "link",
				text: i18n.ts.instanceInfo,
				icon: "ti ti-info-circle",
				to: "/secure/about",
			},
			{
				type: "link",
				text: i18n.ts.customEmojis,
				icon: "ti ti-icons",
				to: "/secure/about#emojis",
			},
			{
				type: "link",
				text: i18n.ts.federation,
				icon: "ti ti-whirl",
				to: "/secure/about#federation",
			},
			{
				type: "link",
				text: i18n.ts.charts,
				icon: "ti ti-chart-line",
				to: "/secure/about#charts",
			},
			null,
			{
				type: "link",
				text: i18n.ts.ads,
				icon: "ti ti-ad",
				to: "/secure/ads",
			},
			$i &&
			($i.isAdmin || $i.policies.canInvite) &&
			instance.disableRegistration
				? {
						type: "link",
						to: "/secure/invite",
						text: i18n.ts.invite,
						icon: "ti ti-user-plus",
					}
				: undefined,
			{
				type: "parent",
				text: i18n.ts.tools,
				icon: "ti ti-tool",
				children: [
					{
						type: "link",
						to: "/secure/scratchpad",
						text: i18n.ts.scratchpad,
						icon: "ti ti-terminal-2",
					},
					{
						type: "link",
						to: "/secure/api-console",
						text: "API Console",
						icon: "ti ti-terminal-2",
					},
					$i && ($i.isAdmin || $i.policies.canManageCustomEmojis)
						? {
								type: "link",
								to: "/secure/custom-emojis-manager",
								text: i18n.ts.manageCustomEmojis,
								icon: "ti ti-icons",
							}
						: undefined,
				],
			},
			null,
			{
				text: i18n.ts.help,
				icon: "ti ti-help-circle",
				action: () => {
					window.open("https://misskey-hub.net/help.html", "_blank");
				},
			},
			{
				type: "link",
				text: i18n.ts.aboutTanukey,
				to: "/secure/about-tanukey",
			},
		],
		ev.currentTarget ?? ev.target,
		{
			align: "left",
		},
	);
}
