'use strict';
var fs, express, app, data, script_path,
    execution_path, port, mainURL;

fs = require('fs');
express = require('express');
app = express();

script_path = __dirname;
execution_path = process.cwd();
port = process.argv[2] || 1991;
console.log("port: " + port);
mainURL = '/api/';
data = getDefaultData();

app.configure(function() {
    app.use(express.methodOverride());
    app.use(defaults_conf);
    app.use(express.bodyParser());
    app.use(express.static(execution_path));
    app.use(express.directory(execution_path));
    app.use(express.errorHandler({ dumpExceptions: true, showStack: true }));
});


function defaults_conf (req, res, next) {
    res.header('Cache-Control', 'no-cache, no-store, must-revalidate');
    res.header('Pragma', 'no-cache');

    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    
    // intercept OPTIONS method
    if ('OPTIONS' == req.method) {
        res.send(200);
    } else {
        next();
    }
} 


app.get (mainURL + 'save!!!',            save_all_to_file);         // Save the data to the *local* defaults.json
app.get (mainURL + ':collection_id',     get_all);                  // Return ALL the records
app.get (mainURL + ':collection_id/:id', get_record);               // Return a single record
app.post(mainURL + ':collection_id',     save_record);              // Save new record (or records) via POST
app.put (mainURL + ':collection_id/:id', update_record);            // Update new record via PUT
app.put (mainURL + ':collection_id',     update_record_without_id); // Update record via PUT
app.del (mainURL + ':collection_id/:id', delete_record)             // Delete record via DELETE

app.listen(port)

// nasty hack
Array.prototype.remove = function(from, to) {
    var rest = this.slice((to || from) + 1 || this.length);
    this.length = from < 0 ? this.length + from : from;
    return this.push.apply(this, rest);
};


function getDefaultData() {
    return (loadFrom(execution_path) || loadFrom(script_path) || {})

    function loadFrom(where) {
        where += '/defaults.json';
        try {
            var data = require(where);
            if (data) console.log("Loading data from:", where);
            return data;
        } catch(e) {
            return false;
        }
    }
}


function options(req, res) {
    res.send(200, '');
}

function get_all(req, res) {
    var collection_id, response;

    collection_id = get_collection_id(req);
    response = {};
    response[collection_id] = get_collection(req);

    res.send(200, response);
}

function get_record(req, res) {
    var record_id, collection, record;

    record_id = get_param(req, 'id');
    collection = get_collection(req);
    record = find_by_id(collection, record_id);

    res.send(200, record);
}

function save_record(req, res) {
    var neo, collection;

    neo = req.body;
    collection = get_collection(req);

    if (Array.isArray(neo)) {
        // If the request is a collection
        neo.forEach(function (item) {
            save_single_record(item);
        });
    } else {
        // If is a single element
        save_single_record(neo);
    }

    res.send(200, neo);

    function save_single_record(neo) {
        neo.id = new_id(collection);
        collection.push(neo);
    }
}

function update_record(req, res) {
    var record_id, collection, record;

    record_id = get_param(req, 'id');
    collection = get_collection(req);
    record = find_by_id(collection, record_id);

    copy_values(req.body, record, ['id']);
    res.send(200, record);
}

function update_record_without_id(req, res) {
    var record_id, collection, record;

    record_id = req.body.id;
    collection = get_collection(req);
    record = find_by_id(collection, record_id);

    copy_values(req.body, record, ['id']);
    res.send(200, record);
}

function delete_record(req, res) {
    var record_id, collection, record;

    record_id = get_param(req, 'id');
    collection = get_collection(req);
    record = find_by_id(collection, record_id);

    for (var x = 0; x < collection.length; x++) {
        if (collection[x].id == record_id) collection.remove(x);
    }

    res.send(200, record);
}

function save_all_to_file(req, res) {
    var target, content;
    target = execution_path + '/defaults.json'; 
    content = JSON.stringify(data, null, 4);
    
    console.log('saving: ' + target);

    fs.writeFile(target, content, function (err) {
        res.send(err ? 'there was an error.' : 'done.');
    });
}


function get_collection_id(req) {
    return req.params.collection_id;
}

function get_param(req, param) {
    return req.params[param];
}

function get_collection(req) {
    var collection_id = get_collection_id(req);

    if (!data.hasOwnProperty(collection_id)) {
        data[collection_id] = [];
    }

    return data[collection_id];
}

function find_by_id(collection, id) {
    for (var x = 0; x < collection.length; x++) {
        if (collection[x].id == id) return collection[x];
    };

    return {};
}

function new_id(collection) {
    if (!collection.length) return 1;

    var id = -Infinity;
    for (var x = 0; x < collection.length; x++) {
        id = Math.max(id, collection[x].id);
    }
    return id + 1;
}

function copy_values(source, target, ignore) {
    for (var item in source) {
        if (ignore.indexOf(item) === -1) target[item] = source[item];
    }
}

