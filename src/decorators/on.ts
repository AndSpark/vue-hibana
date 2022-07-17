import {
	onActivated,
	onBeforeMount,
	onBeforeUnmount,
	onBeforeUpdate,
	onDeactivated,
	onErrorCaptured,
	onMounted,
	onServerPrefetch,
	onUnmounted,
	onUpdated
} from 'vue'
import { createDecorator, handleDecorator } from './utils'

const lifecycle = {
	onActivated,
	onBeforeMount,
	onBeforeUnmount,
	onBeforeUpdate,
	onDeactivated,
	onErrorCaptured,
	onMounted,
	onServerPrefetch,
	onUnmounted,
	onUpdated
}

type Lifecycle =
	| 'activated'
	| 'beforeMount'
	| 'beforeUnmount'
	| 'beforeUpdate'
	| 'deactivated'
	| 'errorCaptured'
	| 'mounted'
	| 'serverPrefetch'
	| 'unmounted'
	| 'updated'

export const On: OnDecorator = createDecorator('On', true)

export interface OnDecorator {
	(lifecycle: Lifecycle | Lifecycle[]): MethodDecorator
	MetadataKey: symbol
}

function handler(targetThis: Record<any, any>) {
	handleDecorator<[Lifecycle | Lifecycle[]]>(
		targetThis,
		On.MetadataKey,
		store => {
			const { desc, args } = store
			if (!desc || !args.length) return
			args.forEach(arg => {
				arg.forEach(v => {
					if (typeof v === 'string') {
						//@ts-ignore
						lifecycle['on' + v.replace(/^\S/, e => e.toUpperCase())]?.(desc.value.bind(targetThis))
					}
					if (Array.isArray(v)) {
						v.forEach(x =>
							//@ts-ignore
							lifecycle['on' + x.replace(/^\S/, e => e.toUpperCase())]?.(
								desc.value.bind(targetThis)
							)
						)
					}
				})
			})
		},
		true
	)
}

export const onHandler = {
	key: 'On',
	handler
}
