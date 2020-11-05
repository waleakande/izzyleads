import { mount } from '@vue/test-utils'
import Logo from '@/components/Logo.vue'
import Home from '@/pages/index.vue'

describe('Logo', () => {
  test('is a Vue instance', () => {
    const wrapper = mount(Logo)
    expect(wrapper.vm).toBeTruthy()
  })
  test('title is frontend', () => {
    const wrapper = mount(Home)
    const title = wrapper.vm.$el.querySelector('.title')
    expect(title.textContent).toMatch(/frontend/)
  })
})
