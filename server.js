const express = require("express")
const app = express()
const PORT = 3000;

const path = require("path")
const hbs = require('express-handlebars');
const Datastore = require('nedb')
const bodyParser = require('body-parser')

app.set('views', path.join(__dirname, 'views'));         // ustalamy katalog views
app.engine('hbs', hbs({ defaultLayout: 'main.hbs' }));   // domyślny layout, potem można go zmienić
app.set('view engine', 'hbs');                           // określenie nazwy silnika szablonów

app.use(bodyParser.urlencoded({ extended: false }))
app.use(express.static('static'))


const coll1 = new Datastore({
    filename: 'data/kolekcja.db',
    autoload: true
});




const columns = ["ubezpieczony", "benzyna", "uszkodzony", "naped4x4"]

app.get("/", function (req, res) {
    res.render('home.hbs');
})


app.get("/add", function (req, res) {
    res.render('add.hbs');
})

const getString = val => val? "TAK" : "NIE"

app.post("/add", function (req, res) {

    
    const doc = {}

    columns.forEach((e) => {
        doc[e] = getString(req.body[e])
    })
    coll1.insert(doc, function (err, newDoc) {
        if (err){
            res.render('add.hbs', {
            error: {
                text: "Something went wrong when adding record"
            }
            });
            return;
        }
        console.log("new object: \n", newDoc)
        res.render('add.hbs', {
            succes: {
                text: `Record of id ${newDoc._id} has been added to databese. To see it redirect to `
            }
        });
        return;
    });
    
    
})


app.get("/list", function (req, res) {
    const context = {
        columns: [...columns, "_id", ""]

    }
    coll1.find({ }, function (err, docs) {
        if (err) {
            res.render('list.hbs', {err: {text: "Coś poszło nie tak"}});
            return;
        }
        console.log("Pobrano dane");
        context.docs = docs
        res.render('list.hbs', context);

    });
})

app.post("/list", function (req, res) {
    const context = {
        columns: [...columns, "_id", ""],
    
    }

    
    coll1.remove({ _id:req.body.id }, {}, function (err, numRemoved) {
        console.log("Deleted " + req.body.id)
    });

    coll1.find({ }, function (err, docs) {
        if (err) {
            res.render('list.hbs', {err: {text: "Coś poszło nie tak"}});
            return;
        }
        console.log("Data downloaded");
        context.docs = docs
        res.render('list.hbs', context);

    });
})



app.get("/edit", function (req, res) {
    const context = {
        columns: [...columns, "_id", ""],
        helpers: {
            compareString: function(p, q, options) {
                return (p == q) ? options.fn(this) : options.inverse(this);
            }
        }
    }
    coll1.find({ }, function (err, docs) {
        if (err) {
            res.render('edit.hbs', {err: {text: "Coś poszło nie tak"}});
            return;
        }
        console.log("Pobrano dane");
        context.editedID = req.query.id
        context.docs = docs
        res.render('edit.hbs', context);

    });
})

app.post("/edit", function (req, res) {
    const context = {
        columns: [...columns, "_id", ""],
        helpers: {
            compareString: function(p, q, options) {
                return (p == q) ? options.fn(this) : options.inverse(this);
            }
        }
    }


    const newData = {}

    columns.forEach((e) => {
        newData[e] = req.body[e]
    })

    coll1.update(
        { _id: req.body._id }, 
        { $set: newData },
        {},
        function (err, numReplaced) {
          console.log(`Updeted ${numReplaced} record(s)` );
        }
    );
    coll1.find({ }, function (err, docs) {
        if (err) {
            res.render('edit.hbs', {err: {text: "Coś poszło nie tak"}});
            return;
        }
        console.log("Pobrano dane");
        context.editedID = req.query.id
        context.docs = docs
        res.render('edit.hbs', context);

    });
})

app.listen(PORT, function () {
    console.log("start serwera na porcie " + PORT, "\nhttp://localhost:" + PORT)
})