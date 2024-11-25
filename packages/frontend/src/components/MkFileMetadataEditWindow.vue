<template>
	<MkModalWindow ref="dialog" :width="400" :height="450" :withOkButton="true" :okButtonDisabled="false" @ok="ok()"
		@close="dialog.close()" @closed="emit('closed')">
		<template #header>{{ i18n.ts.describeFile }}</template>
		<MkSpacer :marginMin="20" :marginMax="28">
			<MkDriveFileThumbnail :file="file" fit="contain" style="height: 100px; margin-bottom: 16px;" />
			<MkButton @click="updateMetaData">{{ i18n.ts.update }}</MkButton>
			<p>imageType: {{ imageType }}</p>
			<p>labels: {{ labels.join(", ") }}</p>
		</MkSpacer>
	</MkModalWindow>
</template>

<script lang="ts" setup>
import { computed } from "vue";
import * as Misskey from "misskey-js";
import MkModalWindow from "@/components/MkModalWindow.vue";
import MkDriveFileThumbnail from "@/components/MkDriveFileThumbnail.vue";
import MkButton from "./MkButton.vue";
import { i18n } from "@/i18n";
import * as os from "@/os";

const props = defineProps<{
	file: Misskey.entities.DriveFile;
	default: string;
}>();

const emit = defineEmits<{
	(ev: "done", v: string): void;
	(ev: "closed"): void;
}>();

const dialog = $shallowRef<InstanceType<typeof MkModalWindow>>();
const imageType = computed<string>(() => props.file.metadata?.imageType ?? "unkown");
const labels = computed<string[]>(() => props.file.metadata?.labels ?? []);

function updateMetaData() {
	os.api("drive/files/updateMetaData", {
		fileId: props.file.id,
	});
}

async function ok() {
	emit("done", "");
	dialog.close();
}
</script>
