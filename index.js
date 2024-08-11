
const express = require('express');
const session = require('express-session');
const mysql = require('mysql');
const address_host = 'https://port-0-node-express-lzphvuun68917d33.sel4.cloudtype.app';

const connection = mysql.createConnection({
    host : '115.23.208.112',
    user : 'web103user',
    port : '3306',
    password : '8358',
    database : 'web103'
});

const app = express();
app.use(session({
    secret: 'Xm3924Diie',            // 세션 암호화를 위한 비밀키
    resave: false,                      // 세션이 수정되지 않더라도 다시 저장할지 여부
    saveUninitialized: true,            // 초기화되지 않은 세션을 저장할지 여부
    cookie: { secure: false, httpOnly: true } // 쿠키 설정 (https로 제공되는 경우 secure: true)
}));
app.use(express.urlencoded( {extended : true } ));
app.use(express.json({
    limit : "1000mb"
}));
app.set('view engine', 'ejs');
app.set('views','./layout');

app.set('port', process.env.PORT || 3000);

function authenticateUser(username, password, callback) {
    // SQL 쿼리를 사용하여 사용자 정보를 가져옴
    connection.query('SELECT * FROM member WHERE member_id = ?', [username], (err, results) => {
        if (err) {
            return callback(err);
        }

        if (results.length === 0) {
            // 사용자가 존재하지 않으면 null 반환
            return callback(null, null);
        }

        const user = results[0];

        if(user.member_pw==password)
            callback(null, user);
        else
            callback(null, null);
    });
}

app.get('/', function(req,res){
    res.redirect("/main");
})

app.get('/main', function(req,res){
    let datas = [];
    let page=1;
    let totalCnt=0;
    let maxPage=1;
    if(req.query && req.query.page){
        page=req.query.page;
    }
    const cntPerPage=3;

    connection.query('SELECT count(*) as total FROM post where board_id=1', (err,rows)=>{
        if(err) throw err;

        connection.query('SELECT * from post where board_id=1 order by post_id DESC', (err,results)=>{
            if(err) throw err;
            //console.log("results="+results[0].post_id);
            for(let i = 0;i<cntPerPage;i++){
                //console.log("for문시작"+i);
                let date=results[i].regdate;
                let today= new Date();
                let dateStr;
                if(today.getFullYear() == date.getFullYear() &&
                today.getMonth() == date.getMonth() &&
                today.getDate() == date.getDate())
                    dateStr=date.getHours()+":"+date.getMinutes();
                else
                    dateStr=date.getFullYear()+"."+date.getMonth()+"."+date.getDate()+" "+date.getHours()+":"+date.getMinutes();
                //console.log("for문push이전"+i);
                datas.push({
                    'id': results[i].post_id,
                    'regdate': dateStr,
                    'title': results[i].title,
                    'content': results[i].content,
                    'writer': results[i].writer                        
                });
                //console.log("for문끝"+i);
                }
                res.render('./main',{
                    'datas' : datas,
                    'cnt' : datas.length,
                    'maxcnt' : cntPerPage,
                    'prevPage' : ((page-1)>0)?page-1:1,
                    'nextPage' : ((page+1)<maxPage)?page+1:maxPage,
                    'address_host' : address_host
                });
                //console.log("for문완전끝")
            }
        );
    })
});

app.get('/listpage', function(req,res){
    let datas = [];
    let page=1;
    let totalCnt=0;
    let maxPage=1;
    if(req.query && req.query.page){
        page=req.query.page;
    }
    const cntPerPage=10;

    connection.query('SELECT count(*) as total FROM post where board_id=1', (err,rows)=>{
        if(err) throw err;

        console.log("rows="+rows[0].total);
        console.log("maxcnt="+cntPerPage);
        // console.log("rows="+rows[0]['total']);
        totalCnt = rows[0]['total'];
        maxPage = Math.floor(totalCnt/cntPerPage) + ((totalCnt%cntPerPage)>0?1:0);
        console.log("maxpage="+maxPage);
        
        if(page<1){
            res.redirect("/listpage?page=1&member_id="+ID+"&member_pw="+PW);
        }
        else if(page>maxPage){
            //console.log("page>maxpage");
            res.redirect("/listpage?page="+maxPage+"&member_id="+ID+"&member_pw="+PW);
        }
        else{
            //console.log("진입");
            connection.query('SELECT * from post where board_id=1 order by post_id DESC', (err,results)=>{
                    if(err) throw err;
                    //console.log("results="+results[0].post_id);
                    let start= (page-1)*cntPerPage
                    let k=((results.length-start)<(start+cntPerPage))?(results.length-start):(start+cntPerPage);
                    console.log("k="+k);
                    for(let i = start;i<start+k;i++){
                        //console.log("for문시작"+i);
                        let date=results[i].regdate;
                        let today= new Date();
                        let dateStr;
                        if(today.getFullYear() == date.getFullYear() &&
                        today.getMonth() == date.getMonth() &&
                        today.getDate() == date.getDate())
                            dateStr=date.getHours()+":"+date.getMinutes();
                        else
                            dateStr=date.getFullYear()+"."+date.getMonth()+"."+date.getDate()+" "+date.getHours()+":"+date.getMinutes();
                        //console.log("for문push이전"+i);
                        datas.push({
                            'id': results[i].post_id,
                            'regdate': dateStr,
                            'title': results[i].title,
                            'content': results[i].content,
                            'writer': results[i].writer                        
                        });
                        //console.log("for문끝"+i);
                    }
                    res.render('./listpage',{
                        'datas' : datas,
                        'cnt' : datas.length,
                        'maxcnt' : cntPerPage,
                        'prevPage' : ((page-1)>0)?page-1:1,
                        'nextPage' : ((page+1)<maxPage)?page+1:maxPage,
                        'address_host' : address_host
                    });
                    //console.log("for문완전끝")
                }
            );
        }
    });
})

app.get('/view', function(req,res){
    let datas = [];
    const postID = req.query.id;
    let k=0;
    connection.query('SELECT * from post where board_id=1 order by post_id DESC', (err,results)=>{
        if(err) throw err;
        for(let i = 0; i<results.length; i++){
            let date=results[i].regdate;
            let dateStr;
            dateStr=date.getFullYear()+"."+date.getMonth()+"."+date.getDate()+" "+date.getHours()+":"+date.getMinutes();
            datas.push({
                'id': results[i].post_id,
                'prev_id' : 0,
                'next_id' : 0,
                'regdate': dateStr,
                'title': results[i].title,
                'content': results[i].content,
                'writer': results[i].writer                        
            });
            if(i>0){
                datas[i-1].next_id=datas[i].id;
                datas[i].prev_id=datas[i-1].id;
            }
            if(results[i].post_id==postID)
                k=i;
        }
        res.render('./view',{
            'datas' : datas,
            'i' : k,
            'address_host' : address_host
        });
        //console.log("for문완전끝")
    }
);
})

app.get('/write', function(req,res){
    res.render('write',{
        'address_host' : address_host
    })
})

app.post('/write', (req, res) => {
    const { title, content } = req.body;
    const userId = req.session.userId;

    // SQL 쿼리 작성 및 실행
    const sql = 'INSERT INTO post (title, content, regdate, board_id, writer) VALUES (?, ?, ?, ?, ?)';
    connection.query(sql, [title, content, new Date(), 1, userId], (err, results) => {
        if (err) {
            console.error('데이터베이스 삽입 중 오류 발생:', err);
            return res.status(500).send('서버 오류가 발생했습니다.');
        }
        // 성공적으로 삽입된 경우, 메인 페이지로 리다이렉트
        res.redirect('/main');
    });
});

app.get('/signpage', function(req,res){
    res.render('signpage',{
        //'datas' : datas,
        'address_host' : address_host
    })
})

app.post('/signpage', function(req, res) {
    const IDmem = req.body.IDmember;
    const PWmem = req.body.PWmember;

    console.log("Received ID: " + IDmem);
    console.log("Received Password: " + PWmem);

    // 아이디 중복 체크
    connection.query('SELECT * FROM member WHERE member_id = ?', [IDmem], (err, results) => {
        if (err) throw err;

        if (results.length > 0) {
            console.log("이미 존재하는 아이디입니다.");
            res.send('<script>alert("이미 존재하는 아이디입니다."); window.location.href="/signpage";</script>');
        } else {
            // 아이디가 중복되지 않으면 회원 정보 삽입
            connection.query('INSERT INTO member (member_id, member_pw) VALUES (?, ?)', [IDmem, PWmem], (err, results) => {
                if (err) throw err;

                console.log("회원가입 성공");
                res.redirect('/loginpage');
            });
        }
    });
});

app.get('/loginpage', function(req,res){
    res.render('loginpage',{
        //'datas' : datas,
        'address_host' : address_host
    })
})

app.post('/loginpage', function(req, res) {
    const { username, password } = req.body;
    console.log("username: "+username+" password: "+password)
    authenticateUser(username, password, (err, user) => {
        if (err) {
            return res.status(500).send('Internal Server Error');
        }

        if (user) {
            // 로그인 성공: 세션에 사용자 ID 저장
            req.session.userId = user.member_id;
            res.redirect('/main');
        } else {
            // 로그인 실패: 로그인 페이지로 리다이렉트
            res.redirect('/loginpage');
        }
    });
});

// app.post('/signpage', function(req,res){
//     console.log("---------------------------------");
//     console.log("req: "+req);
//     console.log("req[0]: "+req[0]);
//     console.log("req.body: "+req.body);
//     console.log("req.body[0]: "+req.body[0]);
//     console.log("req.body.IDmem: "+req.body.IDmem);

//     // connection.query('SELECT * from member', (err,results)=>{
//     //     for(var i=0;i<results.length;i++){
//     //         console.log("req.body: "+req.body);
//     //         if(results[i].member_id==req.body.IDmem)
//     //             return res.alert("이미 있는 아이디입니다.");
//     //     }
//     // })
//     // connection.query('insert into member (member_id, member_pw) value (?,?)',[req.body.IDmem,req.body.PWmem], (err, results)=>{
//     //     if(err) throw err;
//     //     return res.redirect('/login');
//     // });
// })

app.listen(app.get('port'), ()=>{
    console.log("express server running on port 3000");
})

/*
var setCookie = function(name, value, exp) {
      var date = new Date();
      date.setTime(date.getTime() + exp*24*60*60*1000);
      document.cookie = name + '=' + value + ';expires=' + date.toUTCString() + ';path=/';

};

var getCookie = function(name) {
    var value = document.cookie.match('(^|;) ?' + name + '=([^;]*)(;|$)');
    return value? value[2] : null;
};

var deleteCookie = function(name) {
    document.cookie = name + '=; expires=Thu, 01 Jan 1999 00:00:10 GMT;';
}
*/
