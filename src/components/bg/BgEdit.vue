<template>
  <div ref="glele" class="overflow-hidden"></div>
</template>

<script setup>
import { Renderer, Program, Mesh, Color, Triangle } from "ogl"
import { onBeforeUnmount, onMounted, ref, nextTick } from 'vue'

// Original from https://www.shadertoy.com/view/tdG3Rd
// Created by trinketMage in 2019-10-10
import vert from './vert.glsl?raw'
import frag from './fragEdit.glsl?raw'

const glele = ref(null)
let gl
let ctn
let animateId
let renderer

const resize = () => {
  const scale = 1
  nextTick(() => {
    renderer.setSize(ctn.offsetWidth * scale, ctn.offsetHeight * scale)
  })
}

onMounted(() => {
  ctn = glele.value
  renderer = new Renderer()
  gl = renderer.gl
  gl.clearColor(1, 1, 1, 1)
  window.addEventListener('resize', resize, false)
  resize()

  setTimeout(() => {
    resize()
  }, 100)

  const geometry = new Triangle(gl)

  const program = new Program(gl, {
    vertex: vert,
    fragment: frag,
    uniforms: {
      uTime: { value: 0 },
      uColor: { value: new Color(0.3, 0.2, 0.5) },
      uResolution: {
        value: new Color(
          gl.canvas.width,
          gl.canvas.height,
          gl.canvas.width / gl.canvas.height
        )
      }
    }
  })

  const mesh = new Mesh(gl, { geometry, program })

  animateId = requestAnimationFrame(update)

  function update(t) {
    animateId = requestAnimationFrame(update)

    program.uniforms.uTime.value = t * 0.002

    // Don't need a camera if camera uniforms aren't required
    renderer.render({ scene: mesh })
  }

  ctn.appendChild(gl.canvas)
})

onBeforeUnmount(() => {
  window.cancelAnimationFrame(animateId)
  window.removeEventListener('resize', resize)
  ctn.removeChild(gl.canvas)
  gl.getExtension("WEBGL_lose_context")?.loseContext()
})
</script>
