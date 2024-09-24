export const DI = {
	config: "config",
	db: "db",
	opensearch: "opensearch",
	redis: "redis",
	redisForPub: "redisForPub",
	redisForSub: "redisForSub",

	//#region Repositories
	usersRepository: "usersRepository",
	notesRepository: "notesRepository",
	announcementsRepository: "announcementsRepository",
	announcementReadsRepository: "announcementReadsRepository",
	appsRepository: "appsRepository",
	noteFavoritesRepository: "noteFavoritesRepository",
	noteThreadMutingsRepository: "noteThreadMutingsRepository",
	noteReactionsRepository: "noteReactionsRepository",
	noteUnreadsRepository: "noteUnreadsRepository",
	pollsRepository: "pollsRepository",
	pollVotesRepository: "pollVotesRepository",
	userProfilesRepository: "userProfilesRepository",
	userKeypairsRepository: "userKeypairsRepository",
	userPendingsRepository: "userPendingsRepository",
	attestationChallengesRepository: "attestationChallengesRepository",
	userSecurityKeysRepository: "userSecurityKeysRepository",
	userPublickeysRepository: "userPublickeysRepository",
	userListsRepository: "userListsRepository",
	userListFavoritesRepository: "userListFavoritesRepository",
	userListJoiningsRepository: "userListJoiningsRepository",
	userNotePiningsRepository: "userNotePiningsRepository",
	userIpsRepository: "userIpsRepository",
	usedUsernamesRepository: "usedUsernamesRepository",
	followingsRepository: "followingsRepository",
	followRequestsRepository: "followRequestsRepository",
	instancesRepository: "instancesRepository",
	emojisRepository: "emojisRepository",
	driveFilesRepository: "driveFilesRepository",
	driveFoldersRepository: "driveFoldersRepository",
	metasRepository: "metasRepository",
	mutingsRepository: "mutingsRepository",
	renoteMutingsRepository: "renoteMutingsRepository",
	blockingsRepository: "blockingsRepository",
	swSubscriptionsRepository: "swSubscriptionsRepository",
	hashtagsRepository: "hashtagsRepository",
	abuseUserReportsRepository: "abuseUserReportsRepository",
	registrationTicketsRepository: "registrationTicketsRepository",
	authSessionsRepository: "authSessionsRepository",
	accessTokensRepository: "accessTokensRepository",
	signinsRepository: "signinsRepository",
	subscriptionPlansRepository: "subscriptionPlansRepository",
	subscriptionStatusesRepository: "subscriptionStatusesRepository",
	pagesRepository: "pagesRepository",
	pageLikesRepository: "pageLikesRepository",
	galleryPostsRepository: "galleryPostsRepository",
	galleryLikesRepository: "galleryLikesRepository",
	moderationLogsRepository: "moderationLogsRepository",
	clipsRepository: "clipsRepository",
	clipNotesRepository: "clipNotesRepository",
	clipFavoritesRepository: "clipFavoritesRepository",
	antennasRepository: "antennasRepository",
	promoNotesRepository: "promoNotesRepository",
	promoReadsRepository: "promoReadsRepository",
	relaysRepository: "relaysRepository",
	mutedNotesRepository: "mutedNotesRepository",
	channelsRepository: "channelsRepository",
	channelFollowingsRepository: "channelFollowingsRepository",
	channelFavoritesRepository: "channelFavoritesRepository",
	registryItemsRepository: "registryItemsRepository",
	webhooksRepository: "webhooksRepository",
	adsRepository: "adsRepository",
	passwordResetRequestsRepository: "passwordResetRequestsRepository",
	retentionAggregationsRepository: "retentionAggregationsRepository",
	rolesRepository: "rolesRepository",
	roleAssignmentsRepository: "roleAssignmentsRepository",
	flashsRepository: "flashsRepository",
	flashLikesRepository: "flashLikesRepository",
	userMemosRepository: "userMemosRepository",
	userPointsRepository: "userPointsRepository",
	circlesRepository: "circlesRepository",
	eventsRepository: "eventsRepository",
	eventCirclesRepository: "eventCirclesRepository",
	//#endregion

	emojiEntityService: "EmojiEntityService",
	noteEntityService: "NoteEntityService",
	searchService: "SearchService",
	activeUsersChart: "ActiveUsersChart",
	roleService: "RoleService",
	queryService: "QueryService",
};
