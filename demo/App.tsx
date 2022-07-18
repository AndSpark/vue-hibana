import { Props } from '@/decorators/props'
import type { VueComponentProps } from '@/types'
import { Component } from '@/decorators/component'
import { Ref } from '@/decorators/ref'
import { Computed } from '@/decorators/computed'
import { On } from '@/decorators/on'
import { Service } from '@/decorators/service'
import { SkipSelf } from 'injection-js'

class ButtonProps {
	title: string = '按钮'
	xxx?: () => any
}

@Service()
class DataService {
	@Ref() dd: number = 2

	@Computed()
	get data() {
		return this.dd * 2
	}

	set data(val) {
		this.dd = val
	}
}

@Component()
class VButton {
	constructor(private dataService: DataService) {}

	@Props(ButtonProps)
	$props: VueComponentProps<ButtonProps>

	@On('mounted')
	show() {
		console.log('onom')
	}

	@On('updated')
	update() {
		console.log(this)
		console.log('upda')
	}

	handleClick() {
		console.log('click')
	}

	render() {
		return (
			<div>
				<button
					onClick={() => {
						this.dataService.dd = this.dataService.dd + 5
						this.$props.xxx?.()
					}}
				>
					{this.$props.title}
				</button>
				{this.dataService.data}
			</div>
		)
	}
}

@Component({
	providers: [DataService]
})
export default class {
	title: string = 'tltedsad'

	@Ref() data: number = 1

	render() {
		return (
			<div>
				<p>{this.data}</p>
				<VButton
					title='这是按钮'
					xxx={() => {
						this.data++
					}}
				></VButton>
				<VButton
					title={this.title}
					xxx={() => {
						this.data++
					}}
				></VButton>
			</div>
		)
	}
}
