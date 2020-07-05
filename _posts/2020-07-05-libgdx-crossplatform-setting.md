---
layout: post
title: "libgdx 크로스플랫폼 개발 셋팅"
date: 2020-07-05 22:13:28 +0900
categories: libgdx android
---
클라이언트 2d 게임 개발을 위한 엔진을 찾고 있었습니다.

## 기존 사용 엔진과 비교
제가 사용해봤던 언리얼엔진과 어떤점이 다른지 알아보기 위해 libgdx프레임워크를 간단히 비교해보겠습니다.  

### 언리얼 엔진

- 언리얼엔진은 그래픽처리가 많이 필요한 3d개발 게임에 적합하고 블루프린트로 테스트를 위한 개발을 빠르게 개발할 수 있는 장점(배포를 위한 개발로는 cpp가 효율적)  
- 안드로이드, ios, 콘솔등 모든 플랫폼 빌드가 가능합니다.  
- cpp기반으로 개발 할 때는 엔진 단에서 제공하는 클래스인 PlayerController, Pawn, GameInstance, GameMode, GameState 등을 상속해 api를 이용한 게임개발이 가능합니다.

### libgdx 프레임워크

아직 사용해보지 않아서 조사한 내용으로만 적어보면  
- libgdx는 데스크탑 PC로 개발하고 다른 플랫폼에서 실행되는 구조입니다. 크로스플랫폼을 지원하지만 언리얼 엔진처럼 콘솔빌드는 안 됩니다.  
- 안드로이드 vm(libgdx 공식 홈페이지에서는 Dalvik(달빅)이라고 적혀있습니다. ``https://libgdx.badlogicgames.com/``), 자바스크립트 런타임 vm에서의 가비지 컬렉션을 피하는 api 함수들을 제공한다고 합니다.  
 런타임에 c,cpp로 개발 또는 어셈블리 코드를 호출하는 JNI를 사용해서 api를 디자인해 가비지 컬렉션 횟수를 줄이고 이는 stop the world(VM에서 가비지 컬렉션 시간) 호출을 줄여 빠르게 디자인된 api함수를 제공하는 것 같아 보입니다.
- 언리얼의 FVector 처럼 자체 컬렉션을 제공한다고 합니다.  
- 아파치 2.0 라이선스가 적용된 오픈소스로 완전 무료입니다.  
- 언어는 java로 개발합니다.


## Backend에 따른 내부 동작 방식은?
``https://en.wikipedia.org/wiki/LibGDX`` 위키에 보면
데스크탑, 안드로이드, 웹, ios를 Backend라고 부르네요.  
Backend(데스크탑, 안드로이드, 웹, ios)에 하나의 코드로 동작가능한 크로스플랫폼을 제공하지만 초기 셋팅에서는 필요한 라이브러리가 다릅니다.

- 데스크탑 : 자바로 개발하며 LWJGL 3 라이브러리를 사용합니다.
- html5 :  Google Web Toolkit (GWT)이 자바를 자바스크립트로 변환해 브라우저의 런타임으로 실행해줍니다.
- 안드로이드 : 안드로이드는 자바로 컴파일하니까 androidSDK만 있으면 됩니다.
- ios : 자마린에서 개발하는 RoboVM을 커스텀 해 자바를 컴파일 해 ios에서 동작하게 하는 크로스플랫폼 방식을 사용합니다.

## 개발 세팅
안드로이드 스튜디오로 셋팅해보겠습니다.
다운로드 링크 : ``https://libgdx.badlogicgames.com/download.html``

jar파일을 다운로드하고 실행해 프로젝트를 생성했습니다.

![](../../../../static/img/20200705-libgdx-setting-for-android/libgdx-creator.JPG)  

안드로이드 스튜디오로 프로젝트를 생성하면 다음과 같이 프로젝트 구조를 확인할 수 있습니다.
![](../../../../static/img/20200705-libgdx-setting-for-android/projectstructor.JPG)  

libgdx와 안드로이드 스튜디오에서의 구성에 대해 다음과 같이 알아보겠습니다.
1. libgdx로 프로젝트를 생성하고 libgdx가 구성하는 프로젝트의 디렉터리에 대해 알아보겠습니다.
안드로이드 스튜디오를 사용해 libgdx 프로젝트를 구성했습니다.

## 프로젝트 구조
폴더 단위로 구분해서 설명하겠습니다.
4개의 폴더와 하나의 파일에 대해서만 설명하겠습니다.
### 폴더
1. core : 작성한 소스코드를 컴파일한 클래스파일, 소스코드가 사용하는 라이브러리와 MANIFEST파일을 가지고 있습니다.  
2. .idea : 유저가 설정한 셋팅정보들을 가지고 있음. 안드로이드 스튜디오가 jetbrain이 만든 통합개발환경이니 인텔리제이 프로젝트와 동일하게 .idea폴더가 있습니다. 인텔리제이로 동일하게 구성한다면 libgdx프로젝트를 생성할 때 Desktop을 Subproject로 생성하면 크로스플랫폼을 지원하니까 데스크탑으로 실행할 수 있습니다.  
3. android, ios, html, desktop : libgdx로 프로젝트 생성 시 지정한 backend
4. .gradle: gradle 캐시 정보를 가진다.

### 파일
settings.gradle : 프로젝트를 구성하는데 필요한 모든 모듈이 있습니다.
```.gradle
include 'desktop', 'android', 'ios', 'html', 'core'
```
- core 모듈: 크로스플랫폼으로 동작할 수 있게 해주는 모듈
이 모듈도 프로젝트 생성 시 자동 생성되는 폴더들과 마찬가지로 libgdx로 프로젝트 생성 시 지정한 클라이언트 (libgdx로 프로젝트 생성 시 다른 모듈들을 추가한다면 ios, html, desktop 모듈도 생성됩니다.)


### 안드로이드 애뮬레이터에서 프로젝트 실행
![](../../../../static/img/20200705-libgdx-setting-for-android/project-running.JPG)  
애뮬레이터를 실행시키고 프로젝트를 실행해 기본 화면을 볼 수 있습니다.

### 인텔리제이에서 데스크탑 프로그램으로 실행
데스크탑 실행 시 별다른 설정없이 Desktop에서 프로그램 실행을 하면 됩니다.
![](../../../../static/img/20200705-libgdx-setting-for-android/desktop-running.JPG)  
