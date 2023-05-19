<template>
<MkSpacer :content-max="800" style="padding: 0">
	<MkStickyContainer>
		<template #header>
			<MkTab v-model="include" :tabs="tabs" :class="$style.tab"/>
		</template>
		<MkNotes :no-gap="true" :pagination="pagination" :class="$style.tl"/>
	</MkStickyContainer>
</MkSpacer>
</template>

<script lang="ts" setup>
import { ref, computed } from 'vue';
import * as misskey from 'misskey-js';
import MkNotes from '@/components/MkNotes.vue';
import MkTab from '@/components/MkTab.vue';
import { i18n } from '@/i18n';

const props = defineProps<{
	user: misskey.entities.UserDetailed;
}>();

const include = ref<string>('notes');
const tabs = ref([
	{ value: 'notes', label: i18n.ts.notes },
	{ value: 'replies', label: i18n.ts.notesAndReplies },
	{ value: 'files', label: i18n.ts.withFiles },
]);

const pagination = {
	endpoint: 'users/notes' as const,
	limit: 10,
	params: computed(() => ({
		userId: props.user.id,
		includeReplies: include.value === 'replies' || include.value === 'files',
		withFiles: include.value === 'files',
	})),
};
</script>

<style lang="scss" module>
.tab {
	margin: calc(var(--margin) / 2) 0;
	padding: calc(var(--margin) / 2) 0;
	background: var(--bg);
}

.tl {
	background: var(--bg);
    border-radius: var(--radius);
    overflow: clip;
}
</style>
