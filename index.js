const net = require('node:net')
const Parser = require('redis-parser')
const PORT = 8000

const store = {}

const server = net.createServer(connection => {
    console.log("Client connected...")

    connection.on('data', data => {

        const parser = new Parser({
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
                            connection.write(`$${value.length}\r\n${value}\r\n`)
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
        })
        parser.execute(data)
        console.log("=>", data.toString())
        // connection.write("+OK\r\n");
    })


})

server.listen(PORT, () => console.log(`Custom redis server running on port ${PORT}`));