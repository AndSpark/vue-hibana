import { Props } from '@/decorators/props'
import type { VueComponentProps } from '@/types'
import { Component } from '@/decorators/component'
import { Ref } from '@/decorators/ref'
import { ref } from 'vue'

class ButtonProps {
	title: string = '按钮'
	onClick?: () => any
}

@Component()
class VButton {
	@Props(ButtonProps)
	$props: VueComponentProps<ButtonProps>

	@Ref() dd: number = 2

	render() {
		return <button onClick={this.$props.onClick}>{this.$props.title}</button>
	}
}

@Component()
export default class {
	title: string = 'tltedsad'

	@Ref() data: number = 1

	render() {
		return (
			<div>
				<p>{this.data}</p>
				<VButton
					title='这是按钮'
					onClick={() => {
						this.data++
						console.log(this.data)
					}}
				></VButton>
			</div>
		)
	}
}
