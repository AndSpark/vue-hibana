import { defineConfig } from 'vite'
import vueJsx from '@vue3-oop/plugin-vue-jsx'
import vue from '@vitejs/plugin-vue'

export default defineConfig(({ command, mode }) => {
	return {
		plugins:
			command === 'build'
				? undefined
				: [vue(), vueJsx({ enableObjectSlots: false, slotStable: true })],
		resolve: {
			alias: [
				{ find: /^~/, replacement: '' },
				{ find: '@/', replacement: '/src/' }
			]
		},
		server: {
			open: '/'
		}
	}
})
