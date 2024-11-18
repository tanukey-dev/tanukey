// https://vitejs.dev/config/build-options.html#build-modulepreload
import "vite/modulepreload-polyfill";

import "@/style.scss";
import { mainBoot } from "./boot/main-boot";

mainBoot();
