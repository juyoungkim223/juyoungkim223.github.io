---
layout: post
title: "Unity Resource Folder의 메모리 사용에 관하여"
date: 2023-04-29 18:48:28 +0900
tags: unity 
categories: unity
---
* TOC
{:toc}
Unity Resource Folder의 메모리 사용에 관하여.


## Unity Resource Folder 문제 상황
https://docs.unity3d.com/Manual/BestPracticeUnderstandingPerformanceInUnity6.html


unity 문서에서는 Resource Folder의 적절하지 못한 사용으로 폴더 내부 크기가 커졌을 때의 문제 상황을 아래와 같이 정의했다.
1. 프로젝트 빌드 크기 증가

2. 프로젝트 초기 실행 시간 증가

3. 과도한 메모리 사용



3번의 과도한 메모리 사용이 궁금하다. 테스트를 통해 확인하고자 하는 점은 2가지이다.
1. Resource Folder에 들어간 모든 애셋(image, prefab 등 )은 프로그램 시작부터 실행 과정 전체에서 메모리에 올라가 있다
2. Resource.Load() 시에만 메모리에 할당되게 되며 그 이후에 unLoad()를 하면 다시 메모리에서 해제될 수 있나. GC를 통한 동작을 기대한다.

https://docs.unity3d.com/Packages/com.unity.memoryprofiler@1.0/manual/index.html
https://docs.unity3d.com/kr/2021.3/Manual/ProfilerMemory.html


아직 실험단계의 패키지인데 유니티 공식문서의 글을 참고하여 package manager를 통해 설치했다.

## 테스트 항목
테스트는 Resources 폴더에 1GB 가량의 애셋을 추가하기 전과 후의 메모리 사용량을 테스트 했다.  
### 테스트 환경  
- unity version: 2021.3.16f1   
- 윈도우11 환경 - Unity Editor를 통해 Play 버튼을 눌러 게임을 시작하고 아무런 입력 없는 상태에서 진행했다.  
- Resource 폴더 하위에 약 40MB 애셋을 포함하도록 함.  

![Alt text](../../../../static/img/230429-unity-resources/230429-1.png)

Resource 폴더 하위에 약 1.03GB 애셋 추가함.  
![Alt text](../../../../static/img/230429-unity-resources/230429-2.png)

주황색으로 표시된 Tracked Memory가 1.2GB 가량 증가했다. 1.04GB의 리소스를 추가했는데 약간의 오차가 발생했다.
In use 와 Reserved 중 크게 증가한 부분은 Reserved다.  
Reserved 영역은 메모리 pool 할당을 위해 예약되어 있는 메모리이다.  
메모리 pool에 대해 간단하게 설명하면, 메모리 pool은 동적할당과 다르게 미리 pool 안에 메모리영역을 가지고 있는 상태로 new, delete 등을 통한 메모리 단편화 문제는 없지만 일정공간을 차지하고 있게된다.  
Resource 폴더 하위에 애셋을 포함했을 뿐 Resource.Load()를 실행하진 않았다. 리소스 폴더 하위에 위치한 애셋을 가져오기 위해서 Load() 를 사용하지 않아도 사용하고 있는 메모리 크기가 늘어나게 된다.  
Resource 폴더 내부의 모든 애셋을 메모리에 Load한다고 볼 수 있다.  

테스트 과정에서 Memory Profiler가 아직 실험단계기 때문에 테스트 결과에 참고해야한다.

## 정리
지금까지 개발하면서 Resource 폴더 내부에 Prefab과 json파일, 이미지 파일 등을 사용했다. 가장 컸던 Resource 폴더의 사이즈가 100MB 보다 작았다. 이정도라면 빌드 사이즈와 메모리 로딩에도 큰 문제가 없지만 일부 기기에서는 저하가 발생할 수 있고 로딩해야하는 리소스가 많아진다면 메모리에 사용량이 많아지고 이에 따라 성능에 문제가 생길 것이다.  
그렇다면 어플리케이션 startup 시간에 메모리 전부 로딩이 아닌 동적으로 필요한 리소스만 메모리에 로드하기 위한 방법으로는 Addressables (<https://blog.unity.com/kr/games/addressable-asset-system>) 을 이용할 수 있다.
또 다른 대안으로는 AssetBundle이 있지만 Resource 처럼 간단하게 사용할 수 있는 방식이 아니기 때문에 많이 사용되는 방식이 아니다.

