'use strict'

const { Bootprint } = require('bootprint/index')
const bootprintJsonSchema = require('bootprint-json-schema')
const bootprintConfig = require('./reference-generator/config.js')
const fs = require('fs');

fs.readdir('./docs/', (err, releases) => {
    if (err) throw err;
    releases.forEach((release) => {
        var releaseFound = fs.statSync('./docs/'+release);
        if (releaseFound.isDirectory()) {
            var files = fs.readdirSync('./docs/' + release + '/modules/user-guide/attachments/jsonschemas/')
            files.forEach((version) => {
                var versionFound = fs.statSync('./docs/' + release + '/modules/user-guide/attachments/jsonschemas/' + version); 
                if (versionFound.isDirectory()) {
                    var glob = require('glob-fs')();
                    var schemas = glob.readdirSync('./docs/' + release + '/modules/user-guide/attachments/jsonschemas/' + version + '/devfile*.json');
                    if (! schemas.empty) {
                        var schemaPath = schemas[0]
                        var apiReferencePath = './docs/' + release + '/modules/user-guide/attachments/api-reference/' + version + '/'
                        console.log("Generating Api reference for " + release + ": \n  - from schema: " + schemaPath + '\n  - to folder: ' + apiReferencePath)
                        new Bootprint(bootprintJsonSchema, bootprintConfig)
                        .run(schemaPath, apiReferencePath)
                        .then((result) => {
                            try {
                                fs.mkdirSync(`./docs/${release}/modules/user-guide/examples/api-reference/${version}/`, { recursive: true })    
                            } catch(e) { console.error(e)}
                            fs.writeFileSync(
                                `./docs/${release}/modules/user-guide/examples/api-reference/${version}/body.html`,
                                `
                                <a href="_attachments/jsonschemas/${version}/devfile.json">Download current the JSON Schema</a>
                                <iframe src="../_attachments/api-reference/${version}/index.html" style="border:none;width: 100%;min-height:50em;height:-webkit-fill-available;"></iframe>
                                `)
                        }
                        , (err) => {
                            throw err
                        })
                    }
                }    
            });
        }
    });
});
