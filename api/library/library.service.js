import { dbService } from "../../services/db.service.js"
import { loggerService } from "../../services/logger.service.js"
import { ObjectId } from 'mongodb'
import { utilService } from "../../services/util.service.js"
import { msgService } from "../msg/msg.service.js"

export const libraryService = {
    query,
    getById, 
    remove, 
    add, 
    update,
    addLibraryNote,
    removeLibraryNote
}

const PAGE_SIZE = 2

async function query( filterBy = { search: ''}){

    
    try{

        const criteria = _buildCriteria(filterBy)
        loggerService.info('query for the following criteria', criteria)

        const sort = _buildSort(filterBy)

        const collection = await dbService.getCollection('library')
        var libraryCursor = await collection.find( criteria, {sort}) //skip, limit if we prefer...
    
    
        if (filterBy.pageIdx !== undefined) {  
            libraryCursor.skip(filterBy.pageIdx * PAGE_SIZE).limit(PAGE_SIZE)
        }
    
        const librarys = await libraryCursor.toArray()
        return librarys

    } catch (err){
        loggerService.error("Cannot get librarys", err)
        throw new Error ('Could not get librarys')
    }
}

async function getById( libraryId ){
    try{
        var criteria = { _id: ObjectId.createFromHexString(libraryId)}
        const collection = await dbService.getCollection('library')
        const library = await collection.findOne(criteria)
        if( ! library) throw new Error ( 'could not find library')
        library.createdAt = library._id.getTimestamp()

        criteria = { aboutLibraryId: new ObjectId(libraryId)}

        library.relatedMessages = await msgService.query(criteria)
        library.relatedMessages = library.relatedMessages.map(message =>{
            delete message.aboutLibrary
            return message
        })
        console.log('library.relatedMessages:', library.relatedMessages)
        return library
    } catch (err ){
        loggerService.error(`could not find library : ${libraryId}`, err)
        throw new Error ('could not find library')
    }
} 

async function remove( libraryId){
    try{
        loggerService.debug('libraryId:', libraryId)

        const criteria = { id :  libraryId}
        const collection = await dbService.getCollection('library')
        const res =  await collection.deleteOne(criteria )
        
        if ( res.deletedCount === 0 ) throw  new Error ("Not Your Library")
        return libraryId
    } catch (err ){
        loggerService.error(`could not remove library : ${libraryId}`, err)
        throw new Error ("could not remove library")
    }
} 

async function update( library ){

    const libraryToSave = {title : library.title , description: library.description , severity : library.severity}

    try {    
        const criteria = { _id: ObjectId.createFromHexString(library._id)}
        const collection = await dbService.getCollection('library')
        await collection.updateOne(criteria , { $set: libraryToSave })
        return library
        
    } catch (err) {
        loggerService.error(`could not save library: ${library._id}`, err)
        throw  new Error ("could not save library")
    }
}

async function add( libraryToSave ){
    try {        
        const collection = await dbService.getCollection('library')
        await collection.insertOne(libraryToSave)
        console.log('libraryToSave:213123213', libraryToSave)
        return libraryToSave
    } catch (err) {
        loggerService.error("could not save library", err)
        throw  new Error ("could not save library")
    }
}

async function addLibraryNote( libraryId, note ){
    try {        
        const criteria = {_id : ObjectId.createFromHexString(libraryId)}
        note.id = utilService.makeId()

        const collection = await dbService.getCollection('library')
        await collection.updateOne(criteria, { $push: { notes: note } })
        return libraryToSave
    } catch (err) {
        loggerService.error("could not save library note", err)
        throw  new Error ("could not save library note")
    }
}

async function removeLibraryNote( libraryId, noteId){
    try{
        const criteria = { _id : ObjectId.createFromHexString( libraryId)}
        
        const collection = await dbService.getCollection('library')
        await collection.updateOne(criteria , {$pull : { notes : { id : noteId }}})
        
        return noteId
    } catch (err ){
        loggerService.error(`could not remove library note : ${libraryId}`, err)
        throw new Error ("could not remove library note")
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