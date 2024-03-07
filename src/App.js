/* eslint-disable */
import React, { useState, useEffect } from "react";
import { Routes, Route, Link, useNavigate } from "react-router-dom";
// css
import "./styles/App.css";
// img
import storeIco from "./assets/img/home/nav-icon-store.png";
import inventoryIco from "./assets/img/home/nav-icon-collections.png";
import hamster from "./assets/img/hamster.jpg";
// pages
import Login from "./pages/Login";
import Main from "./pages/Main";
import Board from './pages/Board';
// components
import IconSetModal from './components/modals/IconSetModal';
import MyInfoModal from './components/modals/MyInfoModal';
import axios from "axios";
import Messenger from "./components/Messenger";


function App() {

  // state
  // DB로부터 값을 받아서 넣을 곳(icons는 mysql에서 TEXT타입으로 하면 문자열배열로 나타낼수있음)
  const [userData, setUserData] = useState({
    logined: true,
    icon: hamster,
    icons: [hamster, hamster],
    nickname: '유저닉네임',
    profileMessage: '상태메시지',
    status: undefined,
    username: 'ID',
    password: 'password',
    confirmPassword: 'password',
    address: {
      zonecode: 'zonecode',
      fullAddress: 'fullAddress',
      detailAddress: 'detailAddress'
    }
  });
  
  const boardNames = ['자유게시판', '인기게시판', '이슈게시판', '기념게시판', '신고게시판'];
  const navigate = useNavigate();
  const [redirected, setRedirected] = useState(false);
  
  useEffect(() => {
    // 서버에서 사용자 정보를 가져오는 비동기 함수
    const fetchUserData = async () => {
      
      // userInfo 스테이트가 userData로 바뀌었음!!
      // 확인 바람!!

      try {
        // axios로 서버에 요청하여 사용자 정보를 가져오기
        const response = await axios.get('http://localhost:3001/getUserInfo', { withCredentials: true });
        const userData = response.data.userInfo; // 서버에서 받아온 데이터 구조에 따라 수정

        console.log('UserData from server:', userData);  // 서버에서 받아온 데이터 확인
        setUserData(userData);
      } catch (error) {
        console.error('Error fetching user data:', error);
      }
    };

    // 컴포넌트가 마운트될 때 한 번만 실행되도록 함
    fetchUserData();
  }, []);

  // 로그아웃 기능 임시 함수
  const handleLogout = () => {
    axios.post('http://localhost:3001/logout')
      .then(response => {
        if (response.data.success) {
          // 클라이언트에서도 쿠키 및 세션 삭제 후 Login 페이지로 리다이렉트
          document.cookie = 'isLoggedIn=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
          document.cookie = 'username=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
          sessionStorage.removeItem('isLoggedIn');
          sessionStorage.removeItem('username');
          navigate(response.data.redirectPath);
  
          console.log('로그아웃 확인 콘솔:', {
            isLoggedIn: sessionStorage.getItem('isLoggedIn'),
            username: sessionStorage.getItem('username')
          });
  
        } else if (response.data.sessionExpired) {
          console.log('세션이 이미 만료되었습니다.');
        } else {
          console.error('로그아웃 실패:', response.data.message);
        }
      })
      .catch(error => {
        console.error('로그아웃 요청 오류:', error);
      });
  };

  return (
    <>
      <Routes>
        {/* <Route path="/"/>    로그인 세션이 유효하면 home으로 연결, 유효하지 않으면 login으로 연결 */}
        <Route path="/login" 
          element={
            <>
              <Login/>
            </>
          }
        />
        <Route
          path="*"
          element={
            // 로그인되어있으면 그대로(완료), 안되어있으면 /login으로 보내줘야함(미완)
            userData.logined &&
            <div className="homeBody">
              <header className="header">
                <div className="headerBtnBox">
                  <div className="leftBtnBox">
                    <button className="noticeBtn mouseover">!</button>
                    <Link to="/home">
                      <button className="homeBtn mouseover">홈</button>
                    </Link>
                    {boardNames.map((boardName, index) => (
                      <Link key={index + 1} to={`/board/${index + 1}`} state={{boardId: index+1}}>
                        <button className="boardBtn mouseover">{boardName}</button>
                      </Link>
                    ))}
                  </div>
                  <div className="rightBtnBox">
                    <MyInfoModal data={userData} setData={setUserData}/>
                    <button className="inventoryBtn mouseover">
                      <img src={inventoryIco} alt="" />
                    </button>
                    <button className="storeBtn mouseover">
                      <img src={storeIco} alt="" />
                    </button>
                  </div>
                </div>
                <div className="headerProfileBox">
                  {/* hamster에 현재 로그인한 계정의 아이콘 받아오기 */}
                  <IconSetModal img={<img className="userIcon" src={userData.icon} alt="" />}/>
                  <div className="nameBox">
                    <p className="nickname">{userData.nickname}</p>
                    <p className="profileMessage">"{userData.profileMessage}"</p>
                  </div>
                  <button className="logoutBtn" onClick={handleLogout}>logout</button>
                </div>
              </header>
              <main className="main">
                <Messenger/>
                <Main/>
              </main>
              <footer>

              </footer>
            </div>
          }
        />
      </Routes>
    </>
  );
}

export default App;
