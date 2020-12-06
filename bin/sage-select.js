#!/usr/bin/env node

// ---- IMPORTS ----------

const fs = require('fs')
const program = require('commander')
const Spy = require('../dist/spy').default
const { format_json } = require('./format_result')

const SageClient = require('../dist/client').default
const DirectClient = require('../dist/direct-client').default

// ---- MAIN ----------

program
  .description('Execute a SPARQL query using a SaGe server and the IRI of the default RDF graph')
  .usage('<server-url> <default-graph-iri> <statistics> [options]')
  .option('-q, --query <query>', 'evaluates the given SPARQL query')
  .option('-f, --file <file>', 'evaluates the SPARQL query stored in the given file')
  .option('-o, --output <output>', 'evaluates the SPARQL query in the given file')
  .option('-m, --measure <measure>', 'measure the query execution time (in seconds) & append it to a file')
  .option('-t, --timeout <timeout>', 'stops the query execution after the given time limit (in seconds)', 600)
  .option('-p, --print', 'prints each new result during query execution')
  .option('--method <method>', 'Evaluates the SPARQL queries using the specified method: [mono, multi, alpha, direct]', 'direct')
  .parse(process.argv)

if (program.args.length !== 2) {
    process.stderr.write('Error: you must input exactly one server and one default graph IRI to use.\nSee sage-select --help for more details.\n')
    process.exit(1)
}

let server_url = program.args[0]
let default_graph_iri = program.args[1]

// fetch SPARQL query to analyse
let query = null
if (program.query) {
    query = program.query
} else if (program.file && fs.existsSync(program.file)) {
    query = fs.readFileSync(program.file, 'utf-8')
} else {
    process.stderr.write('Error: you must input a SPARQL query to evaluate.\nSee sage-select --help for more details.\n')
    process.exit(1)
}

let method = program.method
if (!['mono', 'multi', 'alpha', 'direct'].includes(method)) {
    console.error('Error: invalid evaluation strategy. Available strategies are: [mono, multi, direct]')
    console.error('- mono : property paths queries are evaluated using a client-side automaton-based approach with a mono-predicate automaton')
    console.error('- multi : property paths queries are evaluated using a client-side automaton-based approach with a multi-predicate automaton')
    console.error('- alpha : property paths queries are evaluated using a client-side alpha operator to support transitive closures')
    console.error('- direct : property paths queries are evaluated on the server')
}


function get_client(spy) {
    if (method === 'direct') {
        return new DirectClient(server_url, default_graph_iri, spy)
    } else if (method === 'mono') {
        let options = {'property-paths-strategy': 'mono-predicate-automaton'}
        return new SageClient(server_url, default_graph_iri, spy, options=options)
    } else if (method === 'multi') {
        let options = {'property-paths-strategy': 'multi-predicate-automaton'}
        return new SageClient(server_url, default_graph_iri, spy, options=options)
    } else if (method === 'alpha') {
        let options = {'property-paths-strategy': 'alpha-operator'}
        return new SageClient(server_url, default_graph_iri, spy, options=options)
    }
}

let bindings = []
let spy = new Spy()
let memory = {}
let duplicates = 0

let promise = new Promise((resolve, reject) => {
    get_client(spy).execute(query).subscribe(b => {
        let solution = {}
        for (let mapping of b._content) {
            let variable = mapping[0]
            let value = mapping[1]
            solution[variable] = value
        }
        if ('?imprint' in solution && solution['?imprint'] in memory) {
            duplicates++
        } else {
            if ('?imprint' in solution) {
                memory[solution['?imprint']] = true
            }
            bindings.push(solution)
            if (program.print) {
                console.log(solution)
            }
        }
    }, (error) => {
        reject(error)
    }, () => {
        console.log('complete !')
        resolve()
    })
})

let startTime = Date.now()

promise.then(function() {
    let endTime = Date.now()
    let time = endTime - startTime

    if (program.measure) {
        fs.writeFileSync(program.measure, `${time},${spy.nbHTTPCalls},${spy.transferSize},${bindings.length},complete`)
    } 
    if (program.output) {
        fs.writeFileSync(program.output, JSON.stringify(format_json(bindings), null, 2))
    }

    process.stdout.write(`SPARQL query evaluated in ${time / 1000}s with ${spy.nbHTTPCalls} HTTP request(s). ${Math.round(spy.transferSize / 1024)} KBytes transfered. ${bindings.length} results and ${duplicates} duplicates !\n`)
    process.exit(0)
}).catch(function(error) {
    let endTime = Date.now()
    let time = endTime - startTime
    
    let state = 'error'
    if (error === 'TimeoutException' || error.message === 'TimeoutException') {
        state = 'interrupted'
    } else {
        console.log(error)
    }

    if (program.measure) {
        fs.writeFileSync(program.measure, `${time},${spy.nbHTTPCalls},${spy.transferSize},${bindings.length},${state}`)
    }
    
    process.stdout.write(`${state === 'error' ? 'An error occured' : 'SPARQL query interrupted'} after ${time / 1000}s. ${spy.nbHTTPCalls} HTTP request(s) sent. ${Math.round(spy.transferSize / 1024)} KBytes transfered. ${bindings.length} results and ${duplicates} duplicates retrieved !\n`)
    process.exit(1)
})