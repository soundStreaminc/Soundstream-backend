import { loggerService } from "../../services/logger.service.js"
import { libraryService } from "./library.service.js"

export async function getLibraryArray (req, res){
    const { search, sortBy, pageIdx } = req.query
    const filterBy = { search, sortBy, pageIdx: +pageIdx || undefined } //to cast to numbers if the filter is int
    try{
        const librarys = await libraryService.query( filterBy )
        res.send(librarys)
        
    } catch (err ){
        return res.status(400).send("Could not get librarys")
    }
}

export async function updateLibrary (req, res) {
    const {loggedinUser} = req
    const {_id, title, description, severity } = req.body
    const libraryToSave = {
        _id,
        title,
        description,
        severity: +severity
    }

    try {
        const savedLibrary = await libraryService.update( libraryToSave , loggedinUser)
        res.send(savedLibrary)
    } catch (err) {
        return res.status(400).send("Could not update library")
    }
}

export async function addLibrary  (req, res)  {
    const {body: library} = req
    
    try {
        const savedLibrary = await libraryService.add( library )
        res.json(savedLibrary)
    } catch (err) {
        loggerService.error('Cannot add library', err)
        return res.status(400).send("Could not add library")
    }
}

export async function getLibrary  (req, res) {
    const {libraryId} = req.params
    const { visitedLibraryIds = [] } = req.cookies
    if (!visitedLibraryIds.includes(libraryId)){
        res.cookie('visitLibrary', [...visitedLibraryIds, libraryId], {maxAge: 7 * 1000 })
    }
    if (visitedLibraryIds.length > 1) return res.status(401).send('Wait for a bit')
       
    try{
        const library = await libraryService.getById ( libraryId )
        res.send(library )

    } catch (err ){
        loggerService.error('Cannot get library', err)
        res.status(400).send("Cannot get library")
    }
   
}

export async function removeLibrary  (req, res)  {
    const {libraryId} = req.params
    try{
        await libraryService.remove( libraryId )
        res.send('OK')
    } catch (err ){
        loggerService.error(`removeLibrary failed: ${err}`)
        res.status(400).send("Cannot remove library")

    }
}

export async function addLibraryNote  (req, res)  {
    const {loggedinUser} = req

    try {
        const libraryId = req.params._id
        const note = {
            text: req.body.text,
            by: loggedinUser,
        }
        const savedNote = await libraryService.addLibraryNote( libraryId , note)
        res.json(savedNote)
    } catch (err) {
        loggerService.error(`add library note failed: ${err}`)
        return res.status(400).send("Could not add library note")
    }
}

export async function removeLibraryNote  (req, res)  {
    try{
        const {libraryId, noteId} = req.params

        const removedOd = await libraryService.removeLibraryNote( libraryId , noteId )
        res.send(removedOd)
    } catch (err ){
        loggerService.error(`failed to remove library note: ${err}`)
        res.status(400).send("Cannot remove library note")
    }
}
