import { Injectable } from 'injection-js'
import { computedHandler } from './computed'
import { onHandler } from './on'
import { refHandler } from './ref'
import { watchHandler } from './watch'
import { watchEffectHandler } from './watchEffect'

const handlerList = [refHandler, computedHandler, watchHandler, watchEffectHandler, onHandler]

export function Service() {
	return function classDecorator<T extends { new (...args: any[]): {} }>(constructor: T) {
		return class extends constructor {
			constructor(...args: any[]) {
				super()
				handlerList.forEach(handler => handler.handler(this))
			}
		}
	}
}
