import * as mfm from "tfm-js";
import { unique } from "@/misc/prelude/array.js";

export function extractCustomEmojisFromMfm(nodes: mfm.MfmNode[]): string[] {
	const emojiNodes = mfm.extract(nodes, (node) => {
		return node.type === "emojiCode" && node.props.name.length <= 100;
	}) as mfm.MfmEmojiCode[];

	return unique(emojiNodes.map((x) => x.props.name));
}
