const express = require('express');
const app = express();
const bodyParser = require('body-parser');
app.use(bodyParser.urlencoded({ extended : true }));

const MongoClient = require('mongodb').MongoClient;
MongoClient.connect('mongodb+srv://ID:<PASSWORD>@cluster0.0wxoo.mongodb.net/?retryWrites=true&w=majority', function(에러, client){
    app.listen(8080, function(){
        console.log('listening on 8080');
    });
});



//누군가가 /pet으로 방문을 하면
//pet 관련된 안내문을 띄워주자

// app.get('/pet', function(요청, 응답){
//     응답.send('펫용품 쇼핑할 수 있는 페이지입니다');
// });

app.get('/', function(요청, 응답){
    응답.sendFile(__dirname + '/index.html');
});

app.get('/write', function(요청, 응답){
    응답.sendFile(__dirname + '/write.html');
});

//어떤 사람이 /add 경로로 POST 요청을 하면...
//??를 해주세요...

app.post('/add', function(요청, 응답){
    응답.send('전송완료');
    console.log(요청.body);
    //DB에 저장해주세요
});