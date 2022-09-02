const path = require('path')
const fs = require('fs')

const basePathToDataFile = path.join(__dirname, 'data')

const getJsonData = function(basePathToDataFile, fileName) {
    const fullFilePath = path.join(basePathToDataFile, fileName)
    return JSON.parse(fs.readFileSync(fullFilePath, 'utf-8'))
}

const setJsonData = function(basePathToDataFile, fileName, data){
    const fullFilePath = path.join(basePathToDataFile, fileName)
    fs.writeFileSync(fullFilePath, JSON.stringify(data))
}

const generateUUIDv4 = function(){
    var d = new Date().getTime()  //Timestamp
    var d2 = ((typeof performance !== 'undefined') && performance.now && (performance.now() * 1000)) || 0 //Time in microseconds since page-load or 0 if unsupported
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c){
        var r = Math.random() * 16 // random number between 0 and 16
        if(d > 0) { //Use timestamp until depleted
            r = (d + r) % 16 || 0
            d = Math.floor(d / 16)
        }else { //Use microseconds since page-load if supported
            r = (d2 + r) % 16 || 0
            d2 = Math.floor(d2 / 16)
        }
        return (c === 'x' ? r : (r & 0x3 | 0x9)).toString(16)
    })
}

exports.putData = function(request, response){
    const event = request.body
    const eventId = request.params.event_id
    const events = getJsonData(basePathToDataFile, 'events.json')
    const actualEvent = []
    if(Object.keys(event).length === 1){
        const modifiedEvent = events.map((event) => {
            return {
                ...event,
                isDefault: false,
            }
        })
        actualEvent = modifiedEvent.map((event) => {
            if(event.eventId === eventId){
                return {
                    ...event,
                    isDefault: true
                }
            }
            return {
                ...event
            }
        })
        setJsonData(basePathToDataFile, 'events.json', actualEvent)
    }else {
        actualEvent = events.map((eventObj) => {
            if(eventObj.eventId === eventId){
                return {
                    ...eventObj,
                    ...event
                }
            }
            return {
                ...eventObj
            }
        })
    }
    setJsonData(basePathToDataFile, 'events.json', actualEvent)
    response.status(201).send('Created')
}

exports.deleteData = function(request, response){
    const eventId = request.params.event_id
    const events = getJsonData(basePathToDataFile, 'events.json')
    const remainingEvents = events.filter((event) => event.eventId !== eventId)
    setJsonData(basePathToDataFile, 'events.json', remainingEvents)
    response.status(204).send('Request successful')
}

exports.postData = function(request, response){
    const event = request.body
    let application_name = request.query.application_name
    let program_name = request.query.program_name
    const eventData = getJsonData(basePathToDataFile, 'events.json')
    const uuidv4 = generateUUIDv4()

    if(eventData.length === 5){
        response.status(404).send({
            status: 404,
            error: {
                Errors: {
                    Error: [{
                        Description: 'Maximumn number of event raised. Max limit: 5'
                    }]
                }
            }
        })
    }else {
        eventData.push({
            ...event,
            programName: program_name,
            applicationName: application_name,
            eventId: uuidv4,
            createdDate: new Date().now(),
            lastUpdatedData: null
        })
        setJsonData(basePathToDataFile, 'events.json', eventData)
        response.status(203).send({ 'eventId': uuidv4})
    }
}

exports.getData = function(request, response) {
    const data = getJsonData(basePathToDataFile, 'events.json')
    return response.status(200).send(data)
}