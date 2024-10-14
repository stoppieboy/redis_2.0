const Parser = require('redis-parser')

const store = {}

function getConfig(connection, store) {
    const config = {
        returnReply: (reply) => {
            const command = reply[0]
            switch(command){
                case 'set': {
                    const key = reply[1]
                    const value = reply[2]
                    store[key] = value;
                    connection.write("+OK\r\n");
                }
                break;
                case 'get': {
                    const key = reply[1]
                    const value = store[key]
                    if (!value){
                        connection.write(`$-1\r\n`)
                    }else{
                        if(typeof value === 'number'){
                            connection.write(`:${value}\r\n`)
                        }else{
                            connection.write(`$${value.length}\r\n${value}\r\n`)
                        }
                    }
                }
                break;
                case 'incr':
                case 'INCR': {
                    const key = reply[1]
                    var value = store[key]
                    if(!value){
                        connection.write('$-1\r\n')
                    }else{
                        value++;
                        if(isNaN(value)){
                            store[key] = '1'
                            connection.write(`:${store[key]}\r\n`)
                        }else{
                            store[key] = (++store[key]).toString()
                            connection.write(`:${store[key]}\r\n`)
                        }
                    }
                }
                break;
                case 'del':
                case 'DEL':{
                    const key = reply[1]
                    const key2 = reply[2]
                    console.log(key2)
                    var value = store[key]
                    if(!value){
                        connection.write(`$-1\r\n`)
                    }else{
                        delete store[key]
                        connection.write(`:1\r\n`)
                    }
                }
                break;
                case 'copy':
                case 'COPY': {
                    const key = reply[1]
                    const key2 = reply[2]
                    var value = store[key2]
                    if(value){
                        connection.write(`:0\r\n`)
                    }else{
                        store[key2] = store[key]
                        connection.write(':1\r\n')
                    }
                }
                break;
                case 'COMMAND': {
                    connection.write("+OK\r\n");
                }
                break;
                default: {
                    connection.write("-UNKNOWN\r\n")
                }
            }
        },
        returnError: (err) => {
            console.log('=>', err)
        },
    }
    
    return config
}

function Custom_parser(connection) {
    
    const parser = new Parser(getConfig(connection, store))
    
    return parser;
    
}

module.exports = Custom_parser
exports.store = store