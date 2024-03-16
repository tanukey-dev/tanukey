<template>
<MkStickyContainer>
	<template #header><XHeader :actions="headerActions" :tabs="headerTabs"/></template>
	<MkSpacer :contentMax="700" :marginMin="16" :marginMax="32">
		<FormSuspense :p="init">
			<div class="_gaps_m">
				<MkFolder>
					<template #icon><i class="ti ti-shield"></i></template>
					<template #label>{{ i18n.ts.botProtection }}</template>
					<template v-if="enableHcaptcha" #suffix>hCaptcha</template>
					<template v-else-if="enableRecaptcha" #suffix>reCAPTCHA</template>
					<template v-else-if="enableTurnstile" #suffix>Turnstile</template>
					<template v-else #suffix>{{ i18n.ts.none }} ({{ i18n.ts.notRecommended }})</template>

					<XBotProtection/>
				</MkFolder>

				<MkFolder>
					<template #label>Active Email Validation</template>
					<template v-if="enableActiveEmailValidation" #suffix>Enabled</template>
					<template v-else #suffix>Disabled</template>

					<div class="_gaps_m">
						<span>{{ i18n.ts.activeEmailValidationDescription }}</span>
						<MkSwitch v-model="enableActiveEmailValidation" @update:modelValue="save">
							<template #label>Enable</template>
						</MkSwitch>
						<MkSwitch v-model="enableVerifymailApi" @update:modelValue="save">
							<template #label>Use Verifymail API</template>
						</MkSwitch>
						<MkInput v-model="verifymailAuthKey" @update:modelValue="save">
							<template #prefix><i class="ti ti-key"></i></template>
							<template #label>Verifymail API Auth Key</template>
						</MkInput>
					</div>
				</MkFolder>

				<MkFolder>
					<template #label>Banned Email Domains</template>

					<div class="_gaps_m">
						<MkTextarea v-model="bannedEmailDomains">
							<template #label>Banned Email Domains List</template>
						</MkTextarea>
						<MkButton primary @click="save"><i class="ti ti-device-floppy"></i> {{ i18n.ts.save }}</MkButton>
					</div>
				</MkFolder>

				<MkFolder>
					<template #label>Log IP address</template>
					<template v-if="enableIpLogging" #suffix>Enabled</template>
					<template v-else #suffix>Disabled</template>

					<div class="_gaps_m">
						<MkSwitch v-model="enableIpLogging" @update:modelValue="save">
							<template #label>Enable</template>
						</MkSwitch>
					</div>
				</MkFolder>

				<MkFolder>
					<template #label>Summaly Proxy</template>

					<div class="_gaps_m">
						<MkInput v-model="summalyProxy">
							<template #prefix><i class="ti ti-link"></i></template>
							<template #label>Summaly Proxy URL</template>
						</MkInput>

						<MkButton primary @click="save"><i class="ti ti-device-floppy"></i> {{ i18n.ts.save }}</MkButton>
					</div>
				</MkFolder>
			</div>
		</FormSuspense>
	</MkSpacer>
</MkStickyContainer>
</template>

<script lang="ts" setup>
import { } from 'vue';
import XBotProtection from './bot-protection.vue';
import XHeader from './_header_.vue';
import MkFolder from '@/components/MkFolder.vue';
import MkRadios from '@/components/MkRadios.vue';
import MkSwitch from '@/components/MkSwitch.vue';
import FormSuspense from '@/components/form/suspense.vue';
import MkRange from '@/components/MkRange.vue';
import MkInput from '@/components/MkInput.vue';
import MkButton from '@/components/MkButton.vue';
import MkTextarea from '@/components/MkTextarea.vue';
import * as os from '@/os';
import { fetchInstance } from '@/instance';
import { i18n } from '@/i18n';
import { definePageMetadata } from '@/scripts/page-metadata';

let summalyProxy: string = $ref('');
let enableHcaptcha: boolean = $ref(false);
let enableRecaptcha: boolean = $ref(false);
let enableTurnstile: boolean = $ref(false);
let enableIpLogging: boolean = $ref(false);
let enableActiveEmailValidation: boolean = $ref(false);
let enableVerifymailApi: boolean = $ref(false);
let verifymailAuthKey: string | null = $ref(null);
let bannedEmailDomains = $ref<string>('');

async function init() {
	const meta = await os.api('admin/meta');
	summalyProxy = meta.summalyProxy;
	enableHcaptcha = meta.enableHcaptcha;
	enableRecaptcha = meta.enableRecaptcha;
	enableTurnstile = meta.enableTurnstile;
	enableIpLogging = meta.enableIpLogging;
	enableActiveEmailValidation = meta.enableActiveEmailValidation;
	enableVerifymailApi = meta.enableVerifymailApi;
	verifymailAuthKey = meta.verifymailAuthKey;
	bannedEmailDomains = meta.bannedEmailDomains.join('\n');
}

function save() {
	os.apiWithDialog('admin/update-meta', {
		summalyProxy,
		enableIpLogging,
		enableActiveEmailValidation,
		enableVerifymailApi,
		verifymailAuthKey,
		bannedEmailDomains: bannedEmailDomains.split('\n'),
	}).then(() => {
		fetchInstance();
	});
}

const headerActions = $computed(() => []);

const headerTabs = $computed(() => []);

definePageMetadata({
	title: i18n.ts.security,
	icon: 'ti ti-lock',
});
</script>
