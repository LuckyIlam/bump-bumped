import { writeFileSync, mkdirSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const OUT = join(__dirname, '..', 'packages', 'client', 'public', 'audio')

mkdirSync(OUT, { recursive: true })

function generateWAV(samples) {
  const numChannels = 1
  const sampleRate = 44100
  const bitsPerSample = 16
  const byteRate = sampleRate * numChannels * (bitsPerSample / 8)
  const blockAlign = numChannels * (bitsPerSample / 8)
  const dataSize = samples.length * (bitsPerSample / 8)
  const buffer = Buffer.alloc(44 + dataSize)

  let offset = 0
  buffer.write('RIFF', offset); offset += 4
  buffer.writeUInt32LE(36 + dataSize, offset); offset += 4
  buffer.write('WAVE', offset); offset += 4
  buffer.write('fmt ', offset); offset += 4
  buffer.writeUInt32LE(16, offset); offset += 4
  buffer.writeUInt16LE(1, offset); offset += 2
  buffer.writeUInt16LE(numChannels, offset); offset += 2
  buffer.writeUInt32LE(sampleRate, offset); offset += 4
  buffer.writeUInt32LE(byteRate, offset); offset += 4
  buffer.writeUInt16LE(blockAlign, offset); offset += 2
  buffer.writeUInt16LE(bitsPerSample, offset); offset += 2
  buffer.write('data', offset); offset += 4
  buffer.writeUInt32LE(dataSize, offset); offset += 4

  for (let i = 0; i < samples.length; i++) {
    const s = Math.max(-32768, Math.min(32767, Math.round(samples[i] * 32767)))
    buffer.writeInt16LE(s, offset)
    offset += 2
  }

  return buffer
}

function sineWave(freq, durationSec, sampleRate = 44100, volume = 0.5) {
  const len = Math.floor(sampleRate * durationSec)
  const samples = new Float32Array(len)
  for (let i = 0; i < len; i++) {
    const t = i / sampleRate
    const envelope = Math.min(1, (len - i) / (sampleRate * 0.05))
    samples[i] = Math.sin(2 * Math.PI * freq * t) * volume * envelope
  }
  return samples
}

function noiseBurst(durationSec, sampleRate = 44100, volume = 0.3) {
  const len = Math.floor(sampleRate * durationSec)
  const samples = new Float32Array(len)
  for (let i = 0; i < len; i++) {
    const t = i / sampleRate
    const envelope = Math.min(1, (len - i) / (sampleRate * 0.02))
    samples[i] = (Math.random() * 2 - 1) * volume * envelope
  }
  return samples
}

function frequencySweep(startFreq, endFreq, durationSec, sampleRate = 44100, volume = 0.4) {
  const len = Math.floor(sampleRate * durationSec)
  const samples = new Float32Array(len)
  for (let i = 0; i < len; i++) {
    const t = i / sampleRate
    const progress = t / durationSec
    const freq = startFreq + (endFreq - startFreq) * progress
    const envelope = Math.min(1, (len - i) / (sampleRate * 0.05))
    samples[i] = Math.sin(2 * Math.PI * freq * t) * volume * envelope
  }
  return samples
}

function multiTone(freqs, durationSec, sampleRate = 44100, volume = 0.3) {
  const len = Math.floor(sampleRate * durationSec)
  const samples = new Float32Array(len)
  for (let i = 0; i < len; i++) {
    const t = i / sampleRate
    const envelope = Math.min(1, (len - i) / (sampleRate * 0.1))
    let v = 0
    for (const f of freqs) {
      v += Math.sin(2 * Math.PI * f * t)
    }
    samples[i] = (v / freqs.length) * volume * envelope
  }
  return samples
}

const sounds = {
  'collision': sineWave(220, 0.08, 44100, 0.25),
  'boost': frequencySweep(400, 800, 0.25, 44100, 0.35),
  'elimination': noiseBurst(0.3, 44100, 0.3),
  'countdown': sineWave(440, 0.15, 44100, 0.3),
  'go': frequencySweep(500, 1000, 0.3, 44100, 0.4),
  'roundEnd': multiTone([523, 659, 784], 0.6, 44100, 0.35),
  'matchEnd': multiTone([523, 659, 784, 1047], 0.8, 44100, 0.4),
  'menuSelect': sineWave(660, 0.1, 44100, 0.25),
  'playerReady': sineWave(880, 0.12, 44100, 0.3),
}

for (const [name, samples] of Object.entries(sounds)) {
  const wav = generateWAV(samples)
  writeFileSync(join(OUT, `${name}.wav`), wav)
  console.log(`Generated ${name}.wav (${(wav.length / 1024).toFixed(1)} KB)`)
}
