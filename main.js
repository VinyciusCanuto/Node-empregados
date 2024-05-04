import http from 'node:http'
import fs from 'node:fs';
import lerDadosFuncionarios from './Funcionarios.js'

const PORT = 3333

const server = http.createServer((request, response) => {
    const {method, url} = request

    //CORS 

    response.setHeader('Access-Control-Allow-Origin', '*');
    response.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
    response.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    fs.readFile("empregados.json", 'utf8', (err, data) => {
        if(err){
            response.writeHead(500, {'Content-Type':'application/json'})
            response.end(JSON.stringify({message: 'Erro ao buscar os dados'}))
            return;
        }
        let jsonData = [];
        try{
            jsonData = JSON.parse(data)
        }catch(error){
            console.error('Erro ao ler o arquivo jsonData'+error)
        }
        if(url === '/empregados' && method === "GET"){ // listar todos os funcionários cadastrados
            lerDadosFuncionarios((err, funcionario) => {
                if(err) {
                    response.writeHead(500, {'Contet-Type':'application/json'})
                    response.end(JSON.stringify({message: 'Erro ao ler o arquivo'}))
                }
                response.writeHead(200, {'Contet-Type':'application/json'})
                response.end(JSON.stringify(funcionario))
            })
        }
        else if(url === '/empregados/count' && method === "GET"){ // contar o número total de funcionários cadastrados
            lerDadosFuncionarios((err, funcionario) => {
                if(err) {
                    response.writeHead(500, {'Contet-Type':'application/json'})
                    response.end(JSON.stringify({message: 'Erro ao ler o arquivo'}))
                }
                const jsonData = JSON.parse(data)
                const totalEmpregados = jsonData.length

                response.writeHead(200, {'Content-Type':'application/json'})
                response.end(JSON.stringify(totalEmpregados, funcionario))
            })
        }
        else if(url.startsWith('/empregados/porCargo/') && method === "GET"){ // listar todos os funcionários de um determinado cargo
        //localhost:3333/empregados/porCargo/dev
            const cargo = url.split('/')[3]
            lerDadosFuncionarios((err, funcionario) => {
                if(err) {
                    response.writeHead(500, {'Contet-Type':'application/json'})
                    response.end(JSON.stringify({message: 'Funcionario nao encontrado'}))
                }
                const jsonData = JSON.parse(data);

                const funcionarioPorCargo = jsonData.filter((funcionario)=> funcionario.cargo === cargo);

                if(funcionarioPorCargo.length === 0){
                    response.writeHead(404, {'Content-Type': 'application/json'})
                    response.end(JSON.stringify(funcionario))
                    return
                }
                
                response.writeHead(200, {'Content-Type': 'application/json'})
                response.end(JSON.stringify(funcionarioPorCargo))
            })
            
            response.end(cargo)

        }
        else if(url.startsWith('/empregados/porHabilidade/') && method === "GET"){ // listar todos os funcionários que possuam uma determinada habilidade
            const habilidade = url.split('/')[3]

            lerDadosFuncionarios((err, funcionario) => {
                if(err) {
                    response.writeHead(500, {'Contet-Type':'application/json'})
                    response.end(JSON.stringify({message: 'Erro ao ler o arquivo'}))
                }

                const jsonData = JSON.parse(data);

                const funcionarioPorHabilidade = jsonData.filter(
                    (funcionario) => funcionario.habilidades.inclues(habilidade)
                )
                if(funcionarioPorHabilidade.length === 0){
                    response.writeHead(404, {'Content-Type': 'application/json'})
                    response.end(JSON.stringify({message: 'Não existe funcinário com tal habilidade'}))
                    return;
                }
                response.writeHead(200, {'Content-Type': 'application/json'})
                response.end(JSON.stringify(funcionarioPorHabilidade))
            })

            //console.log('GET /empregados/porHabilidade/{habilidade}')
            response.end()

        }
        else if(url.startsWith('/empregados/porFaixaSalarial') && method === "GET"){ // listar todos os funcionários dentro de uma faixa salarial especificada
            /*Requisições
                boby -> JSON -> POST
                ROUTE PARAM -> porHabilidade/ValorEnviado -> PUT, DELETE, PATH, GET
                QUERY PARAM -> porFaixaSalarial?valor1=10&valor2=20
            */

            const urlParams = new URLSearchParams(url.split('?')[1])
            const minSalario = urlParams.get('minSalario')
            const maxSalario = urlParams.get('maxSalario')
            console.log(minSalario, maxSalario)

            lerDadosFuncionarios((err, funcionario) => {
                if(err) {
                    response.writeHead(500, {'Contet-Type':'application/json'})
                    response.end(JSON.stringify({message: 'Erro ao ler o arquivo'}))
                }

                const jsonData = JSON.parse(data);

                const funcionarioPorFaixaSalarial = jsonData.filter((funcionario)=>funcionario.salario >= minSalario && funcionario.salario <= maxSalario)

                if(funcionarioPorFaixaSalarial.length === 0){
                    response.writeHead(404, {'Content-Type': 'application/json'})
                    response.end(JSON.stringify({message: 'Não existe funcioário com essa faixa salarial'}))
                    return;
                }
                response.writeHead(200, {'Content-Type': 'application/json'})
                response.end(JSON.stringify(funcionarioPorFaixaSalarial))
            });

            
            //console.log('GET /empregados/porFaixaSalarial?min={min}&max={max}')
            

        }
        else if(url.startsWith('/empregados/') && method === "GET"){ // detalhes de um funcionário específico com base em seu ID
            const id = parseInt(url.split('/')[2])
            lerDadosFuncionarios((err, funcionario) => {
                if(err) {
                    response.writeHead(500, {'Contet-Type':'application/json'})
                    response.end(JSON.stringify({message: 'Erro ao ler o arquivo'}))
                }
                const jsonData = JSON.parse(data)
                const indexEmpregado = jsonData.findIndex((empregado) => empregado.id === id)

                if(indexEmpregado === -1){
                    response.writeHead(404, {'Content-Type':'application/json'})
                    response.end(JSON.stringify({message: 'Usuário não encontrado'}))
                    return
                }
                const empregadoEncontrado = jsonData[indexEmpregado]
                response.writeHead(200, {'Content-Type':'application/json'})
                response.end(JSON.stringify(empregadoEncontrado))
            })
        }
        else if(url === '/empregados' && method === "POST"){ // cadastrar um novo funcionário
            let body = ''
            request.on('data', (chunk) => {
                body += chunk
            })
            request.on('end', () => {
                const novoEmpregado = JSON.parse(body)
                novoEmpregado.id = jsonData.length + 1
                jsonData.push(novoEmpregado)

                fs.writeFile("empregados.json", JSON.stringify(jsonData, null, 2), (err) => {
                    if(err){
                        response.writeHead(500, {'Content-Type':'application/json'})
                        response.end(JSON.stringify({message: 'Erro interno no servidor'}))
                        return
                    }
                    response.writeHead(201, {'Content-Type':'application/json'})
                    response.end(JSON.stringify(novoEmpregado))
                })
        })
        }
        else if(url.startsWith('/empregados/') && method === "PUT"){ // atualizar as informações de um funcionário específico com base em seu ID
            const id = parseInt(url.split('/')[2])

            let body = ''
        request.on('data', (chunk)=>{
            body += chunk
        })
        request.on('end', ()=>{
            fs.readFile('empregados.json', 'utf8', (err, data) => {
                if(err){
                    response.writeHead(500, {'Contet-Type':'application/json'})
                    response.end(JSON.stringify({message: 'Erro ao ler o arquivo'}))
                }
                const jsonData = JSON.parse(data)
                const indexFuncionario = jsonData.findIndex((funcionario)=> funcionario.id === id)

                if(indexFuncionario === -1){
                    response.writeHead(404, {'Content-Type':'application/json'})
                    response.end(JSON.stringify({message: 'Funcionário não encontrado!'}))
                }

                const funcionarioAtualizado = JSON.parse(body)
                funcionarioAtualizado.id = id

                jsonData[indexFuncionario] = funcionarioAtualizado

                fs.writeFile('empregados.json', JSON.stringify(jsonData, null, 2), (err)=>{
                    if(err){
                        response.writeHead(500, {'Contet-Type':'application/json'})
                    response.end(JSON.stringify({message: 'Erro ao salvar os dados no banco de dados'}))
                    return
                }
                    response.writeHead(200, {'Content-Type':'application/json'})
                    response.end(JSON.stringify(funcionarioAtualizado))
                })
            })
        })
            response.end()
        }
        else if(url.startsWith('/empregados/') && method === "DELETE"){ // excluir um funcionário específico com base em seu ID
            const id = parseInt(url.split('/')[2])
            fs.readFile('empregados.json', 'utf8', (err, data) => {
                if(err){
                    response.writeHead(500, {'Contet-Type':'application/json'})
                    response.end(JSON.stringify({message: 'Erro ao ler o arquivo'}))
                }
                const jsonData = JSON.parse(data)
                const indexFuncionario = jsonData.findIndex((funcionario)=> funcionario.id === id)
                
                if(indexFuncionario === -1){
                    response.writeHead(404, {'Content-Type':'application/json'})
                    response.end(JSON.stringify({message: 'Funcionário não encontrado!'}))
                    return
                }

                jsonData.splice(indexFuncionario, 1)

                fs.writeFile('empregados.json', JSON.stringify(jsonData, null, 2), (err)=>{
                    if(err){
                        response.writeHead(500, {'Contet-Type':'application/json'})
                    response.end(JSON.stringify({message: 'Erro ao salvar os dados no banco de dados'}))
                    return
                }
                    response.writeHead(200, {'Content-Type':'application/json'})
                    response.end(JSON.stringify(funcionarioAtualizado))
                })
            })
        }else{ // rota de página não encontrada
            response.writeHead(404, {'Content-Type': 'application/json'})
            response.end(JSON.stringify({codigo: 404, message: "Página não encontrada"}))
        }
    });
});


