import {
	ReflectiveInjector,
	type ResolvedReflectiveProvider,
	type Provider,
	type TypeProvider,
	SkipSelf,
	InjectionToken,
	type ClassProvider
} from 'injection-js'
import {
	type InjectionKey,
	inject,
	type ComponentOptions,
	provide,
	defineComponent,
	getCurrentInstance
} from 'vue'
import { propsHandler } from './props'
import { refHandler } from './ref'

export const InjectorKey: InjectionKey<ReflectiveInjector> = Symbol('ReflectiveInjector')
const MetadataKey = Symbol('Component')
const MetadataProviderKey = Symbol('ResolveProviders')
const handlerList = [refHandler]

export function Component() {
	return function (Component: any) {
		Object.defineProperty(Component, '__vccOpts', {
			enumerable: true,
			configurable: true,
			get() {
				const proto = Component.prototype
				const props = propsHandler.handler(Component)

				return defineComponent({
					name: proto.name || Component.name,
					props,
					setup(props, ctx) {
						const instance = resolveComponent(Component)
						instance.$props = props
						handlerList.forEach(handler => handler.handler(instance))

						return instance.render.bind(instance)
					}
				})
			}
		})
	}
}

export function resolveComponent(target: { new (...args: []): any }) {
	// 如果没有使用 injection-js 则不创建注入器
	if (!Reflect.getMetadata('annotations', target)) return new target()
	const parent = inject(InjectorKey, null)
	// 从缓存中拿到解析过得依赖
	let resolveProviders: ResolvedReflectiveProvider[] =
		Reflect.getOwnMetadata(MetadataProviderKey, target) || []
	const options: ComponentOptions | undefined = Reflect.getOwnMetadata(MetadataKey, target)
	if (!resolveProviders || options?.stable === false) {
		// 依赖
		let deps: Provider[] = [target]
		if (options?.providers?.length) {
			deps = deps.concat(options.providers)
		}
		// 自动解析依赖的依赖
		if (options?.autoResolveDeps !== false) {
			deps = resolveDependencies(deps)
		}
		// 排除掉某些依赖
		if (options?.exclude?.length) {
			deps = deps.filter(k => !options.exclude?.includes(k))
		}

		resolveProviders = ReflectiveInjector.resolve(deps)
		// 缓存解析过的依赖, 提高性能
		Reflect.defineMetadata(MetadataProviderKey, resolveProviders, target)
	}
	const injector = ReflectiveInjector.fromResolvedProviders(resolveProviders, parent || undefined)

	provide(InjectorKey, injector)

	const compInstance = injector.get(target)

	// 处理一下providers中的未创建实例的服务
	resolveProviders.forEach(k => injector.get(k.key.token))
	return compInstance
}

export function resolveDependencies(inputs: Provider[]) {
	// 处理抽象类
	const noConstructor: Exclude<Provider, TypeProvider | any[]>[] = []

	for (const input of inputs) {
		if (!(input instanceof Function) && !Array.isArray(input)) {
			noConstructor.push(input)
		}
	}

	const deps = new Set<Provider>()

	function resolver(klass: Provider) {
		if (deps.has(klass) || noConstructor.find(k => k !== klass && k.provide === klass)) return
		deps.add(klass)
		const resolves = ReflectiveInjector.resolve([klass])
		for (const item of resolves) {
			for (const fact of item.resolvedFactories) {
				for (const dep of fact.dependencies) {
					if (
						dep.optional ||
						dep.visibility instanceof SkipSelf ||
						dep.key.token instanceof InjectionToken ||
						typeof dep.key.token !== 'function'
					) {
						continue
					}
					resolver(dep.key.token as unknown as ClassProvider)
				}
			}
		}
	}

	for (const input of inputs) resolver(input)

	return Array.from(deps)
}
