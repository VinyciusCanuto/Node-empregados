import http from 'node:http'
import fs from 'node:fs'

const PORT = 3333

const server = http.createServer((request, response) =>{
    const {method, url} = request

    fs.readFile('funcionarios.json', 'utf8', (err,data) =>{
        if(err){
            response.write(500, {"Content-type": "application/json"})
            response.end(JSON.stringify({message: "Erro ao buscar os dados"}))
            return
        }

        let jsonData = []

        try{
            jsonData = JSON.parse(data)
        }catch (error) {
            console.error('Erro ao ler o arquivo jsonData'+error)
        }

        if(method === "GET" && url === "/empregados"){
            fs.readFile('funcionarios.json', 'utf8', ()=>{
                if(err){
                    response.write(500, {"Content-type": "application/json"})
                    response.end(JSON.stringify({message: "Erro ao buscar os dados"}))
                    return
                }

                const jsonData = JSON.parse(data)

                response.writeHead(200, {"Content-type": "application/json"})
                response.end(JSON.stringify(jsonData))

            })
        }else if(method === "GET" && url === "/empregados/count/"){
            fs.readFile('funcionarios.json', 'utf8', (err, data)=>{
                if(err){
                    response.writeHead(500, {"Content-Type" : "application/json"})
                    response.end(JSON.stringify({message: 'Erro ao ler o arquivo'}))
                }

                const jsonData = JSON.parse(data)
                const totalFuncionarios = jsonData.length

                response.writeHead(200, {"Content-Type" : "application/json"})
                response.end(JSON.stringify({message: `Total de funcionários: ${totalFuncionarios}`}))


        })
        }else if(method === "GET" && url.startsWith("/empregados/porCargo/")){
            console.log("GET / empregados/porCargo/{cargo}")
            response.end()
        }else if(method === "GET" && url.startsWith("/empregados/porHabilidade/")){
            console.log("GET / empregados/porHabilidade")
            response.end()
        }else if(method === "GET" && url.startsWith("/empregados/porFaixaSalarial")){
            console.log("GET / empregados/porFaixaSalarial")
            response.end()
        }else if(method === "GET" && url.startsWith("/empregados/")){
            const id = parseInt(url.split('/')[2])
            fs.readFile('funcionarios.json', 'utf8', (err, data)=>{
                if(err){
                    response.writeHead(404, {"Content-Type" : "application/json"})
                    response.end(JSON.stringify({message: 'Erro ao ler o arquivo'}))
                }

                const jsonData = JSON.parse(data)
                
                const indexFuncionario= jsonData.findIndex((funcionario)=>funcionario.id === id)

                if(indexFuncionario === -1){
                    response.writeHead(404, {"Content-Type" : "application/json"})
                    response.end(JSON.stringify({message:'Funcionáiro não encontrado'}))
                    return
                }

                const funcionarioEncontrado = jsonData[indexFuncionario]

                response.writeHead(200, {"Content-Type" : "application/json"})
                response.end(JSON.stringify(funcionarioEncontrado))

            })
        }else if(method === "POST" && url === "/empregados"){
            let body = ''
            request.on('data', (chunk) =>{
                body += chunk
            })
            request.on('end', ()=>{
                const novoFuncionario = JSON.parse(body)
                novoFuncionario.id = jsonData.length + 1
                jsonData.push(novoFuncionario)

                fs.writeFile("funcionarios.json", JSON.stringify(jsonData, null, 2), (err) =>{
                    if(err) {
                        response.writeHead(500, {"Content-Type": "application/json"})
                        response.end(JSON.stringify({message: 'Erro interno no Servidor'}))
                        return
                    }

                    response.writeHead(201, {"Content-Type": "application/json"})
                    response.end(JSON.stringify(novoFuncionario))
                } )
            })
        }else if(method === "PUT" && url.startsWith ("/empregados/")){
            console.log("PUT /empregados/{id}")
            response.end()
        }else if(method === "DELETE" && url.startsWith ("/empregados/")){
            console.log("DELETE /empregados/{id}")
            response.end()
        }
    })
})


server.listen(PORT, () =>{
    console.log(`Servidor on PORT ${PORT} 😊`)
})