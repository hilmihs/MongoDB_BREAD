var express = require('express');
const db = require('../../POSTgreSQL_BREAD/postgresql_bread/db');
var router = express.Router();
const moment = require('moment')

const MongoClient = require('mongodb').MongoClient;
const url = "mongodb://localhost:27017/";

router.get('/', function (req, res, next) {
  // Pagination preparation
  const limit = 3
  let currentOffset;
  let totalPage;
  let currentLink;
  let pageInput = parseInt(req.query.page)
  let data;
  let limitation = {}

  


  if (!req.query.page) {
    currentOffset = 1;
    pageInput = 1;
  } else {
    currentOffset = parseInt(req.query.page);
  }
  const offset = (limit * currentOffset) - limit;
  

  if (req.url === '/') {
    currentLink = '/?page=1'
  } else {
    if (req.url.includes('/?page')) {
      currentLink = req.url
    } else {
      if (req.url.includes('&page=')) {
        currentLink = req.url
      } else {
        if (req.url.includes('&page=')) {
        } else {
          currentLink = req.url + `&page=${pageInput}`
        }
      }
    }
  }


  // Syntax MongoDB checking
  let wheres = {}
  let sortby = { _id: 1 }

  if (req.query.idCB == 'on' && req.query.id !== '') {
    wheres['_id'] = parseInt(req.query.id)
  }
  if (req.query.stringCB == 'on' && req.query.string !== '') {
    wheres['string'] = new RegExp(`${req.query.string}`, 'i');
  }
  if (req.query.integerCB == 'on' && req.query.integer !== '') {
    wheres['integer'] = parseInt(req.query.integer)
  }
  if (req.query.floatCB == 'on' && req.query.float !== '') {
    wheres['float'] = JSON.parse(req.query.float)
  }
  if (req.query.StartDate && req.query.EndDate) {
    if (req.query.dateCB == 'on') {
      wheres['date'] = { $gte: new Date(`${req.query.StartDate}`), $lte: new Date(`${req.query.EndDate}`) }
    }
  } else if (req.query.dateCB == 'on' && req.query.StartDate !== '') {
    wheres['date'] = { $gte: new Date(`${req.query.StartDate}`) }
  } else if (req.query.dateCB == 'on' && req.query.EndDate) {
    wheres['date'] = { $lte: new Date(`${req.query.EndDate}`)  }
  } 
  if (req.query.booleanCB == 'on' && req.query.boolean !== '') {
    wheres['boolean'] = JSON.parse(req.query.boolean)
  }
  if (req.query.sortbyid == 'on') {
    sortby = sortby
  } else if (req.query.sortbyid == 'off') {
    sortby = {}
    sortby['_id'] = -1
  }

  if (req.query.sortbystring == 'on') {
    sortby = {}
    sortby['string'] = 1
  } else if (req.query.sortbystring == 'off') {
    sortby = {}
    sortby['string'] = -1
  }

  if (req.query.sortbyinteger == 'on') {
    sortby = {}
    sortby['integer'] = 1
  } else if (req.query.sortbyinteger == 'off') {
    sortby = {}
    sortby['integer'] = -1
  }

  if (req.query.sortbyfloat == 'on') {
    sortby = {}
    sortby['float'] = 1
  } else if (req.query.sortbyfloat == 'off') {
    sortby = {}
    sortby['float'] = -1
  }

  if (req.query.sortbydate == 'on') {
    sortby = {}
    sortby['date'] = 1
  } else if (req.query.sortbydate == 'off') {
    sortby = {}
    sortby['date'] = -1
  }

  if (req.query.sortbyboolean == 'on') {
    sortby = {}
    sortby['boolean'] = 1
  } else if (req.query.sortbyboolean == 'off') {
    sortby = {}
    sortby['boolean'] = -1
  } 
    if (req.url == '/') {
      sortby = { _id: 1 }
      limitation = {limit, skip: offset }
    } else {
      limitation = { limit, skip: offset }
    }
  MongoClient.connect(url, function (err, db) {
    if (err) throw err;
    var dbo = db.db("mydb");
    
    dbo.collection('data').find(wheres, limitation).sort(sortby).toArray((error, result) => {
      if (error) throw error
      data = result

      dbo.collection('data').find(wheres).count((error, count) => {
        if (error) throw error

        totalPage = Math.ceil(count / limit);
        res.render('list', {
          rows: data,
          page: totalPage,
          currentPage: pageInput,
          query: req.query,
          link: req.url,
          currentUrl: currentLink,
          moment,
        })
      })
    });
  });
});




router.get('/add', (req, res) => {
  res.render('add')
})

router.post('/add', (req, res) => {
  MongoClient.connect(url, function (err, db) {
    if (err) throw err;
    var dbo = db.db("mydb");
    dbo.collection("counters").findOneAndUpdate({ _id: 'productid' },
      { $inc: { seq: 1 } },
      { new: true }).then((result) => {
        var myobj = {
          _id: result.value.seq,
          string: `${req.body.string}`,
          integer: parseInt(req.body.integer),
          float: JSON.parse(req.body.float),
          date: new Date(`${req.body.date}`),
          boolean: JSON.parse(req.body.boolean)
        };
        dbo.collection("data").insertOne(myobj, function (err, res) {
          if (err) throw err;
          console.log("1 document inserted");
          db.close();

        });
        res.redirect('/')
      }
      ).catch((err) => {
        console.log(err)
      })
  })
})

router.get('/edit/:id', (req, res) => {
  MongoClient.connect(url, function (err, db) {
    if (err) throw err;
    var dbo = db.db("mydb");
    dbo.collection('data').find({_id: parseInt(req.params.id)}).toArray((error, result) => {

      if (error) {
        throw error
      } else {
        res.render('edit', { item: result[0], moment })
      }
    });
  });
})

module.exports = router;

router.post('/edit/:id', (req, res) => {
  MongoClient.connect(url, function (err, db) {
    if (err) throw err;
    var dbo = db.db("mydb");
    var updatePromise = dbo.collection('data').updateOne({
      _id: parseInt(req.params.id)
    },
      {
        $set: {
          string: req.body.string,
          integer: req.body.integer,
          float: req.body.float,
          date: req.body.date,
          boolean: req.body.boolean
        }
      })
    updatePromise.then((result) => {
    }).catch((error) => {
      console.log(error)
    })
    res.redirect('/')
  })
})


router.get('/delete/:_id', (req, res) => {

  MongoClient.connect(url, function (err, db) {
    
    if (err) throw err;
    var dbo = db.db("mydb");
    var myquery = { _id: parseInt(req.params._id) };
    dbo.collection("data").deleteOne(myquery, function (err, obj) {
      if (err) throw err;
      console.log("1 document deleted");
      db.close();
    });
  });
  res.redirect('/')
})









