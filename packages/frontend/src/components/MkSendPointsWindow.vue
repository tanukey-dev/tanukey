<template>
	<MkModalWindow ref="dialog" :width="400" :height="450" :withOkButton="true" :okButtonDisabled="false"
		:canClose="false" @close="dialog?.close()" @closed="$emit('closed')" @ok="ok()">
		<template #header>{{ i18n.ts._points.send }}</template>

		<MkSpacer :marginMin="20" :marginMax="28">
			<div class="_gaps_m">
				<div><b>{{ i18n.ts._points.target }}</b></div>
				<div>
					<div style="text-align: center;" class="_gaps">
						<div v-if="target">@{{ target.username }}</div>
						<div>
							<MkButton v-if="target == null" primary rounded inline @click="selectUser">{{
								i18n.ts.selectUser }}
							</MkButton>
							<MkButton v-else-if="!user" danger rounded inline @click="target = null">{{ i18n.ts.remove
								}}
							</MkButton>
						</div>
					</div>
				</div>
				<div><b>{{ i18n.ts._points.ownPoints }}</b></div>
				<div style="text-align: center;" class="_gaps">
					<div>{{ ownPoint }}</div>
				</div>
				<div><b>{{ i18n.ts._points.value }}</b></div>
				<div>
					<MkInput v-model="value" :type="'number'"></MkInput>
				</div>
				<div :style="{ color: 'red' }">{{ error }}</div>
			</div>
		</MkSpacer>
	</MkModalWindow>
</template>

<script lang="ts" setup>
import { $i } from "@/account";
import MkButton from "@/components/MkButton.vue";
import MkModalWindow from "@/components/MkModalWindow.vue";
import { i18n } from "@/i18n";
import * as os from "@/os";
import { computed, onMounted, ref, shallowRef, watch } from "vue";
import MkInput from "./MkInput.vue";

const props = defineProps<{
	user?: string;
}>();

const emit = defineEmits<{
	(ev: "closed"): void;
	(ev: "done", result: { target: string | null; value: number }): void;
}>();

const dialog = shallowRef<InstanceType<typeof MkModalWindow>>();
const target = ref<any>(null);
const value = ref(0);
const error = ref<string | null>(null);
const point = ref<{ point: number } | null>(null);
const ownPoint = computed(() => point.value?.point);

onMounted(async () => {
	point.value = await os.api("points/show");
})

watch(value, (newValue, oldValue) => {
	if (newValue <= 0) {
		value.value = 0;
	}
});

function selectUser() {
	os.selectUser({ includeSelf: false, localOnly: true }).then((_user) => {
		target.value = _user;
	});
}

async function ok(): Promise<void> {
	if (!target.value) {
		error.value = i18n.ts._points._errors.noUser;
		return;
	}
	if (value.value <= 0) {
		error.value = i18n.ts._points._errors.noPoint;
		return;
	}
	if (target.value.id === $i?.id) {
		error.value = i18n.ts._points._errors.sameUser;
		return;
	}
	if (target.value.host !== null) {
		error.value = i18n.ts._points._errors.remoteUser;
		return;
	}
	if (!point.value) {
		return;
	}
	if (value.value > point.value.point) {
		error.value = i18n.ts._points._errors.overPoints;
		return;
	}
	if (!Number.isInteger(value.value)) {
		error.value = i18n.ts._points._errors.isNotInteger;
		return;
	}
	emit("done", {
		target: target.value,
		value: value.value,
	});
	dialog.value?.close();
}

onMounted(() => {
	if (props.user) {
		target.value = props.user;
	}
});
</script>
