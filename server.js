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

const context = {}

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
    res.render('home.hbs', context);
})


app.get("/edit", function (req, res) {
    res.render('home.hbs', context);
})

app.listen(PORT, function () {
    console.log("start serwera na porcie " + PORT, "\nhttp://localhost:" + PORT)
})