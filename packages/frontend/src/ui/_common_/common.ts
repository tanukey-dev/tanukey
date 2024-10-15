import * as os from "@/os";
import { instance } from "@/instance";
import { host } from "@/config";
import { i18n } from "@/i18n";
import { $i } from "@/account";

export function openInstanceMenu(ev: MouseEvent) {
	os.popupMenu([
		$i && ($i.isAdmin || $i.policies.canInvite) && instance.disableRegistration
			? {
					type: "link",
					to: "/secure/invite",
					text: i18n.ts.invite,
					icon: "ti ti-user-plus",
				}
			: undefined,
	]);
}
