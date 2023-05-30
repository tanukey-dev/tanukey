<template>
<div v-if="vcEnableGlobal && channel?.isVoiceChatEnabled" :class="$style.root">
	<div :class="$style.header">
		<div ref="rootEl"></div>
		<div :class="$style.headerLeft">
			<div>Voice Chat β ({{ channel?.name }})</div>
			<div>{{ i18n.ts._livekit.message }}</div>
		</div>
		<div :class="$style.headerRight">
			<MkButton v-if="connecting" :disabled="true" class="_button">{{ i18n.ts._livekit.connecting }}</MkButton>
			<MkButton v-else-if="!audioJoinStatus" class="_button" @click="onAudioStart">{{ i18n.ts._livekit.join }}</MkButton>
			<MkButton v-else class="_button" @click="onDisconnect">{{ i18n.ts._livekit.leave }}</MkButton>
			<div v-if="audioJoinStatus">
				<MkButton v-if="!voice" @click="onVoiceOn"><i class="ti ti-microphone-off" style="color: rgb(232, 76, 76);"></i></MkButton>
				<MkButton v-else @click="onVoiceOff"><i class="ti ti-microphone"></i></MkButton>
			</div>
		</div>
	</div>
	<div v-if="audioJoinStatus" :class="$style.speakers">
		<div>Speaker: {{ speakers.map(s => s.username).join(',') }}</div>
	</div>
	<div v-if="roomJoinStatus" :class="$style.avatars">
		<div v-for="user in users" :key="user.id">
			<div :class="$style.avaterContent">
				<MkAvatar :user="user" :class="[$style.avatar, speakers.find(s => s.id === user.id) ? $style.speaking : '']" :preview="true"/>
				<div v-if="mutedSpeakers.has(user.id)" :class="$style.mute"><i class="ti ti-microphone-off" style="color: rgb(232, 76, 76);"></i></div>
			</div>
		</div>
	</div>
</div>
</template>

<script lang="ts" setup>
import { watch, ref, shallowRef, onMounted, onUnmounted } from 'vue';
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
import MkButton from '@/components/MkButton.vue';
import * as os from '@/os';
import { instance } from '@/instance';
import { $i } from '@/account';
import { i18n } from '@/i18n';

const props = defineProps<{
	channel: any;
}>();

const voice = ref(false);
const roomJoinStatus = ref(false);
const audioJoinStatus = ref(false);
const connecting = ref(false);
const vcEnableGlobal = ref(instance.enableVoiceChat);
const participants = ref<Participant[]>([]);
const users = ref<any[]>([]);
const speakers = ref<any[]>([]);
const usersCache = new Map<string, any>();
const mutedSpeakers = new Set<string>();
let audioCaches: any[] = [];
let muteTimerId;

onMounted(() => {
	roomJoin();
	roomJoinStatus.value = true;
	muteTimerId = setInterval(refreshRemoteMuteStatus, 1000);
});

onUnmounted(() => {
	clearInterval(muteTimerId);
	onDisconnect();
});

watch(participants, async () => {
	users.value = await Promise.all(participants.value.map(async p => {
		const userCache = usersCache.get(p.identity);
		if (userCache) {
			return userCache;
		} else {
			const user = await os.api('users/show', { userId: p.identity });
			usersCache.set(p.identity, user);
			return user;
		}
	}));
});

const room = new Room({
	adaptiveStream: true,
	dynacast: true,
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

const rootEl = shallowRef<HTMLDivElement>();

room
	.on(RoomEvent.TrackSubscribed, handleTrackSubscribed)
	.on(RoomEvent.TrackUnsubscribed, handleTrackUnsubscribed);

function handleTrackSubscribed(
	track: RemoteTrack,
	publication: RemoteTrackPublication,
	participant: RemoteParticipant
): void {
	if (track.kind === Track.Kind.Video || track.kind === Track.Kind.Audio) {
		// attach it to a new HTMLVideoElement or HTMLAudioElement
		if (audioJoinStatus.value) {
			const element = track.attach();
			rootEl.value?.appendChild(element);
		} else {
			audioCaches.push(track);
		}
	}
}

function handleTrackUnsubscribed(
	track: RemoteTrack,
	publication: RemoteTrackPublication,
	participant: RemoteParticipant
): void {
	// remove tracks from all attached elements
	track.detach();
}

room.on(RoomEvent.ActiveSpeakersChanged, (activeSpeakers: Participant[]) => {
	// speakers contain all of the current active speakers
	speakers.value = activeSpeakers.map(s => users.value.find(u => u.id === s.identity));
});

room.on(RoomEvent.ParticipantConnected, (participant: Participant) => {
	addParticipant(participant);
});

const addParticipant = (participant): void => {
	const update = [...participants.value];
	update.push(participant);
	participants.value = update;
	mutedSpeakers.add(participant.identity);
};

room.on(RoomEvent.ParticipantDisconnected, (participant: Participant) => {
	participants.value = participants.value.filter(p => p.identity !== participant.identity);
});

const onAudioStart = async (): Promise<void> => {
	if (!roomJoinStatus.value) {
		roomJoin();
		roomJoinStatus.value = true;
	}
	addParticipant(room.localParticipant);
	for (const audio of audioCaches) {
		const element = audio.attach();
		rootEl.value?.appendChild(element);
	}
	await room.startAudio();
	audioJoinStatus.value = true;
};

const onDisconnect = (): void => {
	onVoiceOff();
	room.disconnect();
	users.value = [];
	participants.value = [];
	audioJoinStatus.value = false;
	roomJoinStatus.value = false;
	audioCaches = [];
};

const onVoiceOn = (): void => {
	room.localParticipant.setMicrophoneEnabled(true);
	voice.value = true;
	mutedSpeakers.delete($i.id);
};

const onVoiceOff = (): void => {
	room.localParticipant.setMicrophoneEnabled(false);
	voice.value = false;
	mutedSpeakers.add($i.id);
};

async function roomJoin(): Promise<void> {
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
		roomName: props.channel.name,
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

		usersCache.set($i.id, $i);
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

const refreshRemoteMuteStatus = (): void => {
	for (const participant of room.participants.values()) {
		const track = participant.getTrack(Track.Source.Microphone);
		if (track?.isMuted === false) {
			mutedSpeakers.delete(participant.identity);
		} else {
			mutedSpeakers.add(participant.identity);
		}
	}
};

</script>

<style lang="scss" module>
.root {
	display: flex;
	flex-direction: column;
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
	width: 100%;
	z-index: 1000;
	min-height: 50px;
	display: flex;
	flex-wrap: nowrap;
	gap: 4px;
}
.speakers {
	display: flex;
	flex-wrap: wrap;
	width: 100%;
}

.avatars {
	display: flex;
	flex-wrap: wrap;
	width: 100%;
}

.headerLeft {
	display: flex;
	flex-direction: column;
}

.headerRight {
	display: flex;
	min-height: 48px;
	font-size: 0.9em;
	flex-wrap: wrap;
	justify-content: flex-end;
	align-items: center;
	margin-left: auto;
	gap: 4px;
	overflow: clip;
	padding-left: 4px;
}

.avatarContent {
	display: flex;
	justify-content: center;
	align-items: center;
}

.avatar {
	position: relative;
	width: 28px;
	height: 28px;
	margin: 5px;
}

.mute {
	position: relative;
	z-index: 1000;
	opacity: 0.9;
	margin-left: 20px;
	margin-top: -20px;
	min-width: 10px;
}

.speaking {
	box-shadow:
		0 0 0 4px rgba(9, 133, 164, 0.653)
}

</style>
