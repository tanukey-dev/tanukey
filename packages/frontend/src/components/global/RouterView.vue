<template>
    <RouterView v-slot="{ Component }">
        <KeepAlive :max="defaultStore.state.numberOfPageCache">
            <Suspense :timeout="0">
                <component :is="Component"></component>
                <template #fallback>
                    <MkLoading />
                </template>
            </Suspense>
        </KeepAlive>
    </RouterView>
</template>
<script lang="ts" setup>
import { defaultStore } from "@/store";
import MkLoading from "./MkLoading.vue";
</script>