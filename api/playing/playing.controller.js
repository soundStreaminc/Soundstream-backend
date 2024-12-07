import { loggerService } from "../../services/logger.service.js"
import { playingService } from "./playing.service.js"

export async function getPlayingArray (req, res){
    const { search, sortBy, pageIdx } = req.query
    const filterBy = { search, sortBy, pageIdx: +pageIdx || undefined } //to cast to numbers if the filter is int
    try{
        const playings = await playingService.query( filterBy )
        res.send(playings)
        
    } catch (err ){
        return res.status(400).send("Could not get playings")
    }
}

export async function updatePlaying (req, res) {
    const {loggedinUser} = req
    const {_id, title, description, severity } = req.body
    const playingToSave = {
        _id,
        title,
        description,
        severity: +severity
    }

    try {
        const savedPlaying = await playingService.update( playingToSave , loggedinUser)
        res.send(savedPlaying)
    } catch (err) {
        return res.status(400).send("Could not update playing")
    }
}

export async function addPlaying  (req, res)  {
    const {loggedinUser, body: playing} = req
    
    try {
        playing.owner = loggedinUser
        const savedPlaying = await playingService.add( playing )
        res.json(savedPlaying)
    } catch (err) {
        loggerService.error('Cannot add playing', err)
        return res.status(400).send("Could not add playing")
    }
}

export async function getPlaying  (req, res) {
    const {playingId} = req.params
    const { visitedPlayingIds = [] } = req.cookies
    if (!visitedPlayingIds.includes(playingId)){
        res.cookie('visitPlaying', [...visitedPlayingIds, playingId], {maxAge: 7 * 1000 })
    }
    if (visitedPlayingIds.length > 1) return res.status(401).send('Wait for a bit')
       
    try{
        const playing = await playingService.getById ( playingId )
        res.send(playing )

    } catch (err ){
        loggerService.error('Cannot get playing', err)
        res.status(400).send("Cannot get playing")
    }
   
}

export async function removePlaying  (req, res)  {
    const {loggedinUser} = req

    const {playingId} = req.params
    try{
        await playingService.remove( playingId , loggedinUser )
        res.send('OK')
    } catch (err ){
        loggerService.error(`removePlaying failed: ${err}`)
        res.status(400).send("Cannot remove playing")

    }
}

export async function addPlayingNote  (req, res)  {
    const {loggedinUser} = req

    try {
        const playingId = req.params._id
        const note = {
            text: req.body.text,
            by: loggedinUser,
        }
        const savedNote = await playingService.addPlayingNote( playingId , note)
        res.json(savedNote)
    } catch (err) {
        loggerService.error(`add playing note failed: ${err}`)
        return res.status(400).send("Could not add playing note")
    }
}

export async function removePlayingNote  (req, res)  {
    try{
        const {playingId, noteId} = req.params

        const removedOd = await playingService.removePlayingNote( playingId , noteId )
        res.send(removedOd)
    } catch (err ){
        loggerService.error(`failed to remove playing note: ${err}`)
        res.status(400).send("Cannot remove playing note")
    }
}
