---
layout: post
title: "putty connection type"
date: 2020-04-25 01:14:28 -0400
categories: putty connection
---

# putty connection type
putty를 사용해 원격세션 접속을 하려는 경우 연결프로토콜로 5가지를 선택할 수 있다.

raw, telnet, Rlogin, SSH, Serial

1. raw  
전송 계층에서 tcp 연결을 통한 소켓통신으로 서버와 연결한다.
텔넷서버와 차이점은 텔넷은 응용계층 프로토콜이고 raw tcp연결은 전송계층프로토콜이다.
스트림이 unbuffered 된 상태로 서버로 전송된다. 에코서버로 사용 시 단일문자 응답을 클라이언트가 받게된다. 텔넷은 line-buffering으로 동작한다.


2. telnet  
텔넷은 서버와 통신 시 tcp연결을 통해 데이터를 전송한다.
line-buffering, 문자열 에코 등과 같은 기능을 사용할 수 있다.
unix 기반 컴퓨터에서 telnet command로 서버에 바로 연결할 수 있다. 예를들면 윈도우에서도 cmd창에서 ``telnet aaa.example.com 8080``로 연결 할 수 있다.
이 방식으로 메일서버의 서비스를 실행할 수 있다.
e.g)``telnet mailServer.example.com 25``

3. Rlogin  
Rlogin은 ssh보다 보안적으로 안전하지 않은 방식으로 서버에 접속한다. 따라서 서버계정에 공격자가 공격을 허용하는것이 가능하다. 모든 공격은 공격자가 클라이언트에 대한 접속을 가지고 있는 경우를 말합니다.

4. SSH  
secure shell이란 의미이며 도청, 하이재킹, 다른공격에 보호할 수 있는 강력한 암호화를 사용한다. 텔넷,Rlogin은 ssh보다 오래된 프로토콜로 적은 보안을 제공한다.
ssh와 Rlogin은 비밀번호없이 서버에 접속할 수 있게 해준다.

5. Serial  

## ssh, telnet, Rlogin의 공통점 : 다른컴퓨터에서 멀티-유저 컴퓨터에 로그인하는 방식
멀티유저 컴퓨터는 Unix나 VMS(<https://ko.wikipedia.org/wiki/OpenVMS>)와 같은 OS기반 컴퓨터를 말한다. 이 말은 윈도우 컴퓨터(서버)로 접속하는 경우에 윈도우만의 방식으로 접속해야한다.

 즉 위 3가지 연결방식은 윈도우서버에는 사용할 수 없다. 윈도우서버에 접속은 mstsc를 이용해야한다. 윈도우OS단에서 제공하는 기능이다.

telnet, ssh, Rlogin은 모두 응용계층 프로토콜로 http요청 클라이언트에서 요청한다.

네트워크 연결을 하는 경우 ssh 연결이 가장 보안적으로 안전하다. 클라이언트와 서버 모두 같은 방화벽안에 있다면 telnet이나 Rlogin도 좋지만 ssh가 가장 추천하는 방식이다.

### 참고
- 연결 프로토콜 관련
<https://documentation.help/PuTTY/you-what.html>  
<https://www.ssh.com/ssh/putty/putty-manuals/0.68/Chapter3.html#using-rawprot>
- 스트림 버퍼
<https://stackoverflow.com/questions/36573074/what-do-fully-buffered-line-buffered-and-unbuffered-mean-in-c>


[jekyll-docs]: https://jekyllrb.com/docs/home
[jekyll-gh]:   https://github.com/jekyll/jekyll
[jekyll-talk]: https://talk.jekyllrb.com/
