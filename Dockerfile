# syntax = docker/dockerfile:1.4

ARG NODE_VERSION=20

# build assets & compile TypeScript

FROM --platform=$BUILDPLATFORM node:${NODE_VERSION} AS native-builder

RUN --mount=type=cache,target=/var/cache/apt,sharing=locked \
	--mount=type=cache,target=/var/lib/apt,sharing=locked \
	rm -f /etc/apt/apt.conf.d/docker-clean \
	; echo 'Binary::apt::APT::Keep-Downloaded-Packages "true";' > /etc/apt/apt.conf.d/keep-cache \
	&& apt-get update \
	&& apt-get install -yqq --no-install-recommends \
	build-essential

RUN corepack enable

WORKDIR /tanukey

COPY --link pnpm-lock.yaml ./
RUN --mount=type=cache,target=/root/.local/share/pnpm/store,sharing=locked \
	pnpm fetch --ignore-scripts

COPY --link ["pnpm-workspace.yaml", "package.json", "./"]
COPY --link ["scripts", "./scripts"]
COPY --link ["packages/backend/package.json", "./packages/backend/"]
COPY --link ["packages/frontend/package.json", "./packages/frontend/"]
COPY --link ["packages/sw/package.json", "./packages/sw/"]
COPY --link ["packages/misskey-js/package.json", "./packages/misskey-js/"]

RUN pnpm i --frozen-lockfile --aggregate-output \
	&& pnpm rebuild -r

COPY --link . ./

ARG NODE_ENV=production

RUN git submodule update --init
RUN pnpm build
RUN rm -rf .git/

# build native dependencies for target platform

FROM --platform=$TARGETPLATFORM node:${NODE_VERSION} AS target-builder

RUN apt-get update \
	&& apt-get install -yqq --no-install-recommends \
	build-essential

RUN corepack enable

WORKDIR /tanukey

COPY --link pnpm-lock.yaml ./
RUN --mount=type=cache,target=/root/.local/share/pnpm/store,sharing=locked \
	pnpm fetch --ignore-scripts

COPY --link ["pnpm-workspace.yaml", "package.json", "./"]
COPY --link ["scripts", "./scripts"]
COPY --link ["packages/backend/package.json", "./packages/backend/"]
COPY --link ["packages/misskey-js/package.json", "./packages/misskey-js/"]

RUN pnpm i --frozen-lockfile --aggregate-output \
	&& pnpm rebuild -r

FROM --platform=$TARGETPLATFORM node:${NODE_VERSION}-slim AS runner

ARG UID="991"
ARG GID="991"

RUN apt-get update \
	&& apt-get install -y --no-install-recommends \
	ffmpeg tini curl libjemalloc-dev libjemalloc2 \
	&& ln -s /usr/lib/$(uname -m)-linux-gnu/libjemalloc.so.2 /usr/local/lib/libjemalloc.so \
	&& corepack enable \
	&& groupadd -g "${GID}" tanukey \
	&& useradd -l -u "${UID}" -g "${GID}" -m -d /tanukey tanukey \
	&& find / -type d -path /sys -prune -o -type d -path /proc -prune -o -type f -perm /u+s -ignore_readdir_race -exec chmod u-s {} \; \
	&& find / -type d -path /sys -prune -o -type d -path /proc -prune -o -type f -perm /g+s -ignore_readdir_race -exec chmod g-s {} \; \
	&& apt-get clean \
	&& rm -rf /var/lib/apt/lists

USER tanukey
WORKDIR /tanukey

COPY --chown=tanukey:tanukey --from=target-builder /tanukey/node_modules ./node_modules
COPY --chown=tanukey:tanukey --from=target-builder /tanukey/packages/backend/node_modules ./packages/backend/node_modules
COPY --chown=tanukey:tanukey --from=target-builder /tanukey/packages/misskey-js/node_modules ./packages/misskey-js/node_modules
COPY --chown=tanukey:tanukey --from=native-builder /tanukey/built ./built
COPY --chown=tanukey:tanukey --from=native-builder /tanukey/packages/misskey-js/built ./packages/misskey-js/built
COPY --chown=tanukey:tanukey --from=native-builder /tanukey/packages/backend/built ./packages/backend/built
COPY --chown=tanukey:tanukey --from=native-builder /tanukey/fluent-emojis /tanukey/fluent-emojis
COPY --chown=tanukey:tanukey . ./

RUN corepack pack

ENV LD_PRELOAD=/usr/local/lib/libjemalloc.so
ENV MALLOC_CONF=background_thread:true,metadata_thp:auto,dirty_decay_ms:30000,muzzy_decay_ms:30000
ENV NODE_ENV=production
ENV COREPACK_ENABLE_NETWORK=0
HEALTHCHECK --interval=5s --retries=20 CMD ["/bin/bash", "/tanukey/healthcheck.sh"]
ENTRYPOINT ["/usr/bin/tini", "--"]
CMD ["pnpm", "run", "migrateandstart:docker"]