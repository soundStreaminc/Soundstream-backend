import express from 'express'
import { getPlaying, getPlayingArray, addPlaying, updatePlaying, removePlaying, addPlayingNote, removePlayingNote, getAudioById } from './playing.controller.js'

const router = express.Router()

router.get('/', getPlayingArray )
router.get('/:playingId', getPlaying )
router.get('/getAudio/:playingId', getAudioById )
router.put('/:playingId', updatePlaying )//requireAuth
router.post('/', addPlaying ) //requireAuth
router.delete('/:playingId', removePlaying ) //requireAuth

router.post('/:playingId/note', addPlayingNote) //requireAuth
router.delete('/:playingId/note/:noteId', removePlayingNote) //requireAuth

export const playingRoutes = router