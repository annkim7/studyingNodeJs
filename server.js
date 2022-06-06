require('dotenv').config()

const express = require('express');
const app = express();

const http = require('http').createServer(app);
const { Server } = require("socket.io");
const io = new Server(http);

const bodyParser = require('body-parser');
app.use(bodyParser.urlencoded({ extended : true }));
const MongoClient = require('mongodb').MongoClient;
const methodOverride = require('method-override');
app.use(methodOverride('_method'));
app.set('view engine', 'ejs');

app.use('/public', express.static('public'));


var db;
MongoClient.connect(process.env.DB_URL, function(에러, client){
    //연결되면 할일
    //app.listen(process.env.PORT, function(){
    http.listen(process.env.PORT, function(){
        if(에러) return console.log(에러)

        db = client.db('todoapp');

        // db.collection('post').insertOne({ 이름 : 'John', 나이 : 20, _id: 100 }, function(에러, 결과){
        //     console.log('저장완료');
        // });

        console.log('listening on 8080');
    });
});



//누군가가 /pet으로 방문을 하면
//pet 관련된 안내문을 띄워주자

// app.get('/pet', function(요청, 응답){
//     응답.send('펫용품 쇼핑할 수 있는 페이지입니다');
// });

// app.get('/', function(요청, 응답){
//     응답.sendFile(__dirname + '/index.html');
// });
app.get('/', function(요청, 응답){
    응답.render('index.ejs');
});

// app.get('/write', function(요청, 응답){
//     응답.sendFile(__dirname + '/write.html');
// });

app.get('/write', function(요청, 응답){
    응답.render('write.ejs');
});

//어떤 사람이 /add 경로로 POST 요청을 하면...
//??를 해주세요...



///list로 GET요청으로 접속하면
//실제 DB에 저장된 데이터들로 예쁘게 꾸며진 HTML을 보여줌
app.get('/list', function(요청, 응답){
    //디비에 저장된 post라는 collection안의 모든 데이터를 꺼내주세요
    db.collection('post').find().toArray(function(에러, 결과){
        console.log(결과);
        응답.render('list.ejs', { posts : 결과 });
    });
});

app.get('/search', (요청, 응답) => {
    console.log(요청.query.value);
    var 검색조건 = [
        {
            $search: {
              index: 'titleSearch',
              text: {
                query: 요청.query.value,
                path: '제목'  // 제목날짜 둘다 찾고 싶으면 ['제목', '날짜']
              }
            }
          },
        //   { $sort : { _id: 1 } },
        //   { $limit : 10 }
        // { $project : { 제목 : 1, _id : 0, score: { $meta: "searchScore" } } }
    ];
    db.collection('post').aggregate(검색조건).toArray((에러, 결과)=>{
        console.log(결과);
        응답.render('search.ejs', { posts : 결과 });
    })
});



///detail로 접속하면 detail.ejs 보여줌
///detail/2로 접속하면 detail2.ejs 보여줌
///detail/4로 접속하면 detail4.ejs 보여줌

app.get('/detail/:id', function(요청, 응답){
    db.collection('post').findOne({ _id : parseInt(요청.params.id) }, function(에러, 결과){
        console.log(결과);
        응답.render('detail.ejs', { data : 결과 });
    });
    
})

app.get('/edit/:id', function(요청, 응답){
    db.collection('post').findOne({ _id : parseInt(요청.params.id) }, function(에러, 결과){
        console.log(결과);
        응답.render('edit.ejs', { post : 결과 });
    });
})

app.put('/edit', function(요청, 응답){
    //폼에 담긴 제목데이터, 날짜데이터를 가지고
    //db.collection 에다가 업데이트함
    db.collection('post').updateOne({ _id : parseInt(요청.body.id) },{ $set : { 제목: 요청.body.title, 날짜: 요청.body.date } }, function(에러, 결과){
        console.log('수정완료');
        응답.redirect('/list')
    });
});

const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const session = require('express-session');

app.use(session({ secret : '비밀코드', resave : true, saveUninitialized : false }));
app.use(passport.initialize());
app.use(passport.session());

app.get('/login', function(요청, 응답){
    응답.render('login.ejs');
});
app.post('/login', passport.authenticate('local', {
    failureRedirect : '/fail'
}), function(요청, 응답){
    응답.redirect('/')
});

app.get('/mypage', 로그인했니, function(요청, 응답){
    console.log(요청.user);
    응답.render('mypage.ejs', { 사용자 : 요청.user });
});

function 로그인했니(요청, 응답, next){
    if(요청.user){
        next()
    }else{
        응답.send('로그인안하셨는데요?');
    }
}

const { ObjectId } = require('mongodb');

app.post('/chatroom', 로그인했니, function(요청, 응답){
    
    var 저장할거 = {
        title: '무슨무슨채팅방',
        member: [ObjectId(요청.body.당한사람id), 요청.user._id],
        date: new Date()
    }
    db.collection('chatroom').insertOne(저장할거).then((결과)=>{
        응답.send('성공')
    })
})

app.get('/chat', 로그인했니, function(요청, 응답){
    
    db.collection('chatroom').find({ member : 요청.user._id }).toArray().then((결과)=>{
        응답.render('chat.ejs', { data: 결과 });
    })
    
})

app.post('/message', 로그인했니, function(요청, 응답){
    var 저장할거 = {
        parent : 요청.body.parent,
        content : 요청.body.content,
        userid : 요청.user._id,
        date : new Date(),
    }

    db.collection('message').insertOne(저장할거).then(()=>{
        console.log('DB저장성공');
        응답.send('DB저장성공');
    })
})

app.get('/message/:id', 로그인했니, function(요청, 응답){

    응답.writeHead(200, {
        "Connection" : "keep-alive",
        "Content-type" : "text/event-stream",
        "Cache-Control" : "no-cache",
    });

    db.collection('message').find({ parent : 요청.params.id }).toArray().then((결과)=>{
        응답.write('event: test\n');
        응답.write('data: ' + JSON.stringify(결과) + '\n\n');
    });

    const pipeline = [
        { $match : { 'fullDocument.parent' : 요청.params.id } }
    ];
    const collection = db.collection('message');
    const changeStream = collection.watch(pipeline);
    changeStream.on('change', (result)=>{
        응답.write('event: test\n');
        응답.write('data: ' + JSON.stringify([result.fullDocument]) + '\n\n');
    });
})

passport.use(new LocalStrategy({
    usernameField: 'id',
    passwordField: 'pw',
    session: true,
    passReqToCallback: false,
  }, function (입력한아이디, 입력한비번, done) {
    //console.log(입력한아이디, 입력한비번);
    db.collection('login').findOne({ id: 입력한아이디 }, function (에러, 결과) {
      if (에러) return done(에러)
  
      if (!결과) return done(null, false, { message: '존재하지않는 아이디요' })
      if (입력한비번 == 결과.pw) {
        return done(null, 결과)
      } else {
        return done(null, false, { message: '비번틀렸어요' })
      }
    })
  }));

  passport.serializeUser(function (user, done) {
    done(null, user.id)
  });
  
  passport.deserializeUser(function (아이디, done) {
      //디비에서 위에있는 user.id로 유저를 찾은 뒤에 유저정보를
      db.collection('login').findOne({ id : 아이디 }, function(에러, 결과){
        //done(null, {요기에 넣음})
        done(null, 결과)
      })
      
  });

  app.post('/register', function(요청, 응답){
    db.collection('login').insertOne({ id: 요청.body.id, pw:요청.body.pw }, function(에러, 결과){
        응답.redirect('/')
    })
  })

  app.post('/add', function(요청, 응답){
    응답.send('전송완료');
    console.log(요청.body.date);
    console.log(요청.body.title);
    //DB에 저장해주세요
    //어떤 사람이 /add 경로로 POST 요청을 하면...
    //데이터 2개(날짜, 제목)를 보내주는데,
    //이때 post라는 이름을 가진 collection에 두개 데이터를 저장하기
    //{ 제목 : '어쩌구', 날짜 : '어쩌구' }
    db.collection('counter').findOne({ name : '개시물갯수' }, function(에러, 결과){
        console.log(결과.totalPost);
        var 총게시물갯수 = 결과.totalPost;
        var 저장할거 = { _id : 총게시물갯수 + 1, 작성자 : 요청.user._id, 제목 : 요청.body.title, 날짜 : 요청.body.date }

        db.collection('post').insertOne(저장할거, function(에러, 결과){
            console.log('저장완료');
            //counter라는 콜렉션에 있는 totalPost라는 항목도 1 증가시켜야함(수정)
            db.collection('counter').updateOne({name : '개시물갯수'}, { $inc : {totalPost : 1} }, function(에러, 결과){
                if(에러){ return console.log(에러) }
            });
        });

        
    });
    

});

app.delete('/delete', function(요청, 응답){
    console.log(요청.body);
    요청.body._id = parseInt(요청.body._id);

    var 삭제할데이터 = { _id : 요청.body._id, 작성자 :  요청.user._id }

    db.collection('post').deleteOne(삭제할데이터, function(에러, 결과){
        console.log('삭제완료');
        if(결과){console.log(결과)}
        응답.status(200).send({ message : '성공했습니다' });
    })
});


app.use('/shop', require('./routes/shop.js'));
app.use('/sports/sub', require('./routes/board.js'));

// router.get('/shop/shirts', function(요청, 응답){
//     응답.send('셔츠 파는 페이지입니다');
// });
// router.get('/shop/pants', function(요청, 응답){
//     응답.send('바지 파는 페이지입니다');
// });

let multer = require('multer');
var storage = multer.diskStorage({

  destination : function(req, file, cb){
    cb(null, './public/image')
  },
  filename : function(req, file, cb){
    cb(null, file.originalname)
  },
  filefilter: function(req, file, cb){
    var ext = path.extname(file.originalname);
    if(ext !== '.png' && ext !== '.jpg' && ext !== '.jpeg') {
        return callback(new Error('PNG, JPG만 업로드하세요'))
    }
    callback(null, true)
  },
  limits:{
        fileSize: 1024 * 1024
    }
});

var upload = multer({storage : storage});

app.get('/upload', function(요청, 응답){
    응답.render('upload.ejs')
});

app.post('/upload', upload.single('a'), function(요청, 응답){
    응답.send('업로드 완료')
});

app.get('/image/:imageName', function(요청, 응답){
    응답.sendFile( __dirname + '/public/image/' + 요청.params.imageName)
})

app.get('/socket', function(요청, 응답){
    응답.render('socket.ejs');
});

io.on('connection', function(socket){
    console.log('유저접속됨');

    socket.on('room1-send', function(data){
        io.to('room1').emit('broadcast', data)
    });

    socket.on('joinroom', function(data){
        socket.join('room1');
    });

    socket.on('user-send', function(data){
        io.emit('broadcast', data)
        
    });
    
})