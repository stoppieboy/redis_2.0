const net = require('node:net')
const Parser = require('./parser')
const PORT = 8000

const server = net.createServer(connection => {
    console.log("Client connected...")

    connection.on('data', data => {

        const parser = Parser(connection)
        parser.execute(data)
        console.log("=>", data.toString())
        // connection.write("+OK\r\n");
    })


})

server.listen(PORT, () => console.log(`Custom redis server running on port ${PORT}`));