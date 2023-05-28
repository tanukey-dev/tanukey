<template>
<div v-if="vcEnable" :class="$style.root">
	<div :class="$style.header">
		<div :class="$style.headerLeft">
			<div>Voice Chat β ({{ channel }})</div>
		</div>
		<div v-if="joinStatus" :class="$style.headerRight">
			<div v-for="user in users" :key="user.id">
				<MkAvatar :user="user" :class="$style.avatar" :preview="true"/>
			</div>
		</div>
		<div :class="$style.headerRight">
			<MkButton v-if="connecting" :disabled="true" class="_button">connecting...</MkButton>
			<MkButton v-else-if="!joinStatus" class="_button" @click="onConnect">Join</MkButton>
			<MkButton v-else class="_button" @click="onDisconnect">Leave</MkButton>
			<div v-if="joinStatus">
				<MkButton v-if="!voice" @click="onVoiceOn"><i class="ti ti-microphone-off" style="color: red;"></i></MkButton>
				<MkButton v-else @click="onVoiceOff"><i class="ti ti-microphone"></i></MkButton>
			</div>
		</div>
	</div>
</div>
</template>

<script lang="ts" setup>
import { watch, ref } from 'vue';
import MkButton from '@/components/MkButton.vue';
import * as os from '@/os';
import { instance } from '@/instance';
import { $i } from '@/account';
import {
	Track,
	Participant,
	RemoteParticipant,
	RemoteTrack,
	RemoteTrackPublication,
	LocalTrackPublication,
	LocalParticipant,
	Room,
	RoomEvent,
	RoomConnectOptions,
} from 'livekit-client';

const props = defineProps<{
	channel: string;
}>();

const voice = ref(false);
const joinStatus = ref(false);
const connecting = ref(false);
const vcEnable = ref(instance.enableVoiceChat);
const participants = ref<Participant[]>([]);
const users = ref([]);

watch(participants, async () => {
	users.value = await Promise.all(participants.value.map(async p => {
		return await os.api('users/show', { userId: p.identity });
	}));
});

const room = new Room({
	audioCaptureDefaults: {
		autoGainControl: true,
		deviceId: '',
		echoCancellation: true,
		noiseSuppression: true,
	},
	videoCaptureDefaults: {
		deviceId: '',
		facingMode: 'user',
		resolution: {
			width: 1280,
			height: 720,
			frameRate: 30,
		},
	},
	publishDefaults: {
		videoEncoding: {
			maxBitrate: 1_500_000,
			maxFramerate: 30,
		},
		screenShareEncoding: {
			maxBitrate: 1_500_000,
			maxFramerate: 30,
		},
		audioBitrate: 20_000,
		dtx: true,
	},
});

room.on(RoomEvent.ActiveSpeakersChanged, (activeSpeakers: Participant[]) => {
	// speakers contain all of the current active speakers
});

room.on(RoomEvent.ParticipantConnected, (participant: Participant) => {
	addParticipant(participant);
});

const addParticipant = (participant): void => {
	const update = [...participants.value];
	update.push(participant);
	participants.value = update;
};

room.on(RoomEvent.ParticipantDisconnected, (participant: Participant) => {
	participants.value = participants.value.filter(p => p.identity !== participant.identity);
});

const onConnect = (): void => {
	join();
};

const onDisconnect = (): void => {
	room.disconnect();
	users.value = [];
	joinStatus.value = false;
};

const onVoiceOn = (): void => {
	room.localParticipant.setMicrophoneEnabled(true);
	voice.value = true;
};

const onVoiceOff = (): void => {
	room.localParticipant.setMicrophoneEnabled(false);
	voice.value = false;
};

async function join() {
	const wsURL = instance.liveKitServerURL;
	if (!wsURL) {
		console.log('wsURL is not set.');
		return;
	}
	if (!$i) {
		console.log('user is not login.');
		return;
	}

	connecting.value = true;

	const token = await os.api('i/vc-token', {
		roomName: props.channel,
		userName: $i.id,
	});

	try {
		const startTime = Date.now();

		await room.prepareConnection(wsURL);
		const prewarmTime = Date.now() - startTime;
		console.log(`prewarmed connection in ${prewarmTime}ms`);

		await room.connect(wsURL, token.token);
		const elapsed = Date.now() - startTime;
		connecting.value = false;
		joinStatus.value = true;

		console.log(room);
		addParticipant(room.localParticipant);
		for (const participant of room.participants.values()) {
			addParticipant(participant);
		}
		console.log(
			`successfully connected to ${room.name} in ${Math.round(elapsed)}ms` +
			await room.engine.getConnectedServerAddress(),
		);
	} catch (error: any) {
		let message: any = error;
		if (error.message) {
			message = error.message;
		}
		console.log('could not connect: ' + message);
		return;
	}
}

</script>

<style lang="scss" module>
.root {
	position: relative;
	container-type: inline-size;
	padding: 12px;
	text-align: left;
	background: var(--panel);
	border-radius: 8px;
	margin-bottom: 10px;

	&:hover {
		border-color: var(--accent);
	}
}

.header {
	z-index: 1000;
	min-height: 50px;
	display: flex;
	flex-wrap: nowrap;
	gap: 4px;
}

.headerLeft {
	display: block;
}

.headerRight {
	display: flex;
	min-height: 48px;
	font-size: 0.9em;
	flex-wrap: nowrap;
	align-items: center;
	margin-left: auto;
	gap: 4px;
	overflow: clip;
	padding-left: 4px;
}

.avatar {
	width: 28px;
	height: 28px;
	margin: 5px;
}

</style>
