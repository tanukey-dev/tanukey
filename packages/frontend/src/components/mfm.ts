import { VNode, defineComponent, h } from 'vue';
import * as mfm from 'mfm-js';
import MkUrl from '@/components/global/MkUrl.vue';
import MkLink from '@/components/MkLink.vue';
import MkMention from '@/components/MkMention.vue';
import MkEmoji from '@/components/global/MkEmoji.vue';
import MkCustomEmoji from '@/components/global/MkCustomEmoji.vue';
import MkCode from '@/components/MkCode.vue';
import MkGoogle from '@/components/MkGoogle.vue';
import MkSparkle from '@/components/MkSparkle.vue';
import MkA from '@/components/global/MkA.vue';
import { host } from '@/config';
import { defaultStore } from '@/store';

const QUOTE_STYLE = `
display: block;
margin: 8px;
padding: 6px 0 6px 12px;
color: var(--fg);
border-left: solid 3px var(--fg);
opacity: 0.7;
`.split('\n').join(' ');

export default defineComponent({
	props: {
		text: {
			type: String,
			required: true,
		},
		plain: {
			type: Boolean,
			default: false,
		},
		nowrap: {
			type: Boolean,
			default: false,
		},
		author: {
			type: Object,
			default: null,
		},
		i: {
			type: Object,
			default: null,
		},
		isNote: {
			type: Boolean,
			default: true,
		},
		emojiUrls: {
			type: Object,
			default: null,
		},
		rootScale: {
			type: Number,
			default: 1,
		}
	},

	render() {
		if (this.text == null || this.text === '') return;

		const ast = (this.plain ? mfm.parseSimple : mfm.parse)(this.text);

		const validTime = (t: string | null | undefined) => {
			if (t == null) return null;
			return t.match(/^[0-9.]+s$/) ? t : null;
		};

		const useAnim = defaultStore.state.advancedMfm && defaultStore.state.animatedMfm;

		/**
		 * Gen Vue Elements from MFM AST
		 * @param ast MFM AST
		 * @param scale How times large the text is
		 */
		const genEl = (ast: mfm.MfmNode[], scale: number) => ast.map((token): VNode | string | (VNode | string)[] => {
			switch (token.type) {
				case 'text': {
					const text = token.props.text.replace(/(\r\n|\n|\r)/g, '\n');

					if (!this.plain) {
						const res: (VNode | string)[] = [];
						for (const t of text.split('\n')) {
							res.push(h('br'));
							const text2 = t.replace(/<ruby>(.+?)<rt>(.+?)<\/rt><\/ruby>/g, '\n<ruby>$1<rt>$2</rt></ruby>\n')
								.replace(/《《(.+?)》》/g, (match, c1) => c1.replace(/(.)/g, '\n<ruby>$1<rt>・</rt></ruby>\n'))
								.replace(/[\|｜](.+?)《(.+?)》/g, '\n<ruby>$1<rt>$2</rt></ruby>\n')
								.replace(/([一-龠]+)《(.+?)》/g, '\n<ruby>$1<rt>$2</rt></ruby>\n')
								.replace(/[\|｜]《(.+?)》/g, '《$1》');
							for (const t2 of text2.split('\n')) {
								const match = t2.match(/<ruby>(.+?)<rt>(.+?)<\/rt><\/ruby>/);
								if (match !== null && match.length > 2) {
									if (match[1].length < match[2].length) {
										res.push(h('ruby', { style: 'ruby-align:center' }, [match[1], h('rt', match[2])]));
									} else {
										res.push(h('ruby', { style: 'ruby-align:space-around' }, [match[1], h('rt', match[2])]));
									}
								} else {
									if (t2 !== '') {
										res.push(t2);
									}
								}
							}
						}
						res.shift();
						return res;
					} else {
						return [text.replace(/\n/g, ' ')];
					}
				}

				case 'bold': {
					return [h('b', genEl(token.children, scale))];
				}

				case 'strike': {
					return [h('del', genEl(token.children, scale))];
				}

				case 'italic': {
					return h('i', {
						style: 'font-style: oblique;',
					}, genEl(token.children, scale));
				}

				case 'fn': {
					// TODO: CSSを文字列で組み立てていくと token.props.args.~~~ 経由でCSSインジェクションできるのでよしなにやる
					let style;
					switch (token.props.name) {
						case 'tada': {
							const speed = validTime(token.props.args.speed) ?? '1s';
							style = 'font-size: 150%;' + (useAnim ? `animation: tada ${speed} linear infinite both;` : '');
							break;
						}
						case 'jelly': {
							const speed = validTime(token.props.args.speed) ?? '1s';
							style = (useAnim ? `animation: mfm-rubberBand ${speed} linear infinite both;` : '');
							break;
						}
						case 'twitch': {
							const speed = validTime(token.props.args.speed) ?? '0.5s';
							style = useAnim ? `animation: mfm-twitch ${speed} ease infinite;` : '';
							break;
						}
						case 'shake': {
							const speed = validTime(token.props.args.speed) ?? '0.5s';
							style = useAnim ? `animation: mfm-shake ${speed} ease infinite;` : '';
							break;
						}
						case 'spin': {
							const direction =
								token.props.args.left ? 'reverse' :
								token.props.args.alternate ? 'alternate' :
								'normal';
							const anime =
								token.props.args.x ? 'mfm-spinX' :
								token.props.args.y ? 'mfm-spinY' :
								'mfm-spin';
							const speed = validTime(token.props.args.speed) ?? '1.5s';
							style = useAnim ? `animation: ${anime} ${speed} linear infinite; animation-direction: ${direction};` : '';
							break;
						}
						case 'jump': {
							const speed = validTime(token.props.args.speed) ?? '0.75s';
							style = useAnim ? `animation: mfm-jump ${speed} linear infinite;` : '';
							break;
						}
						case 'bounce': {
							const speed = validTime(token.props.args.speed) ?? '0.75s';
							style = useAnim ? `animation: mfm-bounce ${speed} linear infinite; transform-origin: center bottom;` : '';
							break;
						}
						case 'flip': {
							const transform =
								(token.props.args.h && token.props.args.v) ? 'scale(-1, -1)' :
								token.props.args.v ? 'scaleY(-1)' :
								'scaleX(-1)';
							style = `transform: ${transform};`;
							break;
						}
						case 'x2': {
							return h('span', {
								class: defaultStore.state.advancedMfm ? 'mfm-x2' : '',
							}, genEl(token.children, scale * 2));
						}
						case 'x3': {
							return h('span', {
								class: defaultStore.state.advancedMfm ? 'mfm-x3' : '',
							}, genEl(token.children, scale * 3));
						}
						case 'x4': {
							return h('span', {
								class: defaultStore.state.advancedMfm ? 'mfm-x4' : '',
							}, genEl(token.children, scale * 4));
						}
						case 'font': {
							const family =
								token.props.args.serif ? 'serif' :
								token.props.args.monospace ? 'monospace' :
								token.props.args.cursive ? 'cursive' :
								token.props.args.fantasy ? 'fantasy' :
								token.props.args.emoji ? 'emoji' :
								token.props.args.math ? 'math' :
								null;
							if (family) style = `font-family: ${family};`;
							break;
						}
						case 'blur': {
							return h('span', {
								class: '_mfm_blur_',
							}, genEl(token.children, scale));
						}
						case 'rainbow': {
							const speed = validTime(token.props.args.speed) ?? '1s';
							style = useAnim ? `animation: mfm-rainbow ${speed} linear infinite;` : '';
							break;
						}
						case 'sparkle': {
							if (!useAnim) {
								return genEl(token.children, scale);
							}
							return h(MkSparkle, {}, genEl(token.children, scale));
						}
						case 'rotate': {
							const degrees = parseFloat(token.props.args.deg ?? '90');
							style = `transform: rotate(${degrees}deg); transform-origin: center center;`;
							break;
						}
						case 'position': {
							if (!defaultStore.state.advancedMfm) break;
							const x = parseFloat(token.props.args.x ?? '0');
							const y = parseFloat(token.props.args.y ?? '0');
							style = `transform: translateX(${x}em) translateY(${y}em);`;
							break;
						}
						case 'scale': {
							if (!defaultStore.state.advancedMfm) {
								style = '';
								break;
							}
							const x = Math.min(parseFloat(token.props.args.x ?? '1'), 5);
							const y = Math.min(parseFloat(token.props.args.y ?? '1'), 5);
							style = `transform: scale(${x}, ${y});`; 
							scale = scale * Math.max(x, y);
							break;
						}
						case 'fg': {
							let color = token.props.args.color;
							if (!/^[0-9a-f]{3,6}$/i.test(color)) color = 'f00';
							style = `color: #${color};`;
							break;
						}
						case 'bg': {
							let color = token.props.args.color;
							if (!/^[0-9a-f]{3,6}$/i.test(color)) color = 'f00';
							style = `background-color: #${color};`;
							break;
						}
					}
					if (style == null) {
						return h('span', {}, ['$[', token.props.name, ' ', ...genEl(token.children, scale), ']']);
					} else {
						return h('span', {
							style: 'display: inline-block; ' + style,
						}, genEl(token.children, scale));
					}
				}

				case 'small': {
					return [h('small', {
						style: 'opacity: 0.7;',
					}, genEl(token.children, scale))];
				}

				case 'center': {
					return [h('div', {
						style: 'text-align:center;',
					}, genEl(token.children, scale))];
				}

				case 'url': {
					return [h(MkUrl, {
						key: Math.random(),
						url: token.props.url,
						rel: 'nofollow noopener',
					})];
				}

				case 'link': {
					return [h(MkLink, {
						key: Math.random(),
						url: token.props.url,
						rel: 'nofollow noopener',
					}, genEl(token.children, scale))];
				}

				case 'mention': {
					return [h(MkMention, {
						key: Math.random(),
						host: (token.props.host == null && this.author && this.author.host != null ? this.author.host : token.props.host) || host,
						username: token.props.username,
					})];
				}

				case 'hashtag': {
					return [h(MkA, {
						key: Math.random(),
						to: this.isNote ? `/tags/${encodeURIComponent(token.props.hashtag)}` : `/user-tags/${encodeURIComponent(token.props.hashtag)}`,
						style: 'color:var(--hashtag);',
					}, `#${token.props.hashtag}`)];
				}

				case 'blockCode': {
					return [h(MkCode, {
						key: Math.random(),
						code: token.props.code,
						lang: token.props.lang,
					})];
				}

				case 'inlineCode': {
					return [h(MkCode, {
						key: Math.random(),
						code: token.props.code,
						inline: true,
					})];
				}

				case 'quote': {
					if (!this.nowrap) {
						return [h('div', {
							style: QUOTE_STYLE,
						}, genEl(token.children, scale))];
					} else {
						return [h('span', {
							style: QUOTE_STYLE,
						}, genEl(token.children, scale))];
					}
				}

				case 'emojiCode': {
					// eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
					if (this.author?.host == null) {
						return [h(MkCustomEmoji, {
							key: Math.random(),
							name: token.props.name,
							normal: this.plain,
							host: null,
							useOriginalSize: scale >= 2.5,
						})];
					} else {
						// eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
						if (this.emojiUrls && (this.emojiUrls[token.props.name] == null)) {
							return [h('span', `:${token.props.name}:`)];
						} else {
							return [h(MkCustomEmoji, {
								key: Math.random(),
								name: token.props.name,
								// eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
								url: this.emojiUrls ? this.emojiUrls[token.props.name] : null,
								normal: this.plain,
								host: this.author.host,
								useOriginalSize: scale >= 2.5,
							})];
						}
					}
				}

				case 'unicodeEmoji': {
					return [h(MkEmoji, {
						key: Math.random(),
						emoji: token.props.emoji,
					})];
				}

				case 'mathInline': {
					return [h('code', token.props.formula)];
				}

				case 'mathBlock': {
					return [h('code', token.props.formula)];
				}

				case 'search': {
					return [h(MkGoogle, {
						key: Math.random(),
						q: token.props.query,
					})];
				}

				case 'plain': {
					return [h('span', genEl(token.children, scale))];
				}

				default: {
					// eslint-disable-next-line @typescript-eslint/no-explicit-any
					console.error('unrecognized ast type:', (token as any).type);

					return [];
				}
			}
		}).flat(Infinity) as (VNode | string)[];

		// Parse ast to DOM
		return h('span', genEl(ast, this.rootScale));
	},
});
