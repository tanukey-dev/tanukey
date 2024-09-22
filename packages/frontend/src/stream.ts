import * as Misskey from "misskey-js";
import { markRaw } from "vue";
import { $i } from "@/account";
import { url } from "@/config";

let stream: Misskey.Stream | null = null;

export function useStream(): Misskey.Stream {
	if (stream) return stream;

	stream = markRaw(
		new Misskey.Stream(
			url,
			$i
				? {
						token: $i.token,
					}
				: null,
		),
	);

	window.setTimeout(heartbeat, 1000 * 60);

	return stream;
}

function heartbeat(): void {
	if (stream != null && document.visibilityState === "visible") {
		stream.send("ping");
	}
	window.setTimeout(heartbeat, 1000 * 60);
}
