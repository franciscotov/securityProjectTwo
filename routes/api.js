/*
*
*
*       Complete the API routing below
*
*
*/

'use strict';

var expect = require('chai').expect;
var MongoClient = require('mongodb').MongoClient;
var ObjectId = require('mongodb').ObjectID;
const mongo = require('mongodb');

var db;
//process.env.DATABASE="mongodb://franciscotov:real2479@cluster0-shard-00-00-4vicv.mongodb.net:27017,cluster0-shard-00-01-4vicv.mongodb.net:27017,cluster0-shard-00-02-4vicv.mongodb.net:27017/test?ssl=true&replicaSet=Cluster0-shard-0&authSource=admin&retryWrites=true&w=majority";

module.exports = function (app,collection) {
  //mongo.connect(process.env.DATABASE , {useNewUrlParser: true, useUnifiedTopology: true},(err, db)=>{

app.route('/api/issues/:project')
  
  .get(function (req, res){
    var project = req.params.project
    db = collection.collection(project)
    //?open=true&assigned_to=Joe
    console.log(req.query);
    if(req.query.open || req.query.assigned_to){
      var objectQuery = {
        open:req.query.open == 'true'? true: req.query.open == 'false'? false:'',
        assigned_to: req.query.assigned_to ||''
      }
      db.find(objectQuery).toArray(function(err, result) {
        if (err) {throw err;}
        //console.log(result);
        res.send(result);
      });
    }
    else{
      db.find({}).toArray(function(err, result) {
        if (err) {throw err;}
        //console.log(result);
        res.send(result);
      });
    }
  })
   //solicitud post para el registro del proyecto
  .post(function (req, res){
    var project = req.params.project
    db = collection.collection(project)
    var project = {
      issue_title:req.body.issue_title,
      issue_text: req.body.issue_text,
      created_on: new Date(),
      updated_on: new Date(),
      created_by: req.body.created_by,
      assigned_to: req.body.assigned_to,
      open: true,
      status_text: req.body.status_text
    };
    db.insertOne({
      issue_title: project.issue_title,
      issue_text:project.issue_text,
      created_on: project.created_on,
      updated_on: project.updated_on,
      created_by : project.created_by,
      assigned_to: project.assigned_to,
      open : project.open,
      status_text: project.status_text
    },
      (err, doc)=>{
        if(err){
          console.log('err resgistering');
          res.redirect('/');
        }
        else{
          //console.log(doc.ops);
          res.send(doc.ops[0]);
        }
      }
    );
  })
    
  .put(function (req, res){
    var project = req.params.project;
    db = collection.collection(project)
    var myId = req.body._id.length>=24 ? ObjectId(req.body._id):req.body._id;
    var boolean =!req.body.issue_title && !req.body.text && !req.body.created_by && !req.body.assigned_to&&!req.body.status_text && !req.body.open? false:true;
    //console.log(myId, boolean);
    db.findOne({_id: myId}, function(err, doc){
      if(err) {
        console.log('err');
      }
      if(doc && boolean==true){
        var objectByUpdate={
          issue_title: req.body.issue_title ||doc.issue_title,
          issue_text: req.body.issue_text || doc.issue_text,
          created_on: doc.created_on,
          updated_on: new Date(),
          created_by : req.body.created_by || doc.created_by,
          assigned_to: req.body.assigned_to || doc.assigned_to,
          open : req.body.open ? false: doc.open,
          status_text: req.body.status_text || doc.status_text
        }
        console.log(objectByUpdate);
        db.updateOne({_id:ObjectId(req.body._id)},{
          //objeto de actualizacion
          $set: objectByUpdate
        },
          (err,doc)=>{
            if(err)console.log('err');
            //console.log(doc.ops,'doc');
            res.send('successfully updated');
          }
        );
      }
      else if(!boolean){
        //console.log('not');
        res.send('no updated field sent');
      }
      else{
        //console.log('not doc');
        res.send("could not update " + req.body._id);
      }
    }); 
  })
    
  .delete(function (req, res){
    var project = req.params.project;
    db = collection.collection(project)
    var myId = req.body._id.length>=24 ? ObjectId(req.body._id):req.body._id;
    //console.log('delete');
    db.findOneAndDelete({_id: myId}, function(err, doc){
      if(err)console.log('err');
      if(doc.value){
        console.log(doc);
        res.send('delete ' + doc.value._id);
      }  
      else{
        res.send('could not delete ' + req.body._id);
      }
    }) 
  });   
};
//
