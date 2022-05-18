const express = require('express');
const app = express();

app.listen(8080, function(){
    console.log('listening on 8080');
});

//누군가가 /pet으로 방문을 하면
//pet 관련된 안내문을 띄워주자

app.get('/pet', function(요청, 응답){
    응답.send('펫용품 쇼핑할 수 있는 페이지입니다');
});

//과제
app.get('/beauty', function(요청, 응답){
    응답.send('뷰티용품 쇼핑할 수 있는 페이지입니다');
});