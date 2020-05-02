---
layout: post
title: "odroid에 ubuntu 설치"
date: 2020-05-02 01:14:28 -0400
categories: odroid ubuntu
---
오드로이드에 우분투 설치에 앞서 설치를 지원하는 우분투 버전 정보를 알기 위해 지원하는 커널을 확인을 하겠습니다.  
공식사이트에서 hc2의 스펙을 가져왔습니다.  

odroid hc2 원보드 pc의 스펙은 이렇습니다.
Key features
- Samsung Exynos5422 Cortex-A15 2Ghz and Cortex-A7 Octa core CPUs  
- 2Gbyte LPDDR3 RAM PoP stacked  
- SATA-3 port for 3.5inch or 2.5inch HDD/SSD  storage up to 27mm thickness  
- Gigabit Ethernet port  
- USB 2.0 Host  
- UHS-1 capable micro-SD card slot for boot media  
- Size : 197 x 115 x 42 mm approx.(Aluminium cooling frame size)  
- Linux server OS images based on modern Kernel 4.14 LTS  
cpu는 삼성 갤럭시 S5에 사용되는 cpu입니다.  

# os 부팅 디스크
HC2가 지원하는 OS는 android와 ubuntu입니다. HC2는 NAS용으로 많이 사용하기 때문에 NAS용 운영체제인(OpenMediaValt)를 사용하지만 웹서버, NAS로 이용하기 위해 Ubuntu를 설치하겠습니다.  
### 설치 과정
1. 준비
https://wiki.odroid.com/odroid-xu4/os_images/linux/ubuntu_4.14/ubuntu_4.14
오드로이드 공식사이트에서 우분투 이미지 파일을 다운로드합니다.
- os 이미지 다운로드
ubuntu-18.04.3-4.14-minimal-odroid-xu4-20190910.img.xz 을 다운로드했습니다.
- 이미지 writer
micro sd카드에 os 이미지를 쓰기 위해 이미지 writer를 다운로드합니다.
https://www.balena.io/etcher/
![](./static/img/20200502-odroid에 ubuntu설치/2020502-odroid이미지writer.JPG)
2. 설치  
sd 카드, 랜선을 꼽은 후 전원을 연결하면 odriod가 부팅하고 os를 설치합니다.
설치는 자동으로 됩니다. odroid용 ubuntu는 ssh서버가 자동으로 실행되므로 ssh접속을 통해 사용할 수 있습니다.  

3. 접속  
odroid ip는
공유기 설정에서 연결된 ip에서 ssh 서버의 내부ip가 나오지 않는다. advanced port scanner 설치하여 내부 ip확인 후 내부망으로 연결 시 내부포트 외부포트를 22번으로 포트포워딩 설정을 해준다.

putty로 ssh 접속을 한다.  
초기 id: root  
초기 pw: odroid  

접속 후 root 계정의 비밀번호를 ``sudo passwd root`` 명령어로 바로 변경해주겠습니다.

여기까지 진행하면 odroid에 ubuntu설치는 완료됩니다.
