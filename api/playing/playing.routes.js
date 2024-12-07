import express from 'express'
import {  getPlayingArray, addPlaying, updatePlaying, removePlaying, addPlayingNote, removePlayingNote } from './playing.controller.js'

const router = express.Router()

router.get('/', getPlayingArray )
router.put('/:playingId', updatePlaying )//requireAuth
router.post('/', addPlaying ) //requireAuth
router.delete('/:playingId', removePlaying ) //requireAuth

router.post('/:playingId/note', addPlayingNote) //requireAuth
router.delete('/:playingId/note/:noteId', removePlayingNote) //requireAuth

export const playingRoutes = router