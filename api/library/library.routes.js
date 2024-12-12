import express from 'express'
import {  getLibraryArray, addLibrary, updateLibrary, removeLibrary } from './library.controller.js'

const router = express.Router()

router.get('/', getLibraryArray )
router.put('/:libraryId', updateLibrary )//requireAuth
router.post('/', addLibrary ) //requireAuth
router.delete('/:libraryId', removeLibrary ) //requireAuth

export const LibraryRoutes = router