var express = require('express')
var validate = require('validate.js')
var mongoose = require('mongoose')

var app = express()


mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/url-shortener');

var db = mongoose.connection;

db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function() { console.log('connected to database') });

var urlSchema = mongoose.Schema({
    url: String,
    shorterUrl: String,
    shorterUrlNumber: Number
});

var UrlModel = mongoose.model('UrlModel', urlSchema);



app.get('/', function(req, res) {
    res.sendFile(process.cwd() + '/index.html');
});


app.get('/new/:urlReq*', function(req, res) {

    var urlReq = req.url.split("").slice(5).join("");
    var validUrlReq = (validate({website: urlReq}, {website: {url: true}}) ? false : true);

    if (validUrlReq) {

        var shortUrlNumber = Math.floor(Math.random() * (9999 - 1000 + 1) + 1000);
        var fullUrl = req.get('host') + '/' + shortUrlNumber;
        var dbUrl = new UrlModel({ url: urlReq, shorterUrl: fullUrl, shorterUrlNumber: shortUrlNumber });

        dbUrl.save(function(err) {
            if (err) return console.error(err);
        });

        res.json({
            original_url: urlReq,
            short_url: fullUrl
        })
    } else {
        res.json({
            error: "Invalid url format."
        })
    }
});


app.get('/:num', function(req, res) {

    UrlModel.findOne({ shorterUrlNumber: req.params.num }, function(err, doc) {
        if (err) return res.json({ error: "This is not in the database." });
        if (err) return console.error(err);

        res.redirect(doc.url);
    });
})

app.listen(process.env.PORT || 8000);
