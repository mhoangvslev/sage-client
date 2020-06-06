function cleanLiteral(literal) {
    if (literal.startsWith('\"') && literal.endsWith('\"')) {
        return literal.slice(1, literal.length - 1)
    }
    return literal
}

function cleanDatatype(datatype) {
    if (datatype.startsWith('<') && datatype.endsWith('>')) {
        datatype = datatype.slice(1, datatype.length - 1)
    }
    return datatype
}

function formatVariable(variable) {
    return variable.slice(1, variable.length)
}

function formatSolution(variables, dirtySolution) {
    let solution = {}
    for (let variable of variables) {
        let value = dirtySolution[`?${variable}`]
        if (value === undefined) {
            continue
        } else if (value.startsWith("http://")) {
            solution[variable] = {"type": "uri", "value": value}
        } else {
            if (value.indexOf('^^') > -1) {
                let [literal, datatype] = value.split('^^')
                solution[variable] = {"type": "literal", "value": cleanLiteral(literal), "datatype": cleanDatatype(datatype)}
            } else if (value.indexOf('@') > -1) {
                let [literal, lang] = value.split('@')
                solution[variable] = {"type": "literal", "value": cleanLiteral(literal), "xml:lang": lang}
            } else {
                solution[variable] = {"type": "literal", "value": cleanLiteral(value)}
            }
        }
    }
    return solution
}

const format_json = function(variables, bindings) {
    let output = {
        "head": {"vars": variables.map(formatVariable)},
        "results": {"bindings": []}
    }

    for (let solution of bindings) {
        output.results.bindings.push(formatSolution(output.head.vars, solution))
    }

    return output
}

module.exports = { format_json }