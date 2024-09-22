import { toUnicode } from "punycode";
import { computed } from "vue";
import * as misskey from "misskey-js";
import * as os from "@/os";
import { defaultStore } from "@/store";

const postChannel = computed(defaultStore.makeGetterSetter("postChannel"));

export function sendMessage(user: misskey.entities.UserDetailed) {
	const canonical =
		user.host === null
			? `@${user.username}`
			: `@${user.username}@${toUnicode(user.host)}`;
	postChannel.value = null;
	os.post({ specified: user, initialText: canonical, channel: null });
}
