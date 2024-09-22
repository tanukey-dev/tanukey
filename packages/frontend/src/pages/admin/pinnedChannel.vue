<template>
<MkStickyContainer>
	<template #header><XHeader :tabs="headerTabs"/></template>
	<MkSpacer :contentMax="700" :marginMin="16" :marginMax="32">
		<FormSuspense :p="init">
			<div class="_gaps_m">
				<FormSlot>
					<div :class="$style.metadataRoot">
						<div :class="$style.metadataMargin">
							<MkButton :disabled="fields.length >= 50" inline style="margin-right: 8px;" @click="addField"><i class="ti ti-plus"></i> {{ i18n.ts.add }}</MkButton>
							<MkButton v-if="!fieldEditMode" :disabled="fields.length <= 1" inline danger style="margin-right: 8px;" @click="fieldEditMode = !fieldEditMode"><i class="ti ti-trash"></i> {{ i18n.ts.delete }}</MkButton>
							<MkButton v-else inline style="margin-right: 8px;" @click="fieldEditMode = !fieldEditMode"><i class="ti ti-arrows-sort"></i> {{ i18n.ts.rearrange }}</MkButton>
							<MkButton inline primary @click="saveFields"><i class="ti ti-check"></i> {{ i18n.ts.save }}</MkButton>
						</div>

						<Sortable
							v-model="fields"
							class="_gaps_s"
							itemKey="id"
							:animation="150"
							:handle="'.' + $style.dragItemHandle"
							@start="e => e.item.classList.add('active')"
							@end="e => e.item.classList.remove('active')"
						>
							<template #item="{element, index}">
								<div :class="$style.fieldDragItem">
									<button v-if="!fieldEditMode" class="_button" :class="$style.dragItemHandle" tabindex="-1"><i class="ti ti-menu"></i></button>
									<button v-if="fieldEditMode" :disabled="fields.length <= 1" class="_button" :class="$style.dragItemRemove" @click="deleteField(index)"><i class="ti ti-x"></i></button>
									<div :class="$style.dragItemForm">
										{{ element.name }}
									</div>
								</div>
							</template>
						</Sortable>
					</div>
				</FormSlot>
			</div>
		</FormSuspense>
	</MkSpacer>
</MkStickyContainer>
</template>

<script lang="ts" setup>
import { computed, ref, defineAsyncComponent } from "vue";
import MkButton from "@/components/MkButton.vue";
import FormSlot from "@/components/form/slot.vue";
import { fetchInstance } from "@/instance";
import * as os from "@/os";
import { i18n } from "@/i18n";
import FormSuspense from "@/components/form/suspense.vue";

const Sortable = defineAsyncComponent(() =>
	import("vuedraggable").then((x) => x.default),
);

const fields = ref([]);
const fieldSet = computed(() => new Set(fields.value.map((ch) => ch.value)));
const fieldEditMode = ref(false);

function addField() {
	os.popup(
		defineAsyncComponent(() => import("@/components/MkChannelDialog.vue")),
		{},
		{
			done: (values) => {
				if (values !== null && values !== undefined) {
					for (const value of values) {
						if (!fieldSet.value.has(value.value)) {
							fields.value.push({
								id: Math.random().toString(),
								name: value.label,
								value: value.value,
							});
						}
					}
				}
			},
		},
		"closed",
	);
}

function deleteField(index: number) {
	fields.value.splice(index, 1);
}

function saveFields() {
	os.apiWithDialog("admin/update-meta", {
		pinnedLtlChannelIds: fields.value.map((c) => c.value),
	}).then(() => {
		fetchInstance();
	});
}

async function init() {
	const meta = await os.api("admin/meta");

	let chs: { value: string; label: string }[] = [];
	for (let id of meta.pinnedLtlChannelIds) {
		let ch = await os.api("channels/show", {
			channelId: id,
		});
		if (ch != null) {
			chs.push({ value: ch.id, label: ch.name });
		}
	}
	fields.value = chs.map((ch) => ({
		id: Math.random().toString(),
		name: ch.label,
		value: ch.value,
	}));
}

const headerTabs = $computed(() => []);
</script>

<style lang="scss" module>

.metadataRoot {
	container-type: inline-size;
}

.metadataMargin {
	margin-bottom: 1.5em;
}

.fieldDragItem {
	display: flex;
	padding-bottom: .75em;
	align-items: flex-end;
	border-bottom: solid 0.5px var(--divider);

	&:last-child {
		border-bottom: 0;
	}

	/* (drag button) 32px + (drag button margin) 8px + (input width) 200px * 2 + (input gap) 12px = 452px */
	@container (max-width: 452px) {
		align-items: center;
	}
}

.dragItemHandle {
	cursor: grab;
	width: 32px;
	height: 32px;
	margin: 0 8px 0 0;
	opacity: 0.5;
	flex-shrink: 0;

	&:active {
		cursor: grabbing;
	}
}

.dragItemRemove {
	@extend .dragItemHandle;

	color: #ff2a2a;
	opacity: 1;
	cursor: pointer;

	&:hover, &:focus {
		opacity: .7;
	}
	&:active {
		cursor: pointer;
	}
}

.dragItemForm {
	flex-grow: 1;
}
</style>
