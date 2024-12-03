import * as os from "@/os";
import { i18n } from "@/i18n";
import { router } from "@/router";

export async function lookup() {
	const { canceled, result: query } = await os.inputText({
		title: i18n.ts.lookup,
	});
	if (canceled) return;

	if (query.startsWith("@") && !query.includes(" ")) {
		router.push(`/${query}`);
		return;
	}

	if (query.startsWith("#")) {
		router.push(`/secure/tags/${encodeURIComponent(query.substr(1))}`);
		return;
	}

	if (query.startsWith("https://")) {
		const promise = os.api("ap/show", {
			uri: query,
		});

		os.promiseDialog(promise, null, null, i18n.ts.fetchingAsApObject);

		const res = await promise;

		if (res.type === "User") {
			router.push(`/@${res.object.username}@${res.object.host}`);
		} else if (res.type === "Note") {
			router.push(`/notes/${res.object.id}`);
		}

		return;
	}
}
