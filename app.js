var express = require('express');
var http = require('http');
var path = require('path');
var aws = require('aws-sdk');
var env = require('node-env-file');
var multer = require('multer');
var bodyParser = require('body-parser');
var fileupload = require('fileupload').createFileUpload('./.tmp').middleware;
// Load any undefined ENV variables form a specified file. 
env(__dirname + '/.env');


var app = express();
app.set('views', __dirname + '/views');
app.engine('html', require('ejs').renderFile);
app.set('port', process.env.PORT || 5000);
app.use(express.static(path.join(__dirname, 'public')));

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(multer({ dest: './.tmp/' }));

var AWS_ACCESS_KEY = process.env.AWS_ACCESS_KEY;
var AWS_SECRET_KEY = process.env.AWS_SECRET_KEY;
var S3_BUCKET = process.env.S3_BUCKET;
var S3_BUCKET_IMAGE_FOLDER = process.env.S3_BUCKET_IMAGE_FOLDER;

app.get('/', function(req, res){
    res.render('index.html');
});
app.get('/sign_s3', function(req, res){
    aws.config.update({accessKeyId: AWS_ACCESS_KEY, secretAccessKey: AWS_SECRET_KEY});
    var s3 = new aws.S3();
    var s3_params = {
        Bucket: S3_BUCKET + S3_BUCKET_IMAGE_FOLDER,
        Key: req.query.s3_object_name,
        Expires: 60,
        ContentType: req.query.s3_object_type,
        ACL: 'public-read'
    };
    s3.getSignedUrl('putObject', s3_params, function(err, data){
        if(err){
            console.log(err);
        }
        else{
            var return_data = {
                signed_request: data,
                url: 'http://'+S3_BUCKET+'.s3.amazonaws.com'+S3_BUCKET_IMAGE_FOLDER+'/'+req.query.s3_object_name
            };
            res.write(JSON.stringify(return_data));
            res.end();
        }
    });
});

app.post('/upload', fileupload, function(req, res) {
    res.send(200);
});

app.post('/submit_form', function(req, res){
    username = req.body.username;
    full_name = req.body.full_name;
    avatar_url = req.body.avatar_url;
    res.send('Done');
    // update_account(username, full_name, avatar_url); // TODO: create this function
    // TODO: Return something useful or redirect
});

app.listen(app.get('port'), function (){
    console.log('Listen port %s', app.get('port'));
});