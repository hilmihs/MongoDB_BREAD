const MongoClient = require('mongodb').MongoClient;
const url = "mongodb://localhost:27017/";


MongoClient.connect(url, function (err, db) {
  if (err) throw err;
  var dbo = db.db("mydb");
  
  dbo.collection("counters").findOneAndUpdate({ _id: 'productid' },
    { $inc: { seq: 1 } },
    { new: true }).then((result) => {
    var myobj = {
      _id: result.value.seq,
      string: "h",
      integer: 8,
      float: 0.8,
      date: new Date("2008-08-08"),
      boolean: true
    };
    dbo.collection("data").insertOne(myobj, function (err, res) {
      if (err) throw err;
      console.log("1 document inserted");
      db.close();
    });
  }
  ).catch((err) => {
    console.log(err)
  })


  // dbo.collection('counters').insertOne({
  //   _id: 'productid',
  //   sequence_value : 0
  // }, (err, res) => {
  //   if (err) throw err
  //   console.log("1 document inserted");
  //   db.close();
  // })

// });

// var MongoClient = require('mongodb').MongoClient;
// var url = "mongodb://localhost:27017/";

// MongoClient.connect(url, function(err, db) {
//   if (err) throw err;
//   var dbo = db.db("mydb");
//   var myquery = { _id: 1 };
//   dbo.collection("data").deleteOne(myquery, function(err, obj) {
//     if (err) throw err;
//     console.log("1 document deleted");
//     db.close();
//   });
// });



// MongoClient.connect(url, function(err, db) {
//   if (err) throw err;
//   var dbo = db.db("mydb");
//   var myobj = { name: "Company Inc", address: "Highway 37" };
//   dbo.collection("data").insertOne(myobj, function(err, res) {
//     if (err) throw err;
//     console.log("1 document inserted");
//     db.close();
//   });
// });

// var updatePromise = dbo.collection('counters').updateOne({
//   _id: "productid"
// },
// {
//   $set: {
//     seq: 0
//   }
// })
// updatePromise.then((result) => {
//   console.log(result)
// }).catch((error) => {
//   console.log(error)
})


