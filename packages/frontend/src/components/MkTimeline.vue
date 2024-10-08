<template>
	<MkNotes ref="tlComponent" :noGap="!defaultStore.state.showGapBetweenNotesInTimeline" :pagination="pagenation"
		@queue="emit('queue', $event)" :key="key" />
</template>

<script lang="ts" setup>
import { $i } from "@/account";
import MkNotes from "@/components/MkNotes.vue";
import * as sound from "@/scripts/sound";
import { defaultStore } from "@/store";
import { useStream } from "@/stream";
import { computed, onBeforeMount, onUnmounted, provide, ref, watch } from "vue";
import { Paging } from "./MkPagination.vue";

const key = ref<number>(0)

const props = defineProps<{
	src: string;
	list?: string;
	antenna?: string;
	channel?: string | null;
	role?: string;
	sound?: boolean;
}>();

const emit = defineEmits<{
	(ev: "note"): void;
	(ev: "queue", count: number): void;
}>();

provide(
	"inChannel",
	computed(() => props.src === "channel"),
);

const tlComponent: InstanceType<typeof MkNotes> = $ref();

const prepend = (note) => {
	tlComponent.pagingComponent?.prepend(note);

	emit("note");

	if (props.sound) {
		sound.play($i && note.userId === $i.id ? "noteMy" : "note");
	}
};

const prependFilterdMedia = (note) => {
	if (note.files !== null && note.files.length > 0) {
		tlComponent.pagingComponent?.prepend(note);
	}

	emit("note");

	if (props.sound) {
		sound.play($i && note.userId === $i.id ? "noteMy" : "note");
	}
};

const onUserAdded = () => {
	tlComponent.pagingComponent?.reload();
};

const onUserRemoved = () => {
	tlComponent.pagingComponent?.reload();
};

watch([
	defaultStore.reactiveState.publicTlShowRemoteFollowPost,
	defaultStore.reactiveState.publicTlShowChannelFollowPost,
	defaultStore.reactiveState.publicTlShowLocalPost,
], () => {
	connection.dispose();
	key.value++;
	setupStream();
})

let endpoint;
let query;
let connection;
let connection2;
let pagenation: Paging;

const stream = useStream();

const setupStream = () => {
	if (props.src === "antenna") {
		endpoint = "antennas/notes";
		query = {
			antennaId: props.antenna,
		};
		connection = stream.useChannel("antenna", {
			antennaId: props.antenna,
		});
		connection.on("note", prepend);
	} else if (props.src === "home") {
		endpoint = "notes/timeline";
		query = {
			withReplies: defaultStore.state.showTimelineReplies,
		};
		connection = stream.useChannel("homeTimeline", {
			withReplies: defaultStore.state.showTimelineReplies,
		});
		connection.on("note", prepend);
	} else if (props.src === "local") {
		endpoint = "notes/local-timeline";
		query = {
			withReplies: defaultStore.state.showTimelineReplies,
		};
		connection = stream.useChannel("localTimeline", {
			withReplies: defaultStore.state.showTimelineReplies,
		});
		connection.on("note", prepend);
	} else if (props.src === "public") {
		endpoint = "notes/hybrid-timeline";
		query = {
			withReplies: defaultStore.state.showTimelineReplies,
			withLocal: defaultStore.state.publicTlShowLocalPost,
			withRemote: defaultStore.state.publicTlShowRemoteFollowPost,
			withChannel: defaultStore.state.publicTlShowChannelFollowPost,
		};
		connection = stream.useChannel("hybridTimeline", {
			withReplies: defaultStore.state.showTimelineReplies,
			withLocal: defaultStore.state.publicTlShowLocalPost,
			withRemote: defaultStore.state.publicTlShowRemoteFollowPost,
			withChannel: defaultStore.state.publicTlShowChannelFollowPost,
		});
		connection.on("note", prepend);
	} else if (props.src === "mentions") {
		endpoint = "notes/mentions";
		connection = stream.useChannel("main");
		connection.on("mention", prepend);
	} else if (props.src === "directs") {
		endpoint = "notes/mentions";
		query = {
			visibility: "specified",
		};
		const onNote = (note) => {
			if (note.visibility === "specified") {
				prepend(note);
			}
		};
		connection = stream.useChannel("main");
		connection.on("mention", onNote);
	} else if (props.src === "list") {
		endpoint = "notes/user-list-timeline";
		query = {
			listId: props.list,
		};
		connection = stream.useChannel("userList", {
			listId: props.list,
		});
		connection.on("note", prepend);
		connection.on("userAdded", onUserAdded);
		connection.on("userRemoved", onUserRemoved);
	} else if (props.src === "channel") {
		endpoint = "channels/timeline";
		query = {
			channelId: props.channel,
		};
		connection = stream.useChannel("channel", {
			channelId: props.channel,
		});
		connection.on("note", prepend);
		connection2 = stream.useChannel("channelAntenna", {
			channelId: props.channel,
		});
		connection2.on("note", prepend);
	} else if (props.src === "role") {
		endpoint = "roles/notes";
		query = {
			roleId: props.role,
		};
		connection = stream.useChannel("roleTimeline", {
			roleId: props.role,
		});
		connection.on("note", prepend);
	}

	pagenation = {
		endpoint: endpoint,
		limit: 10,
		params: query,
		reversed: false,
	}
}

onBeforeMount(() => {
	setupStream();
})

onUnmounted(() => {
	connection?.dispose();
	connection2?.dispose();
});

const timetravel = (date?: Date): void => {
	pagenation.params = {
		...pagenation.params,
		untilDate: date?.getTime(),
	};
	tlComponent.pagingComponent?.reload();
};

defineExpose({
	timetravel,
});
</script>
