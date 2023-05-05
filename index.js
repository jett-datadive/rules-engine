import csv from 'csvtojson'
import fs from 'fs'
import jsonata from 'jsonata'
import {Parser} from "json2csv"
import {add} from "./externalFunctions.js";

async function process(inputFile, ruleFile) {

    const rules = fs.readFileSync(ruleFile).toString()
    const records = await csv().fromFile(inputFile)
    const jsontocsv = new Parser()

    // parse our rules file
    const ruleExpression = jsonata(rules)

    // bind to "external" functions so we can use them within our rule engine
    ruleExpression.registerFunction('add', add, "<nn:n>")

    const results = await Promise.all(records.map(async (row) =>  {
        return await ruleExpression.evaluate(row)
    }))

    return jsontocsv.parse(results)
}

// console.info(rules)
const newArray = await process('data/sample.csv', 'rules/sample.rule')
// console.log(newArray)

fs.writeFileSync('./output.csv', newArray);
