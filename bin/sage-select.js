#!/usr/bin/env node

// ---- IMPORTS ----------

const fs = require('fs')
const program = require('commander')
const Parser = require('sparqljs').Parser()
const Spy = require('../dist/spy').default
const { format_json } = require('./format_result')

const SageClient = require('../dist/client').default

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
  .parse(process.argv)

if (program.args.length !== 2) {
    process.stderr.write('Error: you must input exactly one server and one default graph IRI to use.\nSee sage-select --help for more details.\n')
    process.exit(1)
}

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

let queryPlan = new Parser.parse(query)
if (queryPlan.queryType !== 'SELECT') {
    process.stderr.write('Error: you must input a SELECT query.\nSee sage-select --help for more details.\n')
    process.exit(1)
}

let bindings = []
let spy = new Spy()
let client = new SageClient(program.args[0], program.args[1], spy)

let promise = new Promise((resolve, reject) => {
    let subscription = setTimeout(function() {
        reject('TimeoutException')
    }, program.timeout * 1000)

    client.execute(query).subscribe(b => {
        let solution = {}
        for (let mapping of b._content) {
            let variable = mapping[0]
            let value = mapping[1]
            solution[variable] = value
        }
        bindings.push(solution)
        if (program.print) {
            console.log(solution)
        }
    }, (error) => {
        reject(error)
    }, () => {
        clearTimeout(subscription)
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
        fs.writeFileSync(program.output, JSON.stringify(format_json(queryPlan.variables, bindings), null, 2))
    }

    process.stdout.write(`SPARQL query evaluated in ${time / 1000}s with ${spy.nbHTTPCalls} HTTP request(s). ${Math.round(spy.transferSize / 1024)} KBytes transfered. ${bindings.length} results !\n`)
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
    
    process.stdout.write(`${state === 'error' ? 'An error occured' : 'SPARQL query interrupted'} after ${time / 1000}s. ${spy.nbHTTPCalls} HTTP request(s) sent. ${Math.round(spy.transferSize / 1024)} KBytes transfered. ${bindings.length} results retrieved !\n`)
    process.exit(1)
})