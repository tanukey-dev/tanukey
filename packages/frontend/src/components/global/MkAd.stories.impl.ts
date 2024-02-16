/*
 * SPDX-FileCopyrightText: syuilo and misskey-project
 * SPDX-License-Identifier: AGPL-3.0-only
 */

/* eslint-disable @typescript-eslint/explicit-function-return-type */
import { StoryObj } from '@storybook/vue3';
import MkAd from './MkAd.vue';

let lock: Promise<undefined> | undefined;

const common = {
	render(args) {
		return {
			components: {
				MkAd,
			},
			setup() {
				return {
					args,
				};
			},
			computed: {
				props() {
					return {
						...this.args,
					};
				},
			},
			template: '<MkAd v-bind="props" />',
		};
	},
	/* FIXME: disabled because it still didn’t pass after applying #11267
	async play({ canvasElement, args }) {
		if (lock) {
			console.warn('This test is unexpectedly running twice in parallel, fix it!');
			console.warn('See also: https://github.com/misskey-dev/misskey/issues/11267');
			await lock;
		}

		let resolve: (value?: any) => void;
		lock = new Promise(r => resolve = r);

		try {
			const canvas = within(canvasElement);
			const a = canvas.getByRole<HTMLAnchorElement>('link');
			await expect(a.href).toMatch(/^https?:\/\/.*#test$/);
			const img = within(a).getByRole('img');
			await expect(img).toBeInTheDocument();
			let buttons = canvas.getAllByRole<HTMLButtonElement>('button');
			await expect(buttons).toHaveLength(1);
			const i = buttons[0];
			await expect(i).toBeInTheDocument();
			await userEvent.click(i);
			await waitFor(() => expect(canvasElement).toHaveTextContent(i18n.ts._ad.back));
			await expect(a).not.toBeInTheDocument();
			await expect(i).not.toBeInTheDocument();
			buttons = canvas.getAllByRole<HTMLButtonElement>('button');
			await expect(buttons).toHaveLength(args.__hasReduce ? 2 : 1);
			const reduce = args.__hasReduce ? buttons[0] : null;
			const back = buttons[args.__hasReduce ? 1 : 0];
			if (reduce) {
				await expect(reduce).toBeInTheDocument();
				await expect(reduce).toHaveTextContent(i18n.ts._ad.reduceFrequencyOfThisAd);
			}
			await expect(back).toBeInTheDocument();
			await expect(back).toHaveTextContent(i18n.ts._ad.back);
			await userEvent.click(back);
			await waitFor(() => expect(canvas.queryByRole('img')).toBeTruthy());
			if (reduce) {
				await expect(reduce).not.toBeInTheDocument();
			}
			await expect(back).not.toBeInTheDocument();
			const aAgain = canvas.getByRole<HTMLAnchorElement>('link');
			await expect(aAgain).toBeInTheDocument();
			const imgAgain = within(aAgain).getByRole('img');
			await expect(imgAgain).toBeInTheDocument();
		} finally {
			resolve!();
			lock = undefined;
		}
	},
	 */
	args: {
		prefer: [],
		specify: {
			id: 'someadid',
			radio: 1,
			url: '#test',
		},
		__hasReduce: true,
	},
	parameters: {
		layout: 'centered',
	},
} satisfies StoryObj<typeof MkAd>;
export const Square = {
	...common,
	args: {
		...common.args,
		specify: {
			...common.args.specify,
			place: 'square',
			imageUrl:
				'https://github.com/misskey-dev/misskey/blob/master/packages/frontend/assets/about-icon.png?raw=true',
		},
	},
} satisfies StoryObj<typeof MkAd>;
export const Horizontal = {
	...common,
	args: {
		...common.args,
		specify: {
			...common.args.specify,
			place: 'horizontal',
			imageUrl:
				'https://github.com/misskey-dev/misskey/blob/master/packages/frontend/assets/fedi.jpg?raw=true',
		},
	},
} satisfies StoryObj<typeof MkAd>;
export const HorizontalBig = {
	...common,
	args: {
		...common.args,
		specify: {
			...common.args.specify,
			place: 'horizontal-big',
			imageUrl:
				'https://github.com/misskey-dev/misskey/blob/master/packages/frontend/assets/fedi.jpg?raw=true',
		},
	},
} satisfies StoryObj<typeof MkAd>;
export const ZeroRatio = {
	...Square,
	args: {
		...Square.args,
		specify: {
			...Square.args.specify,
			ratio: 0,
		},
		__hasReduce: false,
	},
} satisfies StoryObj<typeof MkAd>;
