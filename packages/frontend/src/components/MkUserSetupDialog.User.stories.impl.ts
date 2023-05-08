/* eslint-disable @typescript-eslint/explicit-function-return-type */
import { StoryObj } from '@storybook/vue3';
import { userDetailed } from '../../.storybook/fakes';
import MkUserSetupDialog_User from './MkUserSetupDialog.User.vue';
export const Default = {
	render(args) {
		return {
			components: {
				MkUserSetupDialog_User,
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
			template: '<MkUserSetupDialog_User v-bind="props" />',
		};
	},
	args: {
		user: userDetailed(),
	},
	parameters: {
		layout: 'centered',
	},
} satisfies StoryObj<typeof MkUserSetupDialog_User>;
