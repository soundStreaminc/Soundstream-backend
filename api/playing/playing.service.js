import { dbService } from "../../services/db.service.js"
import { loggerService } from "../../services/logger.service.js"
import { ObjectId } from 'mongodb'
import { utilService } from "../../services/util.service.js"
import { msgService } from "../msg/msg.service.js"

export const playingService = {
    query,
    getById, 
    remove, 
    add, 
    update,
    addPlayingNote,
    removePlayingNote
}

const PAGE_SIZE = 2

async function query( filterBy = { search: ''}){

    
    try{

        const criteria = _buildCriteria(filterBy)
        loggerService.info('query for the following criteria', criteria)

        const sort = _buildSort(filterBy)

        const collection = await dbService.getCollection('playing')
        var playingCursor = await collection.find( criteria, {sort}) //skip, limit if we prefer...
    
    
        if (filterBy.pageIdx !== undefined) {  
            playingCursor.skip(filterBy.pageIdx * PAGE_SIZE).limit(PAGE_SIZE)
        }
    
        const playings = await playingCursor.toArray()
        return playings

    } catch (err){
        loggerService.error("Cannot get playings", err)
        throw new Error ('Could not get playings')
    }
}

async function getById( playingId ){
    try{
        var criteria = { _id: ObjectId.createFromHexString(playingId)}
        const collection = await dbService.getCollection('playing')
        const playing = await collection.findOne(criteria)
        if( ! playing) throw new Error ( 'could not find playing')
        playing.createdAt = playing._id.getTimestamp()

        criteria = { aboutPlayingId: new ObjectId(playingId)}

        playing.relatedMessages = await msgService.query(criteria)
        playing.relatedMessages = playing.relatedMessages.map(message =>{
            delete message.aboutPlaying
            return message
        })
        console.log('playing.relatedMessages:', playing.relatedMessages)
        return playing
    } catch (err ){
        loggerService.error(`could not find playing : ${playingId}`, err)
        throw new Error ('could not find playing')
    }
} 

async function remove( playingId){
    try{

        const criteria = { id :  playingId}
        
        const collection = await dbService.getCollection('playing')
        const res =  await collection.deleteOne(criteria )
        
        if ( res.deletedCount === 0 ) throw  new Error ("Not Your Playing")
        return playingId
    } catch (err ){
        loggerService.error(`could not remove playing : ${playingId}`, err)
        throw new Error ("could not remove playing")
    }
} 

async function update( playing ){

    const playingToSave = {title : playing.title , description: playing.description , severity : playing.severity}

    try {    
        const criteria = { _id: ObjectId.createFromHexString(playing._id)}
        const collection = await dbService.getCollection('playing')
        await collection.updateOne(criteria , { $set: playingToSave })
        return playing
        
    } catch (err) {
        loggerService.error(`could not save playing: ${playing._id}`, err)
        throw  new Error ("could not save playing")
    }
}

async function add( playingToSave ){
    try {        
        const collection = await dbService.getCollection('playing')
        await collection.insertOne(playingToSave)
        console.log('playingToSave:213123213', playingToSave)
        return playingToSave
    } catch (err) {
        loggerService.error("could not save playing", err)
        throw  new Error ("could not save playing")
    }
}

async function addPlayingNote( playingId, note ){
    try {        
        const criteria = {_id : ObjectId.createFromHexString(playingId)}
        note.id = utilService.makeId()

        const collection = await dbService.getCollection('playing')
        await collection.updateOne(criteria, { $push: { notes: note } })
        return playingToSave
    } catch (err) {
        loggerService.error("could not save playing note", err)
        throw  new Error ("could not save playing note")
    }
}

async function removePlayingNote( playingId, noteId){
    try{
        const criteria = { _id : ObjectId.createFromHexString( playingId)}
        
        const collection = await dbService.getCollection('playing')
        await collection.updateOne(criteria , {$pull : { notes : { id : noteId }}})
        
        return noteId
    } catch (err ){
        loggerService.error(`could not remove playing note : ${playingId}`, err)
        throw new Error ("could not remove playing note")
    }
} 

function _buildCriteria(filterBy){
    if(!filterBy.search) return {}
    const criteria = {
    title: { $regex: filterBy.search, $options: 'i'},
    //severity: { $gte: filterBy.}
    }
    return criteria
}

function _buildSort(filterBy){
    if (!filterBy.sortBy) return {}
    return { [filterBy.sortBy] : filterBy.sortDir }
}